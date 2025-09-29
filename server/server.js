import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import knexInit from 'knex';
import multer from 'multer';

const knex = knexInit({
  client: 'mysql2',
  connection: {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'mydb',
    timezone: 'Z'
  },
  pool: { min: 0, max: 10 }
});

const app = express();
app.use(cors());
app.use(express.json());
// multipart 用于 OCR 占位接口
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

// 健康检查
app.get('/health', (req, res) => res.json({ ok: true }));

// OCR 占位：POST /api/ocr/business-license  (multipart/form-data, field: file)
app.post('/api/ocr/business-license', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ code: 1, msg: 'NO_FILE' });
    // 模拟延时+识别结果（真实环境接入 OCR 服务即可）
    await new Promise(r => setTimeout(r, 500));
    const name = (req.file.originalname || '').replace(/\.[^.]+$/,'');
    const demoUscc = '9131' + Math.random().toString().slice(2, 16).padEnd(14, '0');
    return res.json({
      code: 0,
      data: {
        org_name: name || '示例公司',
        uscc: demoUscc,
        legal_name: '张三',
        meta: {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        }
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ code: 1, msg: 'OCR_FAILED' });
  }
});

// 新增产品：POST /api/products
app.post('/api/products', async (req, res) => {
  try {
    const body = req.body || {};
    const row = {
      product_id: body.product_id || null,
      product_name: body.product_name || body.brand_name || '新商品',
      commodity_type: body.commodity_type || body.species || null,
      platform_standard_grade_name: body.platform_standard_grade_name || null,
      platform_base_premium: Number(body.platform_base_premium ?? 0),
      custom_premium: Number(body.custom_premium ?? 0),
      packaging_image: body.packaging_image || null,
      production_year: body.production_year || null,
      package_spec: body.package_spec || null,
      current_price: body.current_price != null ? Number(body.current_price) : null,
      status: body.status || '上架',
      created_at: knex.fn.now(3)
    };
    const ids = await knex('products').insert(row);
    const id = Array.isArray(ids) ? ids[0] : ids;
    const data = await knex('products').where({ id }).first();
    return res.json({ code: 0, data });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ code: 1, msg: '创建失败' });
  }
});

// 分页获取：GET /api/products?page=1&page_size=20
app.get('/api/products', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const pageSizeRaw = parseInt(req.query.page_size || req.query.pageSize || '20', 10);
    const page_size = Math.min(Math.max(pageSizeRaw, 1), 100);

    const [{ total }] = await knex('products').count('* as total');
    const list = await knex('products')
      .select(
        'id','product_id','product_name','commodity_type','platform_standard_grade_name',
        'platform_base_premium','custom_premium','packaging_image','production_year','package_spec',
        'current_price','status','created_at','updated_at'
      )
      .orderBy([{ column: 'created_at', order: 'desc' }, { column: 'id', order: 'desc' }])
      .limit(page_size)
      .offset((page - 1) * page_size);

    return res.json({ code: 0, data: { list, total: Number(total || 0), page, page_size } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ code: 1, msg: '查询失败' });
  }
});

// ================= Inventory Owners =================
// 列表：GET /api/inventory-owner/list?page=&pageSize=&keyword=
app.get('/api/inventory-owner/list', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const pageSizeRaw = parseInt(req.query.pageSize || req.query.page_size || '20', 10);
    const pageSize = Math.min(Math.max(pageSizeRaw, 1), 100);
    const keyword = String(req.query.keyword || '').trim();

    const base = knex('inventory_owners').whereRaw('1=1');
    if (keyword) {
      const like = `%${keyword}%`;
      base.andWhere(builder => {
        builder
          .orWhere('company', 'like', like)
          .orWhere('code', 'like', like)
          .orWhere('contact', 'like', like)
          .orWhere('phone', 'like', like)
          .orWhere('companyPhone', 'like', like)
          .orWhere('address', 'like', like)
          .orWhere('regAddress', 'like', like);
      });
    }
    const [{ total }] = await base.clone().count('* as total');
    const list = await base
      .clone()
      .select('*')
      .orderBy([{ column: 'created_at', order: 'desc' }, { column: 'id', order: 'desc' }])
      .limit(pageSize)
      .offset((page - 1) * pageSize);
    return res.json({ code: 0, data: { list, total: Number(total || 0), page, pageSize } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ code: 1, msg: '查询失败' });
  }
});

// 详情：GET /api/inventory-owner/detail?id=1
app.get('/api/inventory-owner/detail', async (req, res) => {
  try {
    const id = Number(req.query.id);
    const data = await knex('inventory_owners').where({ id }).first();
    return res.json({ code: data ? 0 : 1, data: data || null });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ code: 1, msg: '查询失败' });
  }
});

// 创建：POST /api/inventory-owner/create
app.post('/api/inventory-owner/create', async (req, res) => {
  try {
    const body = req.body || {};
    const company = String(body.company || '').trim();
    const code = String(body.code || '').trim();
    if (!company || !code) return res.json({ code: 1, msg: '公司名称与存货人编码必填' });
    const existed = await knex('inventory_owners').where({ company, code }).first();
    if (existed) return res.json({ code: 0, data: existed, msg: '该公司+编码已存在，返回现有记录' });
    const row = { ...body, company, code, created_at: knex.fn.now(3) };
    const ids = await knex('inventory_owners').insert(row);
    const id = Array.isArray(ids) ? ids[0] : ids;
    const data = await knex('inventory_owners').where({ id }).first();
    return res.json({ code: 0, data, msg: '创建成功' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ code: 1, msg: '创建失败' });
  }
});

// 更新：POST /api/inventory-owner/update
app.post('/api/inventory-owner/update', async (req, res) => {
  try {
    const body = req.body || {};
    const id = Number(body.id);
    if (!id) return res.json({ code: 1, msg: '缺少ID' });
    const current = await knex('inventory_owners').where({ id }).first();
    if (!current) return res.json({ code: 1, msg: '未找到' });
    const company = String(body.company ?? current.company).trim();
    const code = String(body.code ?? current.code).trim();
    const dup = await knex('inventory_owners').where({ company, code }).andWhereNot({ id }).first();
    if (dup) return res.json({ code: 1, msg: '公司名称+编码重复' });
    const updates = { ...body, company, code, updated_at: knex.fn.now(3) };
    await knex('inventory_owners').where({ id }).update(updates);
    const data = await knex('inventory_owners').where({ id }).first();
    return res.json({ code: 0, data, msg: '更新成功' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ code: 1, msg: '更新失败' });
  }
});

// 删除：POST /api/inventory-owner/delete { id }
app.post('/api/inventory-owner/delete', async (req, res) => {
  try {
    const id = Number(req.body?.id);
    await knex('inventory_owners').where({ id }).del();
    return res.json({ code: 0, msg: '删除成功' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ code: 1, msg: '删除失败' });
  }
});

// ================= Storage =================
// 列表：GET /api/storage/list?page=&pageSize=
app.get('/api/storage/list', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const pageSizeRaw = parseInt(req.query.pageSize || req.query.page_size || '20', 10);
    const pageSize = Math.min(Math.max(pageSizeRaw, 1), 100);
    const [{ total }] = await knex('storages').count('* as total');
    const list = await knex('storages')
      .select('*')
      .orderBy([{ column: 'created_at', order: 'desc' }, { column: 'id', order: 'desc' }])
      .limit(pageSize)
      .offset((page - 1) * pageSize);
    return res.json({ code: 0, data: { list, total: Number(total || 0), page, pageSize } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ code: 1, msg: '查询失败' });
  }
});

// ================= Receivable =================
// 详情：GET /api/receivable/detail?id=
app.get('/api/receivable/detail', async (req, res) => {
  try {
    const id = Number(req.query.id);
    const data = await knex('receivables').where({ id }).first();
    return res.json({ code: data ? 0 : 1, data: data || null });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ code: 1, msg: '查询失败' });
  }
});

// ================= Warehouses =================
// 列表：GET /api/warehouses?page=&page_size=&keyword=&status=&enabled=
app.get('/api/warehouses', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const pageSizeRaw = parseInt(req.query.page_size || req.query.pageSize || '20', 10);
    const pageSize = Math.min(Math.max(pageSizeRaw, 1), 100);
    const keyword = String(req.query.keyword || '').trim();
    const status = String(req.query.status || '').trim();
    const enabledRaw = req.query.enabled;

    const base = knex('warehouses').whereRaw('1=1');
    if (keyword) {
      const like = `%${keyword}%`;
      base.andWhere(builder => {
        builder
          .orWhere('code', 'like', like)
          .orWhere('name', 'like', like)
          .orWhere('owner_company', 'like', like)
          .orWhere('province', 'like', like)
          .orWhere('city', 'like', like);
      });
    }
    if (status) base.andWhere({ status });
    if (enabledRaw !== undefined) {
      const enabled = String(enabledRaw) === '1' ? 1 : (String(enabledRaw) === '0' ? 0 : undefined);
      if (enabled !== undefined) base.andWhere({ enabled });
    }

    const [{ total }] = await base.clone().count('* as total');
    const list = await base
      .clone()
      .select('*')
      .orderBy([{ column: 'created_at', order: 'desc' }, { column: 'id', order: 'desc' }])
      .limit(pageSize)
      .offset((page - 1) * pageSize);
    return res.json({ code: 0, data: { list, total: Number(total || 0), page, pageSize } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ code: 1, msg: '查询失败' });
  }
});

// 启用/禁用
app.post('/api/warehouses/:id/enable', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await knex('warehouses').where({ id }).update({ enabled: 1, updated_at: knex.fn.now(3) });
    const data = await knex('warehouses').where({ id }).first();
    return res.json({ code: 0, data });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ code: 1, msg: '操作失败' });
  }
});
app.post('/api/warehouses/:id/disable', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await knex('warehouses').where({ id }).update({ enabled: 0, updated_at: knex.fn.now(3) });
    const data = await knex('warehouses').where({ id }).first();
    return res.json({ code: 0, data });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ code: 1, msg: '操作失败' });
  }
});

// 批量操作
app.post('/api/warehouses/batch/enable', async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(Number) : [];
    if (ids.length === 0) return res.json({ code: 0, data: { updated: 0 } });
    const updated = await knex('warehouses').whereIn('id', ids).update({ enabled: 1, updated_at: knex.fn.now(3) });
    return res.json({ code: 0, data: { updated } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ code: 1, msg: '操作失败' });
  }
});
app.post('/api/warehouses/batch/disable', async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(Number) : [];
    if (ids.length === 0) return res.json({ code: 0, data: { updated: 0 } });
    const updated = await knex('warehouses').whereIn('id', ids).update({ enabled: 0, updated_at: knex.fn.now(3) });
    return res.json({ code: 0, data: { updated } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ code: 1, msg: '操作失败' });
  }
});
app.post('/api/warehouses/batch/delete', async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(Number) : [];
    if (ids.length === 0) return res.json({ code: 0, data: { removed: 0 } });
    const removed = await knex('warehouses').whereIn('id', ids).andWhere({ enabled: 0 }).del();
    return res.json({ code: 0, data: { removed } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ code: 1, msg: '删除失败' });
  }
});

// ================= Dashboard (最小占位，避免 404) =================
app.get('/api/dashboard/list', async (_req, res) => {
  // 返回数组以匹配前端 DashboardList 的 props 类型
  return res.json({ code: 0, data: [
    { id: 1, name: '商品总数', value: 23 },
    { id: 2, name: '仓库总数', value: 1 }
  ] });
});

// ================= Member modules (兼容旧前端接口) =================
// 兼容 /api/member/financial|guarantee|quality/list
// 如无真实表，返回空列表结构，避免前端 404 报错
app.get('/api/member/:module/list', async (req, res) => {
  try {
    const module = String(req.params.module || '').trim();
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const pageSizeRaw = parseInt(req.query.pageSize || req.query.page_size || '20', 10);
    const pageSize = Math.min(Math.max(pageSizeRaw, 1), 100);
    const keyword = String(req.query.keyword || '').trim();

    if (module === 'warehouse') {
      const base = knex('warehouses').whereRaw('1=1');
      if (keyword) {
        const like = `%${keyword}%`;
        base.andWhere(builder => {
          builder.orWhere('code', 'like', like)
                .orWhere('name', 'like', like)
                .orWhere('owner_company', 'like', like)
                .orWhere('province', 'like', like)
                .orWhere('city', 'like', like);
        });
      }
      const [{ total }] = await base.clone().count('* as total');
      const list = await base.clone()
        .select('*')
        .orderBy([{ column: 'created_at', order: 'desc' }, { column: 'id', order: 'desc' }])
        .limit(pageSize)
        .offset((page - 1) * pageSize);
      return res.json({ code: 0, data: { list, total: Number(total || 0), page, pageSize } });
    }

    // financial/guarantee/quality 等暂未接真表，返回空结构避免前端报错
    return res.json({ code: 0, data: { list: [], total: 0, page, pageSize } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ code: 1, msg: '查询失败' });
  }
});

// 编辑产品：PUT /api/products/:id
app.put('/api/products/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = req.body || {};
    const updates = {
      product_id: body.product_id ?? null,
      product_name: body.product_name ?? body.brand_name ?? undefined,
      commodity_type: body.commodity_type ?? body.species ?? undefined,
      platform_standard_grade_name: body.platform_standard_grade_name ?? undefined,
      platform_base_premium: body.platform_base_premium != null ? Number(body.platform_base_premium) : undefined,
      custom_premium: body.custom_premium != null ? Number(body.custom_premium) : undefined,
      packaging_image: body.packaging_image ?? undefined,
      production_year: body.production_year ?? undefined,
      package_spec: body.package_spec ?? undefined,
      current_price: body.current_price != null ? Number(body.current_price) : undefined,
      status: body.status ?? undefined,
      updated_at: knex.fn.now(3)
    };
    // 移除 undefined 字段，避免覆盖为 NULL
    Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);
    await knex('products').where({ id }).update(updates);
    const data = await knex('products').where({ id }).first();
    return res.json({ code: 0, data });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ code: 1, msg: '更新失败' });
  }
});

// 启用：POST /api/products/:id/up
app.post('/api/products/:id/up', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await knex('products').where({ id }).update({ status: '上架', updated_at: knex.fn.now(3) });
    const data = await knex('products').where({ id }).first();
    return res.json({ code: 0, data });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ code: 1, msg: '操作失败' });
  }
});

// 禁用：POST /api/products/:id/down
app.post('/api/products/:id/down', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await knex('products').where({ id }).update({ status: '下架', updated_at: knex.fn.now(3) });
    const data = await knex('products').where({ id }).first();
    return res.json({ code: 0, data });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ code: 1, msg: '操作失败' });
  }
});

// 批量删除：仅允许删除“下架”状态
app.post('/api/products/batch/delete', async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(Number) : [];
    if (ids.length === 0) return res.json({ code: 0, data: { removed: 0 } });
    const removed = await knex('products').whereIn('id', ids).andWhere({ status: '下架' }).del();
    return res.json({ code: 0, data: { removed } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ code: 1, msg: '删除失败' });
  }
});

// 修改价格：POST /api/products/:id/price { price }
app.post('/api/products/:id/price', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const price = Number(req.body?.price);
    if (!Number.isFinite(price) || price < 0) return res.status(400).json({ code: 1, msg: '价格不合法' });
    await knex('products').where({ id }).update({ current_price: price, updated_at: knex.fn.now(3) });
    return res.json({ code: 0, data: { id, current_price: price } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ code: 1, msg: '更新价格失败' });
  }
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => console.log(`API listening http://127.0.0.1:${port}`));


