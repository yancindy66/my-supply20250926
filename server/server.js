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
      return res.json({
        user: { id: 1, name: '演示用户', username: 'demo', organization_id: 1001, type: 'depositor' },
        roles: [{ id: 1, role_key: 'depositor', role_name: '存货人' }],
        permissions: ['/inbound/apply','/warehouse-receipt/list','/pledge/list'],
        data_scope: 'organization'
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
    res.json({ user, roles, permissions: permissions.map(p => p.permission_key), data_scope: 'organization' });
  } catch (e) {
    if (allowDemo) {
      return res.json({
        user: { id: 1, name: '演示用户', username: 'demo', organization_id: 1001, type: 'depositor' },
        roles: [{ id: 1, role_key: 'depositor', role_name: '存货人' }],
        permissions: ['/inbound/apply','/warehouse-receipt/list','/pledge/list'],
        data_scope: 'organization'
      });
    }
    res.status(500).json({ code: 500, message: String(e?.message || e) });
  }
});

// Inbound reservations
app.get('/v1/inbound/reservations', async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    const offset = (page - 1) * pageSize;
    const list = await query(
      'SELECT reservation_number, status, target_warehouse_id, commodity_id, total_planned_quantity, measurement_unit FROM inbound_reservations ORDER BY id DESC LIMIT ? OFFSET ?',
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
    const result = await query(
      'INSERT INTO inbound_reservations (reservation_number, reservation_type, reservist_id, applicant_id, target_warehouse_id, commodity_id, total_planned_quantity, measurement_unit, status) VALUES (CONCAT("RSV", UNIX_TIMESTAMP()), "by_depositor", ?, ?, ?, ?, ?, ?, "submitted")',
      [b.reservist_id || b.applicant_id || 1, b.applicant_id || 1, b.target_warehouse_id, b.commodity_id, b.total_planned_quantity, b.measurement_unit]
    );
    return res.json({ code: 0, data: { id: result.insertId } });
  } catch (e) {
    res.status(500).json({ code: 500, message: String(e?.message || e) });
  }
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

const port = Number(process.env.PORT || 8080);
app.listen(port, () => console.log(`Backend listening on http://127.0.0.1:${port}`));

