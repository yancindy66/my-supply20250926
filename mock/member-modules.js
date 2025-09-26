import fs from 'fs';
import path from 'path';

function makeStore(name){
  const dataDir = path.resolve(process.cwd(), 'mock', 'data');
  const file = path.resolve(dataDir, `${name}.json`);
  const ensure = () => { if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true }); };
  const load = () => { try { if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file,'utf8')); } catch{} return null; };
  const save = (data)=>{ try { ensure(); fs.writeFileSync(file, JSON.stringify(data,null,2),'utf8'); } catch{} };
  let items = load() || [];
  const persist = () => save(items);
  return {
    list(query){
      const keyword = String(query?.keyword||'').toLowerCase();
      const page = parseInt(query?.page||'1',10)||1;
      const pageSize = parseInt(query?.pageSize||'10',10)||10;
      const sortBy = String(query?.sortBy||'');
      const sortOrder = (String(query?.sortOrder||'asc').toLowerCase()==='desc')?'desc':'asc';
      const filtered = keyword? items.filter((o)=> Object.values(o).some(v=>String(v||'').toLowerCase().includes(keyword))) : items;
      const sorted = sortBy? [...filtered].sort((a,b)=>{
        const av=a[sortBy], bv=b[sortBy];
        const as=String(av??'').toLowerCase();
        const bs=String(bv??'').toLowerCase();
        if (as===bs) return 0; return sortOrder==='asc' ? (as>bs?1:-1) : (as<bs?1:-1);
      }): filtered;
      const total = sorted.length;
      const list = sorted.slice((page-1)*pageSize, (page-1)*pageSize+pageSize);
      return { code:0, data:{ list, total, page, pageSize } };
    },
    detail(id){ const item = items.find((x)=> String(x.id)===String(id)); return { code:item?0:1, data:item||null } },
    create(body){
      const id = Math.max(0, ...items.map((i)=>i.id||0)) + 1;
      const name = String(body?.name||'').trim();
      if (!name) return { code:1, msg:'名称必填' };
      // 自动编码
      const prefixMap = { 'financial-institutions':'FIN', 'guarantee-agencies':'GUA', 'quality-agencies':'QLT', 'supervised-warehouses':'WHS' };
      const prefix = prefixMap[name] || 'OBJ';
      const nums = items.map(i=> String(i.code||'')).map(c=> c.startsWith(prefix+'-')? parseInt(c.slice(prefix.length+1),10):NaN).filter(Number.isFinite);
      const next = (nums.length? Math.max(...nums):0) + 1;
      const code = `${prefix}-` + String(next).padStart(5,'0');
      const item = { id, code, ...body, name };
      items.push(item); persist();
      return { code:0, data:item };
    },
    update(body){
      const idx = items.findIndex((i)=> String(i.id)===String(body?.id));
      if (idx===-1) return { code:1, msg:'未找到' };
      const name = String(body?.name ?? items[idx].name).trim();
      items[idx] = { ...items[idx], ...body, name }; persist();
      return { code:0, data:items[idx] };
    },
    delete(body){ items = items.filter((i)=> String(i.id)!==String(body?.id)); persist(); return { code:0, msg:'删除成功' } },
    _get(){ return items; },
    _set(v){ items=v; persist(); }
  };
}

const fi = makeStore('financial-institutions');
const ga = makeStore('guarantee-agencies');
const qa = makeStore('quality-agencies');
const sw = makeStore('supervised-warehouses');

// 预置金融机构样例数据（首次为空时注入，不会覆盖已有数据）
if ((fi._get() || []).length === 0) {
  fi._set([
    { id: 1,  name: '中信银行北京分行',  license_number: 'LIC20240001', type: '商业银行', status: '合作中',  contact_person: '张敏',  contact_phone: '010-88880001', address: '北京市东城区长安街1号' },
    { id: 2,  name: '中国银行上海分行',  license_number: 'LIC20240002', type: '商业银行', status: '合作中',  contact_person: '李雷',  contact_phone: '021-66660002', address: '上海市浦东新区世纪大道88号' },
    { id: 3,  name: '国家开发银行江苏分行', license_number: 'LIC20240003', type: '政策性银行', status: '合作中', contact_person: '王芳',  contact_phone: '025-55550003', address: '南京市鼓楼区中山路100号' },
    { id: 4,  name: '交通银行深圳分行',    license_number: 'LIC20240004', type: '商业银行', status: '已暂停',  contact_person: '赵强',  contact_phone: '0755-77770004', address: '深圳市福田区深南大道6006号' },
    { id: 5,  name: '光大银行杭州分行',    license_number: 'LIC20240005', type: '商业银行', status: '合作中',  contact_person: '周洁',  contact_phone: '0571-99990005', address: '杭州市西湖区文一路66号' },
    { id: 6,  name: '某某信托有限公司',    license_number: 'LIC20240006', type: '信托公司', status: '合作中',  contact_person: '陈浩',  contact_phone: '010-82000006', address: '北京市海淀区知春路9号' },
    { id: 7,  name: '某某商业保理有限公司', license_number: 'LIC20240007', type: '保理公司', status: '合作中',  contact_person: '刘颖',  contact_phone: '020-38000007', address: '广州市天河区珠江新城16号' },
    { id: 8,  name: '农业银行成都分行',    license_number: 'LIC20240008', type: '商业银行', status: '合作中',  contact_person: '孙宁',  contact_phone: '028-66000008', address: '成都市高新区天府大道188号' },
    { id: 9,  name: '建设银行天津分行',    license_number: 'LIC20240009', type: '商业银行', status: '已终止',  contact_person: '马超',  contact_phone: '022-63000009', address: '天津市和平区南京路33号' },
    { id: 10, name: '邮储银行武汉分行',    license_number: 'LIC20240010', type: '商业银行', status: '合作中',  contact_person: '高圆',  contact_phone: '027-87000010', address: '武汉市武昌区中北路88号' }
  ]);
}

// 预置担保机构样例
if ((ga._get() || []).length === 0) {
  ga._set([
    { id: 1, name: '中科融资担保有限公司', creditCode: '91310000GZ000001', license_no: 'GZ20240001', type: '融资性担保公司', registeredCapital: '50000', contact: '李宁', contactPhone: '010-66000011', regAddress: '北京海淀区学院路1号', coop_status: '合作中' },
    { id: 2, name: '华信再担保有限公司', creditCode: '91310000GZ000002', license_no: 'GZ20240002', type: '再担保公司', registeredCapital: '80000', contact: '王璐', contactPhone: '021-66000012', regAddress: '上海浦东新区1号', coop_status: '合作中' },
    { id: 3, name: '齐鲁融资担保有限公司', creditCode: '91370000GZ000003', license_no: 'GZ20240003', type: '融资性担保公司', registeredCapital: '30000', contact: '赵磊', contactPhone: '0531-66000013', regAddress: '济南市历下区1号', coop_status: '合作中' },
    { id: 4, name: '渝信融资担保有限公司', creditCode: '91500000GZ000004', license_no: 'GZ20240004', type: '融资性担保公司', registeredCapital: '20000', contact: '周蓉', contactPhone: '023-66000014', regAddress: '重庆江北区1号', coop_status: '合作中' },
    { id: 5, name: '苏宁再担保有限公司', creditCode: '91320000GZ000005', license_no: 'GZ20240005', type: '再担保公司', registeredCapital: '90000', contact: '陈晨', contactPhone: '025-66000015', regAddress: '南京鼓楼区1号', coop_status: '已暂停' },
    { id: 6, name: '天府融资担保有限公司', creditCode: '91510000GZ000006', license_no: 'GZ20240006', type: '融资性担保公司', registeredCapital: '35000', contact: '刘畅', contactPhone: '028-66000016', regAddress: '成都高新区1号', coop_status: '合作中' },
    { id: 7, name: '鹏城融资担保有限公司', creditCode: '91440300GZ000007', license_no: 'GZ20240007', type: '融资性担保公司', registeredCapital: '45000', contact: '林杰', contactPhone: '0755-66000017', regAddress: '深圳福田区1号', coop_status: '合作中' },
    { id: 8, name: '西湖政策性担保机构', creditCode: '91330000GZ000008', license_no: 'GZ20240008', type: '政策性担保机构', registeredCapital: '120000', contact: '黄静', contactPhone: '0571-66000018', regAddress: '杭州西湖区1号', coop_status: '合作中' },
    { id: 9, name: '齐齐哈尔融资担保有限公司', creditCode: '91230000GZ000009', license_no: 'GZ20240009', type: '融资性担保公司', registeredCapital: '15000', contact: '高远', contactPhone: '0452-66000019', regAddress: '齐齐哈尔建华区1号', coop_status: '已终止' },
    { id: 10, name: '汉江融资担保有限公司', creditCode: '91420100GZ000010', license_no: 'GZ20240010', type: '融资性担保公司', registeredCapital: '28000', contact: '贺新', contactPhone: '027-66000020', regAddress: '武汉市武昌区1号', coop_status: '合作中' }
  ]);
}

// 预置质检机构样例
if ((qa._get() || []).length === 0) {
  qa._set([
    { id: 1, name: 'SGS通标标准', creditCode: '91310000QA000001', qualification_type: ['CMA','CNAS'], qualCertNo: 'QA20240001', qualValidTo: '2026-12-31', regAddress: '上海市徐汇区1号', servicePhone: '021-61000001', coop_status: '合作中' },
    { id: 2, name: '必维检验', creditCode: '91310000QA000002', qualification_type: ['CNAS'], qualCertNo: 'QA20240002', qualValidTo: '2026-06-30', regAddress: '上海市浦东新区1号', servicePhone: '021-61000002', coop_status: '合作中' },
    { id: 3, name: '华测检测', creditCode: '91440300QA000003', qualification_type: ['CMA','ILAC-MRA'], qualCertNo: 'QA20240003', qualValidTo: '2027-03-31', regAddress: '深圳市南山区1号', servicePhone: '0755-61000003', coop_status: '合作中' },
    { id: 4, name: '中检集团', creditCode: '91310000QA000004', qualification_type: ['CMA'], qualCertNo: 'QA20240004', qualValidTo: '2025-12-31', regAddress: '北京市朝阳区1号', servicePhone: '010-61000004', coop_status: '已暂停' },
    { id: 5, name: '广检中心', creditCode: '91440100QA000005', qualification_type: ['CNAS'], qualCertNo: 'QA20240005', qualValidTo: '2026-09-30', regAddress: '广州市天河区1号', servicePhone: '020-61000005', coop_status: '合作中' },
    { id: 6, name: '浙检中心', creditCode: '91330000QA000006', qualification_type: ['CMA'], qualCertNo: 'QA20240006', qualValidTo: '2027-01-31', regAddress: '杭州市西湖区1号', servicePhone: '0571-61000006', coop_status: '合作中' },
    { id: 7, name: '鲁检中心', creditCode: '91370000QA000007', qualification_type: ['CNAS','ILAC-MRA'], qualCertNo: 'QA20240007', qualValidTo: '2026-01-31', regAddress: '济南市历下区1号', servicePhone: '0531-61000007', coop_status: '合作中' },
    { id: 8, name: '渝检中心', creditCode: '91500000QA000008', qualification_type: ['CMA'], qualCertNo: 'QA20240008', qualValidTo: '2025-08-31', regAddress: '重庆市江北区1号', servicePhone: '023-61000008', coop_status: '合作中' },
    { id: 9, name: '川检中心', creditCode: '91510000QA000009', qualification_type: ['CMA'], qualCertNo: 'QA20240009', qualValidTo: '2026-02-28', regAddress: '成都市高新区1号', servicePhone: '028-61000009', coop_status: '已终止' },
    { id: 10, name: '津检中心', creditCode: '91120000QA000010', qualification_type: ['CNAS'], qualCertNo: 'QA20240010', qualValidTo: '2027-05-31', regAddress: '天津市和平区1号', servicePhone: '022-61000010', coop_status: '合作中' }
  ]);
}

// 预置监管仓库样例
if ((sw._get() || []).length === 0) {
  sw._set([
    { id:1, name:'华北物流一号库', creditCode:'91110000SW000001', warehouseType:'平面仓', address:'北京亦庄开发区一号路', area:'20000', capacity:'35000', maxLoad:'3', securityDesc:'24小时监控全覆盖、红外报警、消防等级甲级、专人巡逻', coop_status:'合作中', headName:'王强', headPhone:'13800000001', admission_status:'待审核' },
    { id:2, name:'浦东保税仓A区', creditCode:'91310000SW000002', warehouseType:'保税库', address:'上海浦东外高桥保税区1号', area:'30000', capacity:'50000', maxLoad:'2.5', securityDesc:'全域摄像头+门禁联动、消防乙级', coop_status:'合作中', headName:'李敏', headPhone:'13800000002', admission_status:'审核通过' },
    { id:3, name:'高新立体仓', creditCode:'91510000SW000003', warehouseType:'立体仓', address:'成都高新区天府大道200号', area:'15000', capacity:'42000', maxLoad:'5', securityDesc:'AGV+立体货架、消防甲级', coop_status:'合作中', headName:'赵云', headPhone:'13800000003', admission_status:'审核通过' },
    { id:4, name:'滨海冷链仓', creditCode:'91220000SW000004', warehouseType:'冷库', address:'大连保税区冷链园', area:'12000', capacity:'20000', maxLoad:'2', securityDesc:'冷链温控+消防乙级+巡逻', coop_status:'已暂停', headName:'周倩', headPhone:'13800000004', admission_status:'待审核' },
    { id:5, name:'华东高台仓', creditCode:'91330000SW000005', warehouseType:'高台仓', address:'杭州余杭区物流大道8号', area:'26000', capacity:'38000', maxLoad:'3.5', securityDesc:'视频AI布控+消防甲级', coop_status:'合作中', headName:'钱诚', headPhone:'13800000005', admission_status:'审核通过' },
    { id:6, name:'危化品专用库', creditCode:'91440100SW000006', warehouseType:'危化品库', address:'广州南沙化工园', area:'8000', capacity:'12000', maxLoad:'4', securityDesc:'危化品规范+消防特级+专人看护', coop_status:'合作中', headName:'孙亮', headPhone:'13800000006', admission_status:'待审核' },
    { id:7, name:'港区联运仓', creditCode:'91320500SW000007', warehouseType:'平面仓', address:'苏州太仓港区联运中心', area:'18000', capacity:'30000', maxLoad:'3', securityDesc:'24h巡逻+联动门禁', coop_status:'合作中', headName:'吴迪', headPhone:'13800000007', admission_status:'审核通过' },
    { id:8, name:'西北保税仓B区', creditCode:'91630000SW000008', warehouseType:'保税库', address:'西安综合保税区', area:'21000', capacity:'33000', maxLoad:'2.8', securityDesc:'全域监控+消防乙级', coop_status:'已终止', headName:'郑航', headPhone:'13800000008', admission_status:'审核通过' },
    { id:9, name:'华南冷链二号库', creditCode:'91440300SW000009', warehouseType:'冷库', address:'深圳前海冷链园二期', area:'14000', capacity:'22000', maxLoad:'2.2', securityDesc:'冷链监控+报警联动', coop_status:'合作中', headName:'冯雪', headPhone:'13800000009', admission_status:'待审核' },
    { id:10, name:'中部立体仓', creditCode:'91420100SW000010', warehouseType:'立体仓', address:'武汉临空港经济区', area:'23000', capacity:'36000', maxLoad:'4.5', securityDesc:'立体仓储+AGV调度+消防甲级', coop_status:'合作中', headName:'马宁', headPhone:'13800000010', admission_status:'审核通过' }
  ]);
}
// 下方不要重复声明 ga/qa/sw，已在文件顶部定义

export default [
  // 金融机构（自定义字段与校验）
  { url:'/api/member/financial/list', method:'get', response:({query})=> fi.list(query) },
  { url:'/api/member/financial/detail', method:'get', response:({query})=> fi.detail(query?.id) },
  { url:'/api/member/financial/create', method:'post', response:({body})=> {
      const id = Math.max(0, ...fi._get().map((i)=>i.id||0)) + 1;
      const name = String(body?.name||'').trim();
      const license_number = String(body?.license_number||'').trim();
      if (!name || !license_number) return { code:1, msg:'机构名称与许可证编号必填' };
      const existed = fi._get().find((i)=> i.name===name && i.license_number===license_number);
      if (existed) return { code:0, data:existed, msg:'已存在，返回现有记录' };
      // 直接存储所有传入字段，保证可扩展（表单新增的字段都能持久化）
      const item = { id, ...body, name, license_number };
      const list = [...fi._get(), item]; fi._set(list);
      return { code:0, data:item };
    }
  },
  { url:'/api/member/financial/update', method:'post', response:({body})=> {
      const list = fi._get();
      const idx = list.findIndex(i=> String(i.id)===String(body?.id));
      if (idx===-1) return { code:1, msg:'未找到' };
      const name = String(body?.name ?? list[idx].name).trim();
      const license_number = String(body?.license_number ?? list[idx].license_number).trim();
      const dup = list.find(i=> i.name===name && i.license_number===license_number && i.id!==list[idx].id);
      if (dup) return { code:1, msg:'机构名称+许可证编号重复' };
      list[idx] = { ...list[idx], ...body, name, license_number };
      fi._set(list);
      return { code:0, data:list[idx] };
    }
  },
  { url:'/api/member/financial/delete', method:'post', response:({body})=> fi.delete(body) },
  // 金融机构导出（服务端生成CSV）
  { url:'/api/member/financial/export', method:'get', rawResponse: async (_req, res) => {
      try{
        const list = fi._get();
        const header = ['机构名称','金融机构许可证编号','机构类型','注册地址','经营地址','官方网址','客服电话','业务联系人','联系人部门及职务','联系人手机','联系人邮箱','核心业务类型','合作起始日期','合作状态','授信额度','风险评级','准入审核状态','管理员账号','备注'];
        const toCell = (v)=>{ const s=String(v??''); return /[",\n]/.test(s)? '"'+s.replace(/"/g,'""')+'"' : s; };
        const lines = [header.join(',')].concat(list.map(r=>[
          r.name, r.license_number, r.type, r.regAddress, r.bizAddress, r.website, r.servicePhone,
          r.contact_person, r.contact_title, r.contact_phone, r.contact_email,
          r.core_business_types, r.coop_start_date, r.coop_status, r.credit_limit,
          r.risk_rating, r.admission_status, r.admin_account, r.remark
        ].map(toCell).join(',')));
        const csv='\ufeff'+lines.join('\n');
        res.statusCode=200; res.setHeader('Content-Type','text/csv; charset=utf-8'); res.setHeader('Content-Disposition','attachment; filename="financial-institutions.csv"'); res.end(csv);
      }catch{ res.statusCode=500; res.setHeader('Content-Type','application/json'); res.end(JSON.stringify({code:1,msg:'导出失败'})); }
    }
  },
  // 担保机构
  { url:'/api/member/guarantee/list', method:'get', response:({query})=> ga.list(query) },
  { url:'/api/member/guarantee/detail', method:'get', response:({query})=> ga.detail(query?.id) },
  { url:'/api/member/guarantee/create', method:'post', response:({body})=> ga.create(body) },
  { url:'/api/member/guarantee/update', method:'post', response:({body})=> ga.update(body) },
  { url:'/api/member/guarantee/delete', method:'post', response:({body})=> ga.delete(body) },
  // 担保机构导出
  { url:'/api/member/guarantee/export', method:'get', rawResponse: async (_req, res) => {
      try{
        const list = ga._get();
        const header = ['机构名称','统一社会信用代码','许可证编号','机构类型','注册资本(万元)','放大倍数','担保责任余额','注册地址','经营地址','客服电话','业务联系人','联系人部门及职务','联系人手机','联系人邮箱','主要担保业务类型','合作起始日期','合作状态','风险评级','准入审核状态','管理员账号','备注'];
        const toCell = (v)=>{ const s=String(v??''); return /[",\n]/.test(s)? '"'+s.replace(/"/g,'""')+'"' : s; };
        const lines = [header.join(',')].concat(list.map(r=>[
          r.name, r.creditCode, r.license_no, r.type, r.registeredCapital, r.leverage, r.guaranteeOutstanding,
          r.regAddress, r.bizAddress, r.servicePhone, r.contact, r.contactTitle, r.contactPhone, r.contactEmail,
          r.mainGuaranteeTypes, r.coop_start_date, r.coop_status, r.risk_rating, r.admission_status, r.admin_account, r.remark
        ].map(toCell).join(',')));
        const csv='\ufeff'+lines.join('\n');
        res.statusCode=200; res.setHeader('Content-Type','text/csv; charset=utf-8'); res.setHeader('Content-Disposition','attachment; filename="guarantee-agencies.csv"'); res.end(csv);
      }catch{ res.statusCode=500; res.setHeader('Content-Type','application/json'); res.end(JSON.stringify({code:1,msg:'导出失败'})); }
    }
  },
  // 质检机构
  { url:'/api/member/quality/list', method:'get', response:({query})=> qa.list(query) },
  { url:'/api/member/quality/detail', method:'get', response:({query})=> qa.detail(query?.id) },
  { url:'/api/member/quality/create', method:'post', response:({body})=> qa.create(body) },
  { url:'/api/member/quality/update', method:'post', response:({body})=> qa.update(body) },
  { url:'/api/member/quality/delete', method:'post', response:({body})=> qa.delete(body) },
  // 质检机构导出
  { url:'/api/member/quality/export', method:'get', rawResponse: async (_req, res) => {
      try{
        const list = qa._get();
        const header = ['机构名称','统一社会信用代码','资质认证类型','资质证书编号','资质有效期','可检测的货物品类','检测能力描述','注册地址','经营地址','官方网址','客服电话','报告查询链接','业务联系人','联系人部门及职务','联系人手机','联系人邮箱','合作起始日期','合作状态','准入审核状态','管理员账号','备注'];
        const toCell = (v)=>{ const s=String(v??''); return /[",\n]/.test(s)? '"'+s.replace(/"/g,'""')+'"' : s; };
        const fmtCats = (cats)=>{ try{ if(Array.isArray(cats)) return cats.map(x=> typeof x==='string'?x:(x?.label||x?.value||'')).join(' / '); return ''; }catch{ return ''; } };
        const lines = [header.join(',')].concat(list.map(r=>[
          r.name, r.creditCode, (r.qualification_type||[]).join(' / '), r.qualCertNo, r.qualValidTo,
          fmtCats(r.testing_categories), r.capabilityDesc, r.regAddress, r.bizAddress, r.website, r.servicePhone, r.reportVerifyUrl,
          r.contact, r.contactTitle, r.contactPhone, r.contactEmail, r.coop_start_date, r.coop_status, r.admission_status, r.admin_account, r.remark
        ].map(toCell).join(',')));
        const csv='\ufeff'+lines.join('\n');
        res.statusCode=200; res.setHeader('Content-Type','text/csv; charset=utf-8'); res.setHeader('Content-Disposition','attachment; filename="quality-agencies.csv"'); res.end(csv);
      }catch{ res.statusCode=500; res.setHeader('Content-Type','application/json'); res.end(JSON.stringify({code:1,msg:'导出失败'})); }
    }
  },
  // 监管仓库
  { url:'/api/member/warehouse/list', method:'get', response:({query})=> sw.list(query) },
  { url:'/api/member/warehouse/detail', method:'get', response:({query})=> sw.detail(query?.id) },
  { url:'/api/member/warehouse/create', method:'post', response:({body})=> sw.create(body) },
  { url:'/api/member/warehouse/update', method:'post', response:({body})=> sw.update(body) },
  { url:'/api/member/warehouse/delete', method:'post', response:({body})=> sw.delete(body) },
  // 监管仓库导出
  { url:'/api/member/warehouse/export', method:'get', rawResponse: async (_req, res) => {
      try{
        const list = sw._get();
        const header = ['仓库名称','统一社会信用代码','仓库类型','仓库地址','仓库面积(㎡)','可用容积(m³)','最大承重(吨/㎡)','安保措施描述','主要监控服务商','物联网接入','合作起始日期','合作状态','负责人姓名','负责人手机','负责人邮箱','风险评级','准入审核状态','管理员账号','备注'];
        const toCell = (v)=>{ const s=String(v??''); return /[",\n]/.test(s)? '"'+s.replace(/"/g,'""')+'"' : s; };
        const lines = [header.join(',')].concat(list.map(r=>[
          r.name, r.creditCode, r.warehouseType, r.address, r.area, r.capacity, r.maxLoad,
          r.securityDesc, r.securityVendor, r.iotAccess, r.coop_start_date, r.coop_status,
          r.headName, r.headPhone, r.headEmail, r.risk_rating, r.admission_status, r.admin_account, r.remark
        ].map(toCell).join(',')));
        const csv='\ufeff'+lines.join('\n');
        res.statusCode=200; res.setHeader('Content-Type','text/csv; charset=utf-8'); res.setHeader('Content-Disposition','attachment; filename="supervised-warehouses.csv"'); res.end(csv);
      }catch{ res.statusCode=500; res.setHeader('Content-Type','application/json'); res.end(JSON.stringify({code:1,msg:'导出失败'})); }
    }
  },
];


