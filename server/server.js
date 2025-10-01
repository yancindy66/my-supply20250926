import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { query } from './db.js';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Silence favicon requests to avoid console 404 noise
app.get('/favicon.ico', (_req, res) => res.status(204).end());

// Auth
const allowDemo = String(process.env.ALLOW_DEMO || '').toLowerCase() === '1' || String(process.env.ALLOW_DEMO || '').toLowerCase() === 'true';
// Demo in-memory store
let demoStore = { inboundOrders: [], reservations: [], docs: [], scaleRecords: [], products: [], warehouses: [], gateEvents: [], alerts: [] };

// Helper: generate 6-digit numeric reservation code
function generateSixDigitCode(){
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Capabilities by role
function capabilitiesByRole(roleKey){
  // common read
  const base = { receipts:{ read:true }, inbound:{ read:true }, videos:{ read:true } };
  if (roleKey === 'warehouse') {
    return {
      ...base,
      receipts:{ ...base.receipts, submit:true, withdraw:true, addLocation:true, moveLocation:true, standardize:true },
      inbound:{ ...base.inbound, gateVerify:true, uploadDocs:true },
      audit:{ review:false }
    };
  }
  if (roleKey === 'platform' || roleKey === 'operation') {
    return {
      ...base,
      receipts:{ ...base.receipts },
      inbound:{ ...base.inbound },
      audit:{ review:true }
    };
  }
  // inventory (depositor)
  return {
    ...base,
    receipts:{ ...base.receipts },
    inbound:{ ...base.inbound, uploadDocs:true },
    audit:{ review:false }
  };
}

app.post('/v1/auth/login', async (req, res) => {
  const { username } = req.body || {};
  try {
    if (allowDemo) {
      const token = `mock-${Buffer.from(String(username || 'demo')).toString('hex')}`;
      return res.json({ code: 0, data: { token, user_id: 1, expires_in: 3600 } });
    }
    const rows = await query(
      'SELECT id, username, name, type, organization_id FROM users WHERE username=? LIMIT 1',
      [username]
    );
    if (!rows.length) return res.json({ code: 401, message: '用户不存在' });
    const token = `mock-${Buffer.from(String(username || 'user')).toString('hex')}`;
    res.json({ code: 0, data: { token, user_id: rows[0].id, expires_in: 3600 } });
  } catch (e) {
    res.status(500).json({ code: 500, message: String(e?.message || e) });
  }
});

app.get('/v1/auth/me', async (_req, res) => {
  try {
    if (allowDemo) {
      const role_key = 'depositor';
      return res.json({
        user: { id: 1, name: '演示用户', username: 'demo', organization_id: 1001, type: role_key },
        roles: [{ id: 1, role_key, role_name: role_key==='depositor'?'存货人':role_key }],
        permissions: ['/inbound/apply','/warehouse-receipt/list','/pledge/list'],
        data_scope: 'organization',
        capabilities: capabilitiesByRole('inventory')
      });
    }
    const user = (await query('SELECT id, username, name, type, organization_id FROM users LIMIT 1'))[0] || null;
    const roles = await query(
      'SELECT r.id, r.role_key, r.role_name FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id=?',
      [user?.id || 0]
    );
    const permissions = await query(
      'SELECT p.permission_key FROM role_permissions rp JOIN permissions p ON p.id=rp.permission_id WHERE rp.role_id IN (?)',
      [roles.map(r => r.id).concat(0)]
    );
    const primaryRole = (roles[0]?.role_key || 'inventory');
    res.json({ user, roles, permissions: permissions.map(p => p.permission_key), data_scope: 'organization', capabilities: capabilitiesByRole(primaryRole) });
  } catch (e) {
    if (allowDemo) {
      const role_key = 'depositor';
      return res.json({
        user: { id: 1, name: '演示用户', username: 'demo', organization_id: 1001, type: role_key },
        roles: [{ id: 1, role_key, role_name: '存货人' }],
        permissions: ['/inbound/apply','/warehouse-receipt/list','/pledge/list'],
        data_scope: 'organization',
        capabilities: capabilitiesByRole('inventory')
      });
    }
    res.status(500).json({ code: 500, message: String(e?.message || e) });
  }
});

// Platform master data (demo)
app.get('/api/products', (_req, res) => {
  if (!allowDemo) return res.json({ code:0, data: [] });
  if (!demoStore.products.length) {
    demoStore.products = [
      { id: 1, name: '大豆', spec: '非转基因/散装' },
      { id: 2, name: '聚丙烯', spec: 'PP-R / 25KG/袋' }
    ];
  }
  res.json({ code:0, data: demoStore.products });
});

app.get('/api/warehouses', (_req, res) => {
  if (!allowDemo) return res.json({ code:0, data: [] });
  if (!demoStore.warehouses.length) {
    demoStore.warehouses = [
      { id: 1, name: '天津港1号仓', address: '天津市滨海新区港口路88号', manager_phone: '13800001111' },
      { id: 2, name: '上海化工仓B区', address: '上海市奉贤区化工路1号', manager_phone: '13900002222' }
    ];
  }
  res.json({ code:0, data: demoStore.warehouses });
});

// Inbound reservations
app.get('/v1/inbound/reservations', async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    if (allowDemo) {
      if (!demoStore.reservations.length) {
        demoStore.reservations = [
          { id:1, reservation_number:'RSV202411110001', unique_reservation_code:'483920', owner_name:'华夏粮油集团有限公司', owner_address:'天津市南开区', status:'submitted', target_warehouse_id:1, commodity_id:1, total_planned_quantity:100, measurement_unit:'吨', created_at:'2025-10-01 09:00' },
          { id:2, reservation_number:'RSV202411110002', unique_reservation_code:'572614', owner_name:'广源贸易有限公司', owner_address:'上海市浦东新区', status:'submitted', target_warehouse_id:2, commodity_id:2, total_planned_quantity:80, measurement_unit:'吨', created_at:'2025-10-01 10:30' }
        ];
      }
      const total = demoStore.reservations.length;
      const start = (page-1)*pageSize;
      const list = demoStore.reservations.slice(start, start+pageSize);
      return res.json({ code:0, data:{ list, total } });
    }
    const offset = (page - 1) * pageSize;
    const list = await query(
      'SELECT id, reservation_number, status, target_warehouse_id, commodity_id, total_planned_quantity, measurement_unit, created_at FROM inbound_reservations ORDER BY id DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    );
    const totalRows = await query('SELECT COUNT(1) as c FROM inbound_reservations', []);
    return res.json({ code: 0, data: { list, total: Number(totalRows[0]?.c || 0) } });
  } catch (e) {
    res.status(500).json({ code: 500, message: String(e?.message || e) });
  }
});

app.post('/v1/inbound/reservations', async (req, res) => {
  try {
    const b = req.body || {};
    if (allowDemo) {
      const id = Date.now();
      const num = 'RSV'+id;
      const code6 = generateSixDigitCode();
      // 模拟从“平台运营的库”带出货主信息（此处写死演示）
      const owner_name = '演示货主A';
      const owner_address = '演示地址A';
      demoStore.reservations.unshift({
        id,
        reservation_number:num,
        unique_reservation_code: code6,
        owner_name,
        owner_address,
        status:'submitted',
        target_warehouse_id:Number(b.target_warehouse_id||1),
        commodity_id:Number(b.commodity_id||1),
        total_planned_quantity:Number(b.total_planned_quantity||0),
        measurement_unit:String(b.measurement_unit||'吨'),
        transport_mode: String(b.transport_mode||''),
        weigh_mode: String(b.weigh_mode||'by_pack'),
        pack_count: b.pack_count!=null? Number(b.pack_count): null,
        convert_ratio: b.convert_ratio!=null? Number(b.convert_ratio): null,
        weighing_fee: b.weighing_fee!=null? Number(b.weighing_fee): null,
        expected_arrival_start: b.expected_arrival_start || null,
        expected_arrival_end: b.expected_arrival_end || null,
        logistics_carrier: String(b.logistics_carrier||''),
        vehicle_plate: String(b.vehicle_plate||''),
        driver_name: String(b.driver_name||''),
        driver_phone: String(b.driver_phone||''),
        driver_id_no: String(b.driver_id_no||''),
        created_at:new Date().toISOString().slice(0,16).replace('T',' ')
      });
      return res.json({ code:0, data:{ id } });
    }
    const result = await query(
      'INSERT INTO inbound_reservations (reservation_number, reservation_type, reservist_id, applicant_id, target_warehouse_id, commodity_id, total_planned_quantity, measurement_unit, status) VALUES (CONCAT("RSV", UNIX_TIMESTAMP()), "by_depositor", ?, ?, ?, ?, ?, ?, "submitted")',
      [b.reservist_id || b.applicant_id || 1, b.applicant_id || 1, b.target_warehouse_id, b.commodity_id, b.total_planned_quantity, b.measurement_unit]
    );
    return res.json({ code: 0, data: { id: result.insertId } });
  } catch (e) {
    res.status(500).json({ code: 500, message: String(e?.message || e) });
  }
});

app.get('/v1/inbound/reservations/:id', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const row = demoStore.reservations.find(r => String(r.id)===String(req.params.id) || r.reservation_number===req.params.id);
  if (!row) return res.json({ code:404, message:'not found' });
  return res.json({ code:0, data: row });
});

// by reservation code (6 digits)
app.get('/v1/inbound/reservations/by-code/:code', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const row = demoStore.reservations.find(r => String(r.unique_reservation_code)===String(req.params.code));
  if (!row) return res.json({ code:404, message:'not found' });
  return res.json({ code:0, data: row });
});

app.put('/v1/inbound/reservations/:id', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const row = demoStore.reservations.find(r => String(r.id)===String(req.params.id) || r.reservation_number===req.params.id);
  if (!row) return res.json({ code:404, message:'not found' });
  const b = req.body || {};
  if (b.total_planned_quantity != null) row.total_planned_quantity = Number(b.total_planned_quantity);
  if (b.measurement_unit != null) row.measurement_unit = String(b.measurement_unit);
  if (b.status) row.status = String(b.status);
  if (b.transport_mode != null) row.transport_mode = String(b.transport_mode);
  if (b.weigh_mode != null) row.weigh_mode = String(b.weigh_mode);
  if (b.pack_count != null) row.pack_count = Number(b.pack_count);
  if (b.convert_ratio != null) row.convert_ratio = Number(b.convert_ratio);
  if (b.weighing_fee != null) row.weighing_fee = Number(b.weighing_fee);
  if (b.expected_arrival_start != null) row.expected_arrival_start = b.expected_arrival_start;
  if (b.expected_arrival_end != null) row.expected_arrival_end = b.expected_arrival_end;
  if (b.logistics_carrier != null) row.logistics_carrier = String(b.logistics_carrier);
  if (b.vehicle_plate != null) row.vehicle_plate = String(b.vehicle_plate);
  if (b.driver_name != null) row.driver_name = String(b.driver_name);
  if (b.driver_phone != null) row.driver_phone = String(b.driver_phone);
  if (b.driver_id_no != null) row.driver_id_no = String(b.driver_id_no);
  if (b.remarks != null) row.remarks = String(b.remarks);
  return res.json({ code:0, data: row });
});

app.delete('/v1/inbound/reservations/:id', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const i = demoStore.reservations.findIndex(r => String(r.id)===String(req.params.id) || r.reservation_number===req.params.id);
  if (i<0) return res.json({ code:404, message:'not found' });
  demoStore.reservations.splice(i,1);
  return res.json({ code:0 });
});

// Warehouse receipts
app.get('/v1/warehouse-receipts', async (req, res) => {
  try {
    if (allowDemo) {
      const page = Number(req.query.page || 1);
      const pageSize = Number(req.query.pageSize || 10);
      const total = 2;
      const list = [
        { id: 1, receipt_number: 'WR-DEMO-001', quantity: 120, measurement_unit: '吨', status: 'in_stock' },
        { id: 2, receipt_number: 'WR-DEMO-002', quantity: 80, measurement_unit: '吨', status: 'in_stock' }
      ].slice((page-1)*pageSize, page*pageSize);
      return res.json({ code: 0, data: { list, total } });
    }
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    const offset = (page - 1) * pageSize;
    const rows = await query(
      'SELECT id, receipt_number, quantity, measurement_unit, status FROM warehouse_receipts ORDER BY id DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    );
    const total = await query('SELECT COUNT(1) as c FROM warehouse_receipts', []);
    res.json({ code: 0, data: { list: rows, total: Number(total[0]?.c || 0) } });
  } catch (e) {
    res.status(500).json({ code: 500, message: String(e?.message || e) });
  }
});

// Pledges
app.get('/v1/pledges', async (req, res) => {
  try {
    if (allowDemo) {
      const page = Number(req.query.page || 1);
      const pageSize = Number(req.query.pageSize || 10);
      const total = 1;
      const list = [ { id:1, record_number:'PLG-DEMO-001', pledged_quantity:10, pledged_unit:'吨', pledge_status:'frozen' }]
        .slice((page-1)*pageSize, page*pageSize);
      return res.json({ code: 0, data: { list, total } });
    }
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    const offset = (page - 1) * pageSize;
    const rows = await query(
      'SELECT id, record_number, pledged_quantity, pledged_unit, pledge_status FROM receipt_pledge_records ORDER BY id DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    );
    const total = await query('SELECT COUNT(1) as c FROM receipt_pledge_records', []);
    res.json({ code: 0, data: { list: rows, total: Number(total[0]?.c || 0) } });
  } catch (e) {
    res.status(500).json({ code: 500, message: String(e?.message || e) });
  }
});

app.post('/v1/pledges', async (req, res) => {
  const { record_number, warehouse_receipt_id, storage_in_id, pledge_type, pledged_quantity, pledged_unit } = req.body || {};
  try {
    if (allowDemo) {
      return res.json({ code: 0, data: { id: Date.now() } });
    }
    const result = await query(
      'INSERT INTO receipt_pledge_records (record_number, warehouse_receipt_id, storage_in_id, pledge_type, pledged_quantity, pledged_unit, original_quantity, freeze_type, freeze_status, freeze_start_date, freeze_reason, frozen_by) VALUES (?,?,?,?,?,?, 0, "pledge_freeze","frozen", NOW(), "质押冻结", 1)',
      [record_number, warehouse_receipt_id, storage_in_id, pledge_type, pledged_quantity, pledged_unit]
    );
    res.json({ code: 0, data: { id: result.insertId } });
  } catch (e) {
    res.status(500).json({ code: 500, message: String(e?.message || e) });
  }
});

// Unfreeze
app.post('/v1/unfreeze/apply', async (req, res) => {
  const { pledge_record_id, request_user_id, request_reason } = req.body || {};
  try {
    if (allowDemo) {
      return res.json({ code: 0, data: { id: Date.now() } });
    }
    const result = await query(
      'INSERT INTO unfreeze_applications (application_no, pledge_record_id, request_user_id, request_reason, status) VALUES (CONCAT("UNF", UNIX_TIMESTAMP()), ?, ?, ?, "submitted")',
      [pledge_record_id, request_user_id, request_reason || '']
    );
    res.json({ code: 0, data: { id: result.insertId } });
  } catch (e) {
    res.status(500).json({ code: 500, message: String(e?.message || e) });
  }
});

app.get('/v1/unfreeze/review', async (_req, res) => {
  try {
    if (allowDemo) {
      return res.json({ code: 0, data: { list: [], total: 0 } });
    }
    const rows = await query(
      'SELECT id, application_no, pledge_record_id, status, created_at FROM unfreeze_applications ORDER BY id DESC LIMIT 50',
      []
    );
    res.json({ code: 0, data: { list: rows, total: rows.length } });
  } catch (e) {
    res.status(500).json({ code: 500, message: String(e?.message || e) });
  }
});

// Outbound
app.post('/v1/outbound/reservations', async (req, res) => {
  const { applicant_id, warehouse_id, warehouse_receipt_id, planned_quantity, measurement_unit } = req.body || {};
  try {
    if (allowDemo) {
      return res.json({ code: 0, data: { id: Date.now() } });
    }
    const result = await query(
      'INSERT INTO outbound_reservations (reservation_number, applicant_id, warehouse_id, warehouse_receipt_id, planned_quantity, measurement_unit, status) VALUES (CONCAT("OUT", UNIX_TIMESTAMP()), ?,?,?,?,?, "submitted")',
      [applicant_id, warehouse_id, warehouse_receipt_id, planned_quantity, measurement_unit]
    );
    res.json({ code: 0, data: { id: result.insertId } });
  } catch (e) {
    res.status(500).json({ code: 500, message: String(e?.message || e) });
  }
});

app.get('/v1/outbound/reservations', async (req, res) => {
  try {
    if (allowDemo) {
      const page = Number(req.query.page || 1);
      const pageSize = Number(req.query.pageSize || 10);
      const total = 1;
      const list = [ { reservation_number:'OUT-DEMO-001', status:'submitted', planned_quantity:50, measurement_unit:'吨' }]
        .slice((page-1)*pageSize, page*pageSize);
      return res.json({ code: 0, data: { list, total } });
    }
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    const offset = (page - 1) * pageSize;
    const rows = await query(
      'SELECT reservation_number, status, planned_quantity, measurement_unit FROM outbound_reservations ORDER BY id DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    );
    const total = await query('SELECT COUNT(1) as c FROM outbound_reservations', []);
    res.json({ code: 0, data: { list: rows, total: Number(total[0]?.c || 0) } });
  } catch (e) {
    res.status(500).json({ code: 500, message: String(e?.message || e) });
  }
});

// Inbound orders
app.post('/v1/inbound/orders', async (req, res) => {
  const {
    reservation_number,
    planned_quantity,
    measurement_unit,
    weigh_mode = 'by_weight',
    pack_count = null,
    pack_spec = null,
    convert_ratio = null,
    gross = null,
    tare = null,
    deductions = 0,
    actual = null
  } = req.body || {};
  try {
    if (allowDemo) {
      const row = {
        order_no: `INB-${Date.now()}`,
        reservation_number: reservation_number || `RSV${Date.now()}`,
        reservation_party: '存货人', owner_name: '演示公司',
        warehouse_name: '演示仓库', warehouse_address: '示例地址',
        commodity_name: '示例商品', commodity_spec: '',
        planned_quantity: planned_quantity || 0,
        measurement_unit: measurement_unit || '吨',
        goods_source: '', logistics_carrier: '', vehicle_plate: '', driver_name: '', driver_phone: '',
        eta: '', status: 'draft', created_at: new Date().toISOString().slice(0,16).replace('T',' '),
        warehouse_handled_at: null, platform_audited_at: null, unique_reservation_code: generateSixDigitCode(),
        weigh_mode,
        pack_count,
        pack_spec,
        convert_ratio,
        gross,
        tare,
        deductions,
        calc_weight: (weigh_mode === 'by_pack' && pack_count!=null && convert_ratio!=null)
          ? Number(pack_count) * Number(convert_ratio) : null,
        actual: (actual!=null)
          ? Number(actual)
          : (weigh_mode === 'by_weight' && gross!=null && tare!=null)
            ? (Number(gross) - Number(tare) - Number(deductions||0))
            : (weigh_mode === 'by_pack' && pack_count!=null && convert_ratio!=null)
              ? Number(pack_count) * Number(convert_ratio)
              : null
      };
      demoStore.inboundOrders.unshift(row);
      return res.json({ code: 0, data: { id: row.order_no } });
    }
    const result = await query(
      'INSERT INTO inbound_orders (order_no, reservation_number, planned_quantity, measurement_unit, status) VALUES (CONCAT("INB", UNIX_TIMESTAMP()), ?, ?, ?, "created")',
      [reservation_number || '', planned_quantity || 0, measurement_unit || '吨']
    );
    res.json({ code: 0, data: { id: result.insertId } });
  } catch (e) {
    res.status(500).json({ code: 500, message: String(e?.message || e) });
  }
});

app.get('/v1/inbound/orders', async (req, res) => {
  try {
    if (allowDemo) {
      const page = Number(req.query.page || 1);
      const pageSize = Number(req.query.pageSize || 10);
      // seed demo if empty
      if (!demoStore.inboundOrders.length) {
        demoStore.inboundOrders = [
        {
          order_no: 'INB-DEMO-001',
          reservation_number: 'RSV202411110001',
          reservation_party: '存货人',
          owner_name: '华夏粮油集团有限公司',
          warehouse_name: '天津港1号仓',
          warehouse_address: '天津市滨海新区港口路88号',
          commodity_name: '大豆/非转基因',
          commodity_spec: '散装',
          planned_quantity: 100,
          measurement_unit: '吨',
          goods_source: '黑龙江佳木斯',
          logistics_carrier: '京东物流',
          vehicle_plate: '津A12345',
          driver_name: '张三',
          driver_phone: '138****5678',
          eta: '2025-10-02 10:00',
          status: 'created',
          created_at: '2025-10-01 09:00',
          warehouse_handled_at: null,
          platform_audited_at: null,
          unique_reservation_code: '483920'
        },
        {
          order_no: 'INB-DEMO-002',
          reservation_number: 'RSV202411110002',
          reservation_party: '物流方',
          owner_name: '广源贸易有限公司',
          warehouse_name: '上海化工仓B区',
          warehouse_address: '上海市奉贤区化工路1号',
          commodity_name: '聚丙烯/PP-R',
          commodity_spec: '25KG/袋',
          planned_quantity: 80,
          measurement_unit: '吨',
          goods_source: '中石化镇海',
          logistics_carrier: '德邦快递',
          vehicle_plate: '沪B56789',
          driver_name: '李四',
          driver_phone: '139****9876',
          eta: '2025-10-02 15:30',
          status: 'receiving',
          created_at: '2025-10-01 08:30',
          warehouse_handled_at: '2025-10-01 18:00',
          platform_audited_at: null,
          unique_reservation_code: '572614'
        }
      ];
      }
      const total = demoStore.inboundOrders.length;
      const list = demoStore.inboundOrders.slice((page-1)*pageSize, page*pageSize);
      return res.json({ code: 0, data: { list, total } });
    }
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    const offset = (page - 1) * pageSize;
    const rows = await query(
      'SELECT order_no, reservation_number, status, planned_quantity, measurement_unit FROM inbound_orders ORDER BY id DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    );
    const total = await query('SELECT COUNT(1) as c FROM inbound_orders', []);
    res.json({ code: 0, data: { list: rows, total: Number(total[0]?.c || 0) } });
  } catch (e) {
    res.status(500).json({ code: 500, message: String(e?.message || e) });
  }
});

// Inbound order item CRUD (demo)
app.get('/v1/inbound/orders/:id', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const row = demoStore.inboundOrders.find(o => o.order_no === req.params.id || o.reservation_number === req.params.id);
  if (!row) return res.json({ code:404, message:'not found' });
  return res.json({ code:0, data: row });
});

app.put('/v1/inbound/orders/:id', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const row = demoStore.inboundOrders.find(o => o.order_no === req.params.id || o.reservation_number === req.params.id);
  if (!row) return res.json({ code:404, message:'not found' });
  const b = req.body || {};
  // allow updating planned_quantity, measurement_unit, eta, status
  if (b.planned_quantity != null) row.planned_quantity = Number(b.planned_quantity);
  if (b.measurement_unit != null) row.measurement_unit = String(b.measurement_unit);
  if (b.eta != null) row.eta = String(b.eta);
  if (b.status) row.status = String(b.status);
  return res.json({ code:0, data: row });
});

app.delete('/v1/inbound/orders/:id', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const i = demoStore.inboundOrders.findIndex(o => o.order_no === req.params.id || o.reservation_number === req.params.id);
  if (i < 0) return res.json({ code:404, message:'not found' });
  demoStore.inboundOrders.splice(i,1);
  return res.json({ code:0 });
});

// Documents (demo): upload by JSON (url/filename), list by scope/ref_id
app.post('/v1/docs/upload', (req, res) => {
  try{
    const { scope, ref_id, doc_type, url, filename } = req.body || {};
    if(!scope || !ref_id || !doc_type){ return res.status(400).json({ code:400, message:'scope/ref_id/doc_type required' }); }
    const rec = { id: Date.now(), scope, ref_id: String(ref_id), doc_type, url: url||'', filename: filename||'', uploaded_at: new Date().toISOString() };
    if (allowDemo) demoStore.docs.unshift(rec);
    // 如果是预约磅单，顺带写入预约记录的 doc_url 方便列表直接展示（demo）
    if (allowDemo && scope === 'reservation'){
      const r = demoStore.reservations.find(x => String(x.id)===String(ref_id) || x.reservation_number===String(ref_id));
      if (r) r.doc_url = url || '';
    }
    return res.json({ code:0, data:{ id: rec.id } });
  }catch(e){ return res.status(500).json({ code:500, message:String(e?.message||e) }); }
});

app.get('/v1/docs/list', (req, res) => {
  try{
    const { scope, ref_id } = req.query || {};
    if(!scope || !ref_id) return res.json({ code:0, data:{ list:[], total:0 } });
    if (allowDemo){
      const list = demoStore.docs.filter(d => d.scope===scope && d.ref_id===String(ref_id));
      return res.json({ code:0, data:{ list, total:list.length } });
    }
    // non-demo not implemented
    return res.status(501).json({ code:501, message:'not implemented' });
  }catch(e){ return res.status(500).json({ code:500, message:String(e?.message||e) }); }
});

// Gate verify: wechat + phone check
app.post('/v1/inbound/gate/verify/wechat', (req, res) => {
  try{
    if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
    const { reservation_code, driver_phone, vehicle_plate='', wechat_openid='' } = req.body || {};
    const r = demoStore.reservations.find(x => String(x.unique_reservation_code)===String(reservation_code));
    if (!r) return res.json({ code:404, message:'预约不存在或已失效' });
    const order_no = `INB-${Date.now()}`;
    // phone match rule: demo 用 owner_address 中是否包含最后两位数字模拟（仅演示）
    const phoneMatched = true; // 放行为主，默认 true；如需模拟不一致：Math.random()<0.3
    demoStore.inboundOrders.unshift({
      order_no,
      reservation_number: r.reservation_number,
      owner_name: r.owner_name,
      warehouse_name: (demoStore.warehouses.find(w=>w.id===r.target_warehouse_id)||{}).name || '',
      warehouse_address: (demoStore.warehouses.find(w=>w.id===r.target_warehouse_id)||{}).address || '',
      commodity_name: '', commodity_spec: '', planned_quantity: r.total_planned_quantity, measurement_unit: r.measurement_unit,
      vehicle_plate, driver_phone, status:'created', created_at: new Date().toISOString().slice(0,16).replace('T',' '), unique_reservation_code: r.unique_reservation_code
    });
    // gate event
    demoStore.gateEvents.unshift({ id: Date.now(), reservation_number: r.reservation_number, reservation_code, driver_phone, vehicle_plate, wechat_openid, phoneMatched, arrive_at: new Date().toISOString() });
    // alert placeholder
    if (!phoneMatched){
      const wh = demoStore.warehouses.find(w=>w.id===r.target_warehouse_id);
      const receiver = wh?.manager_phone || '13800000000';
      const content = `[告警] 门岗手机号不一致 预约:${reservation_code} 司机:${driver_phone} 仓库:${wh?.name||''}`;
      demoStore.alerts.unshift({ id: Date.now(), type:'gate_mismatch', receiver, content, created_at: new Date().toISOString() });
      // 占位：控制台输出，后续对接短信/企业微信
      console.log(content);
    }
    return res.json({ code:0, data:{ ok:true, inbound_order_no: order_no, reservation: r, phoneMatched } });
  }catch(e){ return res.status(500).json({ code:500, message:String(e?.message||e) }); }
});

// Alerts list (demo)
app.get('/v1/alerts', (_req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  return res.json({ code:0, data:{ list: demoStore.alerts.slice(0,50), total: demoStore.alerts.length } });
});

// Scale records (demo)
app.post('/v1/scale/records', (req, res) => {
  try{
    const { ref_type='inbound_order', ref_id, gross, tare, deductions=0, actual=null } = req.body || {};
    if(!ref_id) return res.status(400).json({ code:400, message:'ref_id required' });
    const net = (gross!=null && tare!=null) ? (Number(gross)-Number(tare)) : null;
    const rec = { id: Date.now(), ref_type, ref_id: String(ref_id), gross, tare, net, deductions, actual: (actual!=null? Number(actual) : (net!=null? net-Number(deductions||0) : null)), weighed_at: new Date().toISOString() };
    if (allowDemo) demoStore.scaleRecords.unshift(rec);
    return res.json({ code:0, data:{ id: rec.id } });
  }catch(e){ return res.status(500).json({ code:500, message:String(e?.message||e) }); }
});

app.get('/v1/scale/records', (req, res) => {
  try{
    const { ref_type='inbound_order', ref_id } = req.query || {};
    if(!ref_id) return res.json({ code:0, data:{ list:[], total:0 } });
    if (allowDemo){
      const list = demoStore.scaleRecords.filter(r => r.ref_type===ref_type && r.ref_id===String(ref_id));
      return res.json({ code:0, data:{ list, total:list.length } });
    }
    return res.status(501).json({ code:501, message:'not implemented' });
  }catch(e){ return res.status(500).json({ code:500, message:String(e?.message||e) }); }
});

// Batch import precheck (validate only, no DB writes)
app.post('/v1/inbound/orders/batch/precheck', async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [];
    // Prepare existing keys to detect duplicates (in demo mode)
    const existNumbers = new Set();
    if (allowDemo) {
      for (const o of demoStore.inboundOrders) {
        existNumbers.add(String(o.reservation_number || o.order_no || ''));
      }
    } else {
      try {
        const rows = await query('SELECT reservation_number, order_no FROM inbound_orders LIMIT 10000', []);
        for (const r of rows) existNumbers.add(String(r.reservation_number || r.order_no || ''));
      } catch {}
    }

    const batchSeen = new Set();
    const allowedParties = new Set(['存货人', '物流方', '仓库方', '', undefined, null]);
    const results = items.map((it, idx) => {
      const row = it || {};
      const errors = [];
      const warnings = [];
      const num = String(row.reservation_number || row.order_no || '').trim();
      const qty = Number(row.planned_quantity);
      const unit = String(row.measurement_unit || '').trim();
      const code = String(row.unique_reservation_code || '').trim();
      const party = row.reservation_party;

      if (!num) errors.push('缺少预约单号');
      if (!Number.isFinite(qty) || qty <= 0) errors.push('计划数量需为正数');
      if (!unit) errors.push('计量单位必填');
      if (!allowedParties.has(party)) warnings.push('预约方非常规值');
      if (code && !/^\d{6}$/.test(code)) warnings.push('预约码建议为6位数字');

      if (num) {
        if (batchSeen.has(num)) errors.push('本次导入内存在重复预约单号');
        batchSeen.add(num);
        if (existNumbers.has(num)) warnings.push('预约单号与系统中已存在可能冲突');
      }

      return { index: idx, ok: errors.length === 0, errors, warnings };
    });

    const valid = results.every(r => r.ok);
    res.json({ code: 0, data: { valid, items: results } });
  } catch (e) {
    res.status(500).json({ code: 500, message: String(e?.message || e) });
  }
});

// State transitions (demo)
function findDemoOrder(id){ return demoStore.inboundOrders.find(o => o.order_no === id || o.reservation_number === id); }

app.post('/v1/inbound/orders/:id/submit', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const row = findDemoOrder(req.params.id); if (!row) return res.json({ code:404, message:'not found' });
  if (row.status === 'draft') row.status = 'created';
  return res.json({ code:0 });
});

app.post('/v1/inbound/orders/:id/withdraw', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const row = findDemoOrder(req.params.id); if (!row) return res.json({ code:404, message:'not found' });
  if (row.status === 'created') row.status = 'draft';
  return res.json({ code:0 });
});

app.post('/v1/inbound/orders/:id/cancel', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const row = findDemoOrder(req.params.id); if (!row) return res.json({ code:404, message:'not found' });
  row.status = 'cancelled';
  return res.json({ code:0 });
});

app.post('/v1/inbound/orders/:id/arrival', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const row = findDemoOrder(req.params.id); if (!row) return res.json({ code:404, message:'not found' });
  row.status = row.status === 'partially_delivered' ? 'partially_delivered' : 'receiving';
  return res.json({ code:0 });
});

app.post('/v1/inbound/orders/:id/finish', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const row = findDemoOrder(req.params.id); if (!row) return res.json({ code:404, message:'not found' });
  row.status = 'completed';
  return res.json({ code:0 });
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => console.log(`Backend listening on http://127.0.0.1:${port}`));

