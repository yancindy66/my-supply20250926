import fs from 'fs';
import path from 'path';

// 稳定持久化：所有读写都直接走磁盘，避免热更新或分页切换造成“看似丢失”
const dataDir = path.resolve(process.cwd(), 'mock', 'data');
const dataFile = path.resolve(dataDir, 'products.json');

function ensureDir(){ try{ if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir,{recursive:true}); }catch{} }
function readAll(){ try{ if(fs.existsSync(dataFile)) return JSON.parse(fs.readFileSync(dataFile,'utf8')); }catch{} return []; }
function writeAll(list){ try{ ensureDir(); fs.writeFileSync(dataFile, JSON.stringify(list, null, 2),'utf8'); }catch{} }

function nextId(list){ return Math.max(0, ...list.map(p=> p.id||0)) + 1; }
function nextProductId(list){
  const nums = list.map(p=> String(p.product_id||''))
    .map(c=> c.startsWith('P-')? parseInt(c.slice(2),10):NaN)
    .filter(Number.isFinite);
  const next = (nums.length? Math.max(...nums):0) + 1;
  return 'P-' + String(next).padStart(5,'0');
}

export default [
  // 分页列表：每次从磁盘读取
  { url:'/api/products', method:'get', response:({ query })=>{
      const products = readAll();
      const keyword = String(query?.keyword||'').toLowerCase();
      const page = parseInt(query?.page||'1',10)||1;
      const pageSize = parseInt(query?.pageSize||'10',10)||10;
      const status = String(query?.status||'');
      const brandCode = String(query?.brandCode||'').trim();

      let filtered = products;
      if (keyword) filtered = filtered.filter(p => Object.values(p).some(v => String(v||'').toLowerCase().includes(keyword)));
      if (status) filtered = filtered.filter(p => String(p.status||'')===status);
      if (brandCode) filtered = filtered.filter(p => String(p.platform_brand_code||'').includes(brandCode));

      const toNumber = (v)=>{ const n = Number(v); return Number.isFinite(n)? n : 0; };
      // 在排序前先把需要的字段归一化为数值，避免字符串排序导致新记录靠后
      filtered = filtered.map(p=> ({
        ...p,
        id: toNumber(p.id),
        created_at: toNumber(p.created_at) || toNumber(p.id) || Date.now(),
        platform_base_premium: toNumber(p.platform_base_premium),
        custom_premium: toNumber(p.custom_premium)
      }));

      const sortProp = String(query?.sortProp||'');
      const sortOrder = String(query?.sortOrder||'');
      if (sortProp && (sortOrder==='asc' || sortOrder==='desc')){
        const dir = sortOrder==='asc'? 1 : -1;
        filtered = [...filtered].sort((a,b)=>{
          const va = a[sortProp]; const vb = b[sortProp];
          if (va==null && vb==null) return 0; if (va==null) return -1*dir; if (vb==null) return 1*dir;
          if (typeof va==='number' && typeof vb==='number') return (va-vb)*dir;
          return String(va).localeCompare(String(vb),'zh')*dir;
        });
      } else {
        // 默认按创建时间倒序，其次按 id 倒序，保证新数据靠前
        filtered = [...filtered].sort((a,b)=>{
          const ca = Number(a.created_at||0), cb = Number(b.created_at||0);
          if (cb!==ca) return cb - ca;
          return Number(b.id||0) - Number(a.id||0);
        });
      }

      const total = filtered.length;
      const list = filtered
        .slice((page-1)*pageSize, (page-1)*pageSize+pageSize)
        .map(p=> p);
      return { code:0, data:{ list, total, page, pageSize } };
    }
  },

  // 新增：写入磁盘
  { url:'/api/products', method:'post', response:({ body })=>{
      const products = readAll();
      const id = nextId(products);
      const product_id = (body?.product_id||'').trim() || nextProductId(products);
      let item = { product_id,
        species:'', brand:'', grade:'', production_year:'', package_spec:'', processor_code:'', processor_name:'', origin_region:'', origin_address:'', product_type:'',
        product_name:'', short_code:'', origin_area:'', certificate_no:'', certificate_image:'', no_foreign_fiber:true, processor_address:'', contact_person:'',
        packaging_image:'',
        color_grade:'', ginning_quality:'', fiber_length:'', micronaire:'', break_strength:'', uniformity_index:'',
        status:'未上架', platform_standard_id:'', platform_standard_grade_name:'', platform_brand_code:'', platform_base_premium:0, custom_premium:0,
        ...body };
      // 确保 id 不被 body 覆盖
      item.id = id;
      // 记录创建时间，便于默认按新建优先排序
      item.created_at = Date.now();
      // 规范化：品类与名称
      if (!item.product_name && body?.brand_name) item.product_name = String(body.brand_name).trim();
      if (!item.commodity_type && item.species) item.commodity_type = item.species;
      if (!item.species && item.commodity_type) item.species = item.commodity_type;
      if (!item.commodity_type) item.commodity_type = '未分类';
      // 数值字段归一化
      const toNumber = (v)=>{ const n = Number(v); return Number.isFinite(n)? n : 0; };
      item.platform_base_premium = toNumber(item.platform_base_premium);
      item.custom_premium = toNumber(item.custom_premium);
      const next = [item, ...products];
      writeAll(next);
      return { code:0, data:item };
    }
  },

  // 更新：写入磁盘
  { url:'/api/products/:id', method:'put', response:({ body, params })=>{
      const products = readAll();
      const idx = products.findIndex(p=> String(p.id)===String(params?.id));
      if (idx===-1) return { code:1, msg:'未找到' };
      const prev = products[idx];
      const merged = { ...prev, ...body };
      const toNumber = (v)=>{ const n = Number(v); return Number.isFinite(n)? n : 0; };
      merged.platform_base_premium = toNumber(merged.platform_base_premium);
      merged.custom_premium = toNumber(merged.custom_premium);
      // 保持关键字段不被覆盖
      merged.id = prev.id;
      merged.created_at = prev.created_at || merged.created_at || Date.now();
      products[idx] = merged;
      writeAll(products);
      return { code:0, data: products[idx] };
    }
  },

  // 删除：写入磁盘
  { url:'/api/products/:id', method:'delete', response:({ params })=>{
      const products = readAll();
      const next = products.filter(p=> String(p.id)!==String(params?.id));
      writeAll(next);
      return { code:0, msg:'删除成功' };
    }
  },
  // 批量删除
  { url:'/api/products/batch/delete', method:'post', response:({ body })=>{
      const ids = Array.isArray(body?.ids)? body.ids : [];
      const products = readAll();
      const prev = products.length;
      const keep = new Set(ids.map(String));
      const next = products.filter(p=> !keep.has(String(p.id)));
      writeAll(next);
      return { code:0, data:{ removed: prev - next.length } };
    }
  },

  // 审核（通过）
  { url:'/api/products/:id/review', method:'post', response:({ params, body })=>{
      const products = readAll();
      const idx = products.findIndex(p=> String(p.id)===String(params?.id));
      if (idx===-1) return { code:1, msg:'未找到' };
      const reviewer = String(body?.reviewer||'').trim() || 'admin';
      products[idx].reviewer = reviewer;
      products[idx].review_status = '已审核';
      if (products[idx].status === '未上架') products[idx].status = '上架';
      writeAll(products);
      return { code:0, data: products[idx] };
    }
  },
  // 批量审核
  { url:'/api/products/batch/review', method:'post', response:({ body })=>{
      const ids = Array.isArray(body?.ids)? body.ids : [];
      const reviewer = String(body?.reviewer||'').trim() || 'admin';
      const products = readAll();
      let count = 0;
      const next = products.map(p=>{
        if (!ids.includes(p.id)) return p;
        count++;
        const n = { ...p, reviewer, review_status:'已审核' };
        if (n.status === '未上架') n.status = '上架';
        return n;
      });
      writeAll(next);
      return { code:0, data:{ count } };
    }
  },

  // 审核驳回（单条）
  { url:'/api/products/:id/reject', method:'post', response:({ params, body })=>{
      const products = readAll();
      const idx = products.findIndex(p=> String(p.id)===String(params?.id));
      if (idx===-1) return { code:1, msg:'未找到' };
      const reviewer = String(body?.reviewer||'').trim() || 'admin';
      const reason = String(body?.reason||'').trim() || '不符合上架标准';
      products[idx].reviewer = reviewer;
      products[idx].review_status = '已驳回';
      products[idx].reject_reason = reason;
      // 状态维持未上架
      if (!products[idx].status || products[idx].status==='上架') products[idx].status = '未上架';
      writeAll(products);
      return { code:0, data: products[idx] };
    }
  },
  // 审核驳回（批量）
  { url:'/api/products/batch/reject', method:'post', response:({ body })=>{
      const ids = Array.isArray(body?.ids)? body.ids : [];
      const reviewer = String(body?.reviewer||'').trim() || 'admin';
      const reason = String(body?.reason||'').trim() || '不符合上架标准';
      const products = readAll();
      let count = 0;
      const next = products.map(p=>{
        if (!ids.includes(p.id)) return p;
        count++;
        const n = { ...p, reviewer, review_status:'已驳回', reject_reason: reason };
        n.status = '未上架';
        return n;
      });
      writeAll(next);
      return { code:0, data:{ count } };
    }
  },

  // 批量下架
  { url:'/api/products/batch/down', method:'post', response:({ body })=>{
      const products = readAll();
      const ids = Array.isArray(body?.ids)? body.ids : [];
      const next = products.map(p=> ids.includes(p.id)? { ...p, status:'下架' } : p);
      writeAll(next);
      return { code:0, data:{ count: ids.length } };
    }
  },
  // 批量上架
  { url:'/api/products/batch/up', method:'post', response:({ body })=>{
      const products = readAll();
      const ids = Array.isArray(body?.ids)? body.ids : [];
      const next = products.map(p=> ids.includes(p.id)? { ...p, status:'上架' } : p);
      writeAll(next);
      return { code:0, data:{ count: ids.length } };
    }
  },

  // 单条下架
  { url:'/api/products/:id/down', method:'post', response:({ params })=>{
      const products = readAll();
      const idx = products.findIndex(p=> String(p.id)===String(params?.id));
      if (idx===-1) return { code:1, msg:'未找到' };
      products[idx].status = '下架'; writeAll(products);
      return { code:0, data: products[idx] };
    }
  },
  // 单条上架
  { url:'/api/products/:id/up', method:'post', response:({ params })=>{
      const products = readAll();
      const idx = products.findIndex(p=> String(p.id)===String(params?.id));
      if (idx===-1) return { code:1, msg:'未找到' };
      products[idx].status = '上架'; writeAll(products);
      return { code:0, data: products[idx] };
    }
  },
  // 修改价格
  { url:'/api/products/:id/price', method:'post', response:({ params, body })=>{
      const products = readAll();
      const idx = products.findIndex(p=> String(p.id)===String(params?.id));
      if (idx===-1) return { code:1, msg:'未找到' };
      const price = Number(body?.price||NaN);
      if (!Number.isFinite(price) || price < 0) return { code:1, msg:'价格不合法' };
      const now = new Date().toISOString();
      const hist = Array.isArray(products[idx].price_history)? products[idx].price_history : [];
      hist.push({ price, at: now });
      products[idx].price_history = hist;
      products[idx].current_price = price;
      writeAll(products);
      return { code:0, data: { id: products[idx].id, current_price: price } };
    }
  }
];


