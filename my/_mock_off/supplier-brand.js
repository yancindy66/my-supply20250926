import fs from 'fs';
import path from 'path';

const dataDir = path.resolve(process.cwd(), 'mock', 'data');
const file = path.resolve(dataDir, 'supplier-brand.json');
const stdFile = path.resolve(dataDir, 'platform-standard.json');
function ensure(){ try{ if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir,{recursive:true}); }catch{} }
function load(){ try{ if(fs.existsSync(file)) return JSON.parse(fs.readFileSync(file,'utf8')); }catch{} return []; }
function save(data){ try{ ensure(); fs.writeFileSync(file, JSON.stringify(data,null,2),'utf8'); }catch{} }
function loadStandards(){ try{ if(fs.existsSync(stdFile)) return JSON.parse(fs.readFileSync(stdFile,'utf8')); }catch{} return []; }

let brands = load();
let standards = loadStandards();

function nextId(){ return Math.max(0, ...brands.map(b=>b.id||0)) + 1; }
function dateStr(){ const d=new Date(); const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); return `${y}${m}${day}`; }
function codeOf(ct){ if(ct==='棉花') return 'CF'; if(ct==='红枣') return 'CJ'; return 'OT'; }
function gradeCode(gradeName){ return gradeName?.match(/(\d+)/)?.[1] ? `L${gradeName.match(/(\d+)/)[1][0]}` : 'L1'; }
function genPlatformBrandCode(std){
  const date = dateStr();
  const prefix = codeOf(std.commodity_type);
  // 平台备案：CF+年月日 / CJ+年月日
  return `${prefix}${date}`;
}
function genProductIdByStd(std){
  const d=new Date();
  const yy=String(d.getFullYear()).slice(-2);
  const mm=String(d.getMonth()+1).padStart(2,'0');
  const prefix = codeOf(std.commodity_type);
  // 商品ID：商品代码 + 年后二位 + 月两位
  return `${prefix}${yy}${mm}`;
}

function mockParseReport(name, base64, std){
  // 简化：文件名包含 fail 则判定不通过；否则通过
  const pass = !String(name||'').toLowerCase().includes('fail');
  const ct = std?.commodity_type || '棉花';
  if (ct === '红枣') {
    const measured = { '糖度_Brix_%':72, '含水率_%':22, '每公斤颗粒数':260, '霉变率_%':0.5, '破损率_%':2.5 };
    const profile = {
      processor_name: '示例加工厂',
      processor_address: '新疆库尔勒经济区88号',
      contact_person: '李四',
      date_brix: 72, date_moisture_percent: 22, date_pieces_per_kg: 260, date_mildew_percent: 0.5, date_breakage_percent: 2.5
    };
    return { pass, measured, profile };
  }
  // 棉花默认
  const measured = { '纤维长度_mm':29, '马克隆等级':'B', '强度_cN/tex':28.8, '长度整齐度_min':83 };
  const profile = {
    processor_name: '示例加工厂',
    processor_address: '新疆乌鲁木齐高新区88号',
    contact_person: '张三',
    fiber_length: measured['纤维长度_mm'],
    break_strength: measured['强度_cN/tex'],
    micronaire: 4.1,
    uniformity_index: measured['长度整齐度_min'],
    no_foreign_fiber: true,
    color_grade_pct: { '11': 60, '21': 30, '31': 10 },
    ginning_quality_pct: { P1: 40, P2: 50, P3: 10 }
  };
  return { pass, measured, profile };
}

function validateAgainstSpec(std, measured){
  // 只对存在的键进行宽松校验
  const spec = std.specifications||{};
  for (const k of Object.keys(measured||{})){
    const v = measured[k]; const s = spec[k];
    if (s==null) continue;
    if (Array.isArray(s) && typeof s[0]==='number' && typeof s[1]==='number'){
      if (!(v>=s[0] && v<=s[1])) return false;
    } else if (Array.isArray(s)){
      if (!s.includes(v)) return false;
    } else if (typeof s==='number'){
      if (!(v>=s)) return false;
    }
  }
  return true;
}

export default [
  // 列表/查询（支持按 code 精确查询）
  { url:'/api/supplier_brand', method:'get', response:({ query })=>{
      const code = String(query?.code||'').trim();
      const page = parseInt(query?.page||'1',10)||1;
      const pageSize = parseInt(query?.pageSize||'20',10)||20;
      let list = brands;
      if (code) list = brands.filter(b=> b.platform_brand_code===code);
      const total = list.length;
      const pageList = list.slice((page-1)*pageSize, (page-1)*pageSize+pageSize);
      return { code:0, data:{ list: pageList, total, page, pageSize } };
    }
  },
  // 详情
  { url:'/api/supplier_brand/:id', method:'get', response:({ params })=>{
      const b = brands.find(x=> String(x.id)===String(params?.id));
      if (!b) return { code:1, msg:'未找到' };
      return { code:0, data: b };
    }
  },
  // 解析质检报告并与平台标准进行比对（预审）
  { url:'/api/supplier_brand/parse_report', method:'post', response:({ body })=>{
      const platform_standard_id = Number(body?.platform_standard_id||0);
      const std = standards.find(s=> Number(s.id)===platform_standard_id);
      if (!std) return { code:1, msg:'平台标准不存在' };
      const parsed = mockParseReport(body?.quality_report_name, body?.quality_report_base64, std);
      if (!parsed.pass) return { code:1, msg:'质检报告识别失败或不合格' };
      const spec = std.specifications||{};
      const measured = parsed.measured||{};
      const rows = Object.keys(measured).map(k=>{
        const m = measured[k];
        const s = spec[k];
        let ok = true; let expected = '';
        if (Array.isArray(s) && typeof s[0]==='number' && typeof s[1]==='number'){
          ok = (m>=s[0] && m<=s[1]); expected = `${s[0]} ~ ${s[1]}`;
        } else if (Array.isArray(s)){
          ok = s.includes(m); expected = s.join('/');
        } else if (typeof s==='number'){
          ok = m>=s; expected = `≥ ${s}`;
        } else {
          expected = s==null? '-' : String(s);
        }
        return { metric: k, expected, measured: m, ok };
      });
      const pass = rows.every(r=> r.ok);
      return { code:0, data: { rows, pass, profile: parsed.profile } };
    }
  },
  { url:'/api/supplier_brand', method:'post', response:({ body })=>{
      const brand_name = String(body?.brand_name||'').trim();
      const platform_standard_id = Number(body?.platform_standard_id||0);
      const supplier_id = Number(body?.supplier_id||0)||1;
      const custom_premium = Number(body?.custom_premium||0)||0;
      if (!brand_name || !platform_standard_id) return { code:1, msg:'参数不完整' };
      if (brands.some(b=> b.supplier_id===supplier_id && b.brand_name===brand_name)) return { code:1, msg:'该客户品牌名已存在' };
      const std = standards.find(s=> Number(s.id)===platform_standard_id);
      if (!std) return { code:1, msg:'平台标准不存在' };

      const parsed = mockParseReport(body?.quality_report_name, body?.quality_report_base64, std);
      if (!parsed.pass) return { code:1, msg:'质检报告识别失败或不合格' };
      const ok = validateAgainstSpec(std, parsed.measured);
      if (!ok) return { code:1, msg:'质检报告数据与所选等级不符' };

      const platform_brand_code = genPlatformBrandCode(std);
      const item = { id: nextId(), supplier_id, brand_name, platform_standard_id, custom_premium, platform_brand_code, status:'已上架', quality_report_url:'', _date: dateStr() };
      brands.push(item); save(brands);
      // 同步写回到产品表
      try{
        const pfile = path.resolve(dataDir, 'products.json');
        const plist = fs.existsSync(pfile)? JSON.parse(fs.readFileSync(pfile,'utf8')): [];
        const nowId = Math.max(0, ...plist.map((p)=>p.id||0)) + 1;
        const product_id = genProductIdByStd(std);
        const baseProduct = {
          id: nowId,
          product_id,
          species: std.commodity_type||'棉花',
          product_name: brand_name,
          short_code: '',
          production_year: new Date().getFullYear(),
          package_spec: '200kg/包',
          origin_area: '新疆',
          status: '上架',
          platform_standard_id,
          platform_standard_grade_name: std.grade_name,
          platform_brand_code,
          platform_base_premium: std.base_premium
        };
        plist.push(baseProduct);
        fs.writeFileSync(pfile, JSON.stringify(plist,null,2),'utf8');
        return { code:0, data: { brand_name, platform_brand_code, status: item.status, product_db_id: nowId, product_id } };
      }catch{
        return { code:0, data: { brand_name, platform_brand_code, status: item.status } };
      }
    }
  },
  // 更新
  { url:'/api/supplier_brand/:id', method:'put', response:({ params, body })=>{
      const idx = brands.findIndex(b=> String(b.id)===String(params?.id));
      if (idx===-1) return { code:1, msg:'未找到' };
      const updates = {};
      if (body?.brand_name!=null) updates.brand_name = String(body.brand_name).trim();
      if (body?.custom_premium!=null) updates.custom_premium = Number(body.custom_premium)||0;
      brands[idx] = { ...brands[idx], ...updates };
      save(brands);
      return { code:0, data: brands[idx] };
    }
  },
  // 删除
  { url:'/api/supplier_brand/:id', method:'delete', response:({ params })=>{
      const before = brands.length;
      brands = brands.filter(b=> String(b.id)!==String(params?.id));
      save(brands);
      return { code:0, data:{ removed: before - brands.length } };
    }
  }
];


