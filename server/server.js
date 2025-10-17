import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { query, getConnection } from './db.js';
import multer from 'multer';
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
const upload = multer({ storage: multer.memoryStorage() });
// OnlyOffice 保存文件的本地存储目录（相对当前 server 进程工作目录）
const OO_SAVE_DIR = path.resolve(process.cwd(), 'saved-oo');

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Silence favicon requests to avoid console 404 noise
app.get('/favicon.ico', (_req, res) => res.status(204).end());

// Auth
const allowDemo = String(process.env.ALLOW_DEMO || '').toLowerCase() === '1' || String(process.env.ALLOW_DEMO || '').toLowerCase() === 'true';
// Demo in-memory store
let demoStore = { inboundOrders: [], reservations: [], docs: [], scaleRecords: [], products: [], warehouses: [], gateEvents: [], alerts: [] };
// 导入数据集（demo）：以 id 索引的 Map，元素形如 { id, type:'inbound', headers: string[], rows: any[], created_at, updated_at }
if (!demoStore.importDatasets) demoStore.importDatasets = new Map();
const IMPORT_SAVE_DIR = path.resolve(process.cwd(), 'saved-imports');
const INBOUND_SAVE_FILE = path.join(IMPORT_SAVE_DIR, 'inbound.json');

function loadImportsFromDisk(){
  try{
    if (!fs.existsSync(INBOUND_SAVE_FILE)) return;
    const text = fs.readFileSync(INBOUND_SAVE_FILE, 'utf-8');
    const obj = JSON.parse(text||'{}');
    const map = new Map();
    if (obj && typeof obj==='object'){
      for (const [k, v] of Object.entries(obj)){
        map.set(k, v);
      }
    }
    demoStore.importDatasets = map;
    console.log('[imports] inbound datasets loaded from disk:', map.size);
  }catch(e){ console.error('[imports] load error:', e?.message||e); }
}
function saveImportsToDisk(){
  try{
    if (!fs.existsSync(IMPORT_SAVE_DIR)) fs.mkdirSync(IMPORT_SAVE_DIR, { recursive: true });
    const obj = Object.fromEntries(demoStore.importDatasets.entries());
    fs.writeFileSync(INBOUND_SAVE_FILE, JSON.stringify(obj));
  }catch(e){ console.error('[imports] save error:', e?.message||e); }
}
// 启动时尝试恢复
loadImportsFromDisk();

// Demo audit log → memory + optional file
const demoLogToFile = String(process.env.DEMO_LOG_TO_FILE || '').toLowerCase() === '1' || String(process.env.DEMO_LOG_TO_FILE || '').toLowerCase() === 'true';
const demoLogFile = process.env.DEMO_LOG_FILE || 'demo-audit.log';
function pushAudit(entry){
  const rec = { id: entry.id || (Date.now()+Math.floor(Math.random()*1000)), ...entry };
  if(allowDemo){
    if(!demoStore.auditLogs) demoStore.auditLogs = [];
  demoStore.auditLogs.unshift(rec);
  if (demoLogToFile) {
    try { fs.appendFileSync(demoLogFile, JSON.stringify(rec) + '\n'); } catch(e) {}
  }
    return;
  }
  try{
    query('CREATE TABLE IF NOT EXISTS audit_logs (id BIGINT PRIMARY KEY AUTO_INCREMENT, scope VARCHAR(64) NOT NULL, ref_id VARCHAR(128) NOT NULL, action VARCHAR(64) NOT NULL, actor VARCHAR(128) NOT NULL, ts DATETIME NOT NULL, detail JSON NULL, INDEX idx_scope_ref (scope, ref_id), INDEX idx_ts (ts)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4', []);
    const { scope='', ref_id='', action='', actor='', ts=new Date().toISOString(), detail=null } = rec || {};
    query('INSERT INTO audit_logs (scope, ref_id, action, actor, ts, detail) VALUES (?,?,?,?,?,?)', [String(scope), String(ref_id), String(action), String(actor), String(ts).slice(0,19).replace('T',' '), detail? JSON.stringify(detail): null]);
  }catch{}
}

// ---- 简易请求上下文（演示环境）：从头部读取角色与用户ID ----
app.use((req, _res, next) => {
  const role = String(req.headers['x-role'] || '').toLowerCase();
  const uidRaw = req.headers['x-user-id'];
  const userId = Number(uidRaw || 0);
  const ctx = { role: role || (allowDemo ? 'inventory' : ''), userId: (userId || (allowDemo ? 1 : 0)) };
  // @ts-ignore
  req.ctx = ctx;
  next();
});

// ===== 导入数据集（入库申请）保存/编辑/删除（demo） =====
// 创建或覆盖一个数据集
app.post('/v1/imports/inbound', (req, res) => {
  try{
    if (!allowDemo){
      (async () => {
        const headers = Array.isArray(req.body?.headers)? req.body.headers : [];
        const rows = Array.isArray(req.body?.rows)? req.body.rows : [];
        const id = String(req.body?.id || Date.now());
        const user_id = Number(req.body?.user_id || 0) || null;
        const dataset_date = String(req.body?.dataset_date || '').trim() || null;
        // @ts-ignore
        const ctx = req.ctx || { userId:0 };
        if (user_id && ctx.userId && Number(user_id)!==Number(ctx.userId)) return res.status(403).json({ code:403, message:'forbidden' });
        const now = new Date().toISOString().slice(0,19).replace('T',' ');
        const conn = await getConnection();
        try{
          await conn.beginTransaction();
          await conn.query('CREATE TABLE IF NOT EXISTS import_inbound_datasets (id VARCHAR(64) PRIMARY KEY, user_id BIGINT NULL, dataset_date CHAR(8) NULL, headers JSON NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
          await conn.query('CREATE TABLE IF NOT EXISTS import_inbound_rows (id BIGINT PRIMARY KEY AUTO_INCREMENT, dataset_id VARCHAR(64) NOT NULL, row_index INT NOT NULL, data JSON NOT NULL, deleted TINYINT(1) NOT NULL DEFAULT 0, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, INDEX idx_dataset_row (dataset_id, row_index)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
          await conn.query('INSERT INTO import_inbound_datasets (id,user_id,dataset_date,headers,created_at,updated_at) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE headers=VALUES(headers), user_id=VALUES(user_id), dataset_date=VALUES(dataset_date), updated_at=VALUES(updated_at)', [id, user_id, dataset_date, JSON.stringify(headers||[]), now, now]);
          await conn.query('DELETE FROM import_inbound_rows WHERE dataset_id=?', [id]);
          if (rows.length){
            const values = rows.map((r,idx)=> [id, idx, JSON.stringify(r||{}), 0, now, now]);
            await conn.query('INSERT INTO import_inbound_rows (dataset_id,row_index,data,deleted,created_at,updated_at) VALUES ?',[values]);
          }
          await conn.commit();
        }catch(e){ try{ await conn.rollback(); }catch{} throw e; }
        finally{ try{ conn.release(); }catch{} }
        pushAudit({ scope:'import_inbound', ref_id:id, action:'draft_save', actor:'mysql', ts: now, detail:{ rows: rows.length, headers: headers.length } });
        return res.json({ code:0, data:{ id } });
      })().catch(e=> res.status(500).json({ code:500, message:String(e?.message||e) }));
      return;
    }
    const headers = Array.isArray(req.body?.headers)? req.body.headers : [];
    const rows = Array.isArray(req.body?.rows)? req.body.rows : [];
    const id = String(req.body?.id || Date.now());
    const now = new Date().toISOString();
    const ds = { id, type:'inbound', headers, rows, created_at: now, updated_at: now };
    demoStore.importDatasets.set(id, ds);
    saveImportsToDisk();
    pushAudit({ scope:'import_inbound', ref_id:id, action:'draft_save', actor:'depositor_demo', ts: now, detail:{ rows: rows.length, headers: headers.length } });
    return res.json({ code:0, data:{ id } });
  }catch(e){ return res.status(500).json({ code:500, message:String(e?.message||e) }); }
});

// 获取数据集
app.get('/v1/imports/inbound/:id', (req, res) => {
  try{
    if (!allowDemo){
      (async ()=>{
        const id = String(req.params.id);
        // 基于 ID 前缀/用户ID进行隔离校验（格式 inbound-<userId>-YYYYMMDD）
        // @ts-ignore
        const ctx = req.ctx || { role:'', userId:0 };
        const parts = id.split('-');
        const idUser = Number(parts?.[1] || 0) || 0;
        if (idUser && ctx.userId && idUser !== ctx.userId){ return res.status(403).json({ code:403, message:'forbidden' }); }
        const rows = await query('SELECT headers, created_at, updated_at, user_id, dataset_date FROM import_inbound_datasets WHERE id=? LIMIT 1',[id]);
        if(!rows.length) return res.json({ code:404, message:'not found' });
        const ds = rows[0];
        if (ds.user_id && ctx.userId && Number(ds.user_id)!==Number(ctx.userId)) return res.status(403).json({ code:403, message:'forbidden' });
        const list = await query('SELECT row_index, data FROM import_inbound_rows WHERE dataset_id=? AND deleted=0 ORDER BY row_index ASC',[id]);
        return res.json({ code:0, data:{ id, headers: JSON.parse(ds.headers||'[]'), rows: list.map(x=> JSON.parse(x.data||'{}')), user_id: ds.user_id||null, dataset_date: ds.dataset_date||null, created_at: ds.created_at, updated_at: ds.updated_at } });
      })().catch(e=> res.status(500).json({ code:500, message:String(e?.message||e) }));
      return;
    }
    const ds = demoStore.importDatasets.get(String(req.params.id));
    if(!ds) return res.json({ code:404, message:'not found' });
    return res.json({ code:0, data: ds });
  }catch(e){ return res.status(500).json({ code:500, message:String(e?.message||e) }); }
});

// 更新整批（覆盖）
app.put('/v1/imports/inbound/:id', (req, res) => {
  try{
    if (!allowDemo){
      (async ()=>{
        const id = String(req.params.id);
        // @ts-ignore
        const ctx = req.ctx || { userId:0 };
        const parts = id.split('-');
        const idUser = Number(parts?.[1] || 0) || 0;
        if (idUser && ctx.userId && idUser !== ctx.userId){ return res.status(403).json({ code:403, message:'forbidden' }); }
        const dsRows = await query('SELECT id FROM import_inbound_datasets WHERE id=? LIMIT 1',[id]);
        if(!dsRows.length) return res.json({ code:404, message:'not found' });
        const headers = Array.isArray(req.body?.headers)? req.body.headers : null;
        const rows = Array.isArray(req.body?.rows)? req.body.rows : null;
        const now = new Date().toISOString().slice(0,19).replace('T',' ');
        if (headers){ await query('UPDATE import_inbound_datasets SET headers=?, updated_at=? WHERE id=?', [JSON.stringify(headers), now, id]); }
        if (rows){
          const conn = await getConnection();
          try{
            await conn.beginTransaction();
            await conn.query('DELETE FROM import_inbound_rows WHERE dataset_id=?', [id]);
            if (rows.length){
              const values = rows.map((r,idx)=> [id, idx, JSON.stringify(r||{}), 0, now, now]);
              await conn.query('INSERT INTO import_inbound_rows (dataset_id,row_index,data,deleted,created_at,updated_at) VALUES ?', [values]);
            }
            await conn.commit();
          }catch(e){ try{ await conn.rollback(); }catch{} throw e; }
          finally{ try{ conn.release(); }catch{} }
        }
        pushAudit({ scope:'import_inbound', ref_id:id, action:'draft_overwrite', actor:'mysql', ts: now, detail:{ rows: rows? rows.length: undefined } });
        return res.json({ code:0 });
      })().catch(e=> res.status(500).json({ code:500, message:String(e?.message||e) }));
      return;
    }
    const id = String(req.params.id);
    const ds = demoStore.importDatasets.get(id);
    if(!ds) return res.json({ code:404, message:'not found' });
    const headers = Array.isArray(req.body?.headers)? req.body.headers : ds.headers;
    const rows = Array.isArray(req.body?.rows)? req.body.rows : ds.rows;
    ds.headers = headers; ds.rows = rows; ds.updated_at = new Date().toISOString();
    pushAudit({ scope:'import_inbound', ref_id:id, action:'draft_overwrite', actor:'depositor_demo', ts: ds.updated_at, detail:{ rows: rows.length } });
    saveImportsToDisk();
    return res.json({ code:0, data: ds });
  }catch(e){ return res.status(500).json({ code:500, message:String(e?.message||e) }); }
});

// 更新单行
app.put('/v1/imports/inbound/:id/row/:idx', (req, res) => {
  try{
    if (!allowDemo){
      (async ()=>{
        const id = String(req.params.id); const idx = Number(req.params.idx);
        // @ts-ignore
        const ctx = req.ctx || { userId:0 };
        const parts = id.split('-');
        const idUser = Number(parts?.[1] || 0) || 0;
        if (idUser && ctx.userId && idUser !== ctx.userId){ return res.status(403).json({ code:403, message:'forbidden' }); }
        const now = new Date().toISOString().slice(0,19).replace('T',' ');
        const exist = await query('SELECT id FROM import_inbound_rows WHERE dataset_id=? AND row_index=? LIMIT 1',[id, idx]);
        if(exist.length){
          await query('UPDATE import_inbound_rows SET data=?, deleted=0, updated_at=? WHERE dataset_id=? AND row_index=?', [JSON.stringify(req.body||{}), now, id, idx]);
        }else{
          await query('INSERT INTO import_inbound_rows (dataset_id,row_index,data,deleted,created_at,updated_at) VALUES (?,?,?,?,?,?)',[id, idx, JSON.stringify(req.body||{}), 0, now, now]);
        }
        pushAudit({ scope:'import_inbound', ref_id:id, action:'row_edit', actor:'mysql', ts: now, detail:{ row_index: idx } });
        return res.json({ code:0 });
      })().catch(e=> res.status(500).json({ code:500, message:String(e?.message||e) }));
      return;
    }
    const id = String(req.params.id); const idx = Number(req.params.idx);
    const ds = demoStore.importDatasets.get(id);
    if(!ds) return res.json({ code:404, message:'not found' });
    if(idx<0 || idx>=ds.rows.length) return res.json({ code:400, message:'row index out of range' });
    ds.rows[idx] = { ...(req.body||{}) };
    ds.updated_at = new Date().toISOString();
    pushAudit({ scope:'import_inbound', ref_id:id, action:'row_edit', actor:'depositor_demo', ts: ds.updated_at, detail:{ row_index: idx } });
    saveImportsToDisk();
    return res.json({ code:0, data:{ row: ds.rows[idx] } });
  }catch(e){ return res.status(500).json({ code:500, message:String(e?.message||e) }); }
});

// 删除单行
app.delete('/v1/imports/inbound/:id/row/:idx', (req, res) => {
  try{
    if (!allowDemo){
      (async ()=>{
        const id = String(req.params.id); const idx = Number(req.params.idx);
        // @ts-ignore
        const ctx = req.ctx || { userId:0 };
        const parts = id.split('-');
        const idUser = Number(parts?.[1] || 0) || 0;
        if (idUser && ctx.userId && idUser !== ctx.userId){ return res.status(403).json({ code:403, message:'forbidden' }); }
        const now = new Date().toISOString().slice(0,19).replace('T',' ');
        await query('UPDATE import_inbound_rows SET deleted=1, updated_at=? WHERE dataset_id=? AND row_index=?',[now, id, idx]);
        pushAudit({ scope:'import_inbound', ref_id:id, action:'row_delete', actor:'mysql', ts: now, detail:{ row_index: idx, removed: 1 } });
        return res.json({ code:0 });
      })().catch(e=> res.status(500).json({ code:500, message:String(e?.message||e) }));
      return;
    }
    const id = String(req.params.id); const idx = Number(req.params.idx);
    const ds = demoStore.importDatasets.get(id);
    if(!ds) return res.json({ code:404, message:'not found' });
    if(idx<0 || idx>=ds.rows.length) return res.json({ code:400, message:'row index out of range' });
    const removed = ds.rows.splice(idx,1);
    ds.updated_at = new Date().toISOString();
    pushAudit({ scope:'import_inbound', ref_id:id, action:'row_delete', actor:'depositor_demo', ts: ds.updated_at, detail:{ row_index: idx, removed: removed.length } });
    saveImportsToDisk();
    return res.json({ code:0, data:{ rows: ds.rows.length } });
  }catch(e){ return res.status(500).json({ code:500, message:String(e?.message||e) }); }
});

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

// --- Simple inventory demo endpoints ---
function getInventoryKey(warehouseId, productId, unit, lot){
  return [String(warehouseId||''), String(productId||''), String(unit||''), String(lot||'')].join('|');
}

if (!demoStore.inventory) demoStore.inventory = new Map();

// Stock-in
app.post('/api/stock-in', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const { warehouse_id, product_id, quantity, unit='吨', lot_no='' } = req.body || {};
  const wh = Number(warehouse_id), pid = Number(product_id);
  const qty = Number(quantity||0);
  if (!wh || !pid || !Number.isFinite(qty) || qty<=0) return res.status(400).json({ code:400, message:'参数错误' });
  const key = getInventoryKey(wh, pid, String(unit), String(lot_no||''));
  const old = demoStore.inventory.get(key) || { warehouse_id: wh, product_id: pid, unit: String(unit), lot_no: String(lot_no||''), quantity: 0 };
  const now = { ...old, quantity: Number(old.quantity||0) + qty };
  demoStore.inventory.set(key, now);
  return res.json({ code:0, data: now });
});

// Stock-out
app.post('/api/stock-out', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const { warehouse_id, product_id, quantity, unit='吨', lot_no='' } = req.body || {};
  const wh = Number(warehouse_id), pid = Number(product_id);
  const qty = Number(quantity||0);
  if (!wh || !pid || !Number.isFinite(qty) || qty<=0) return res.status(400).json({ code:400, message:'参数错误' });
  const key = getInventoryKey(wh, pid, String(unit), String(lot_no||''));
  const old = demoStore.inventory.get(key) || { warehouse_id: wh, product_id: pid, unit: String(unit), lot_no: String(lot_no||''), quantity: 0 };
  if (Number(old.quantity||0) < qty) return res.status(400).json({ code:400, message:'库存不足' });
  const now = { ...old, quantity: Number(old.quantity||0) - qty };
  demoStore.inventory.set(key, now);
  return res.json({ code:0, data: now });
});

// Inventory list
app.get('/api/inventory', (_req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const list = Array.from(demoStore.inventory.values());
  return res.json({ code:0, data:{ list, total: list.length } });
});

// Inbound reservations
app.get('/v1/inbound/reservations', async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 10);
    if (allowDemo) {
      // @ts-ignore
      const ctx = req.ctx || { role:'', userId:0 };
      if (!demoStore.reservations.length) {
        demoStore.reservations = [
          { id:1, reservation_number:'RSV202411110001', unique_reservation_code:'483920', owner_name:'华夏粮油集团有限公司', owner_address:'天津市南开区', status:'submitted', target_warehouse_id:1, commodity_id:1, total_planned_quantity:100, measurement_unit:'吨', created_at:'2025-10-01 09:00' },
          { id:2, reservation_number:'RSV202411110002', unique_reservation_code:'572614', owner_name:'广源贸易有限公司', owner_address:'上海市浦东新区', status:'submitted', target_warehouse_id:2, commodity_id:2, total_planned_quantity:80, measurement_unit:'吨', created_at:'2025-10-01 10:30' }
        ];
      }
      // 仅返回当前用户创建的数据（存货人），仓储角色可按仓库维度过滤（略）
      let rows = demoStore.reservations.slice();
      if (ctx.role==='inventory' && ctx.userId){ rows = rows.filter(r => Number(r.created_by_user_id||0)===Number(ctx.userId)); }
      const total = rows.length;
      const start = (page-1)*pageSize;
      const list = rows.slice(start, start+pageSize);
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
      // @ts-ignore
      const ctx = req.ctx || { userId: 0, role: '' };
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
        created_by_user_id: Number(ctx.userId||0),
        created_by_role: String(ctx.role||'') || 'inventory',
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

// Pending list should be defined BEFORE ":id" routes to avoid being captured as id
app.get('/v1/inbound/reservations/pending', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const wid = req.query.warehouse_id? String(req.query.warehouse_id) : undefined;
  const list = demoStore.reservations.filter(r => r.status==='pending' && (!wid || String(r.target_warehouse_id)===wid));
  return res.json({ code:0, data:{ list, total:list.length } });
});

// Query reservations by reservation numbers (bulk)
app.post('/v1/inbound/reservations/by-numbers', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const nums = Array.isArray(req.body) ? req.body.map(x => String(x)) : [];
  const list = demoStore.reservations.filter(r => nums.includes(String(r.reservation_number)));
  return res.json({ code:0, data:{ list, total:list.length } });
});

// Place batch APIs BEFORE generic ":id" routes to avoid being captured by them
app.get('/v1/inbound/reservations/batch-stats', (req, res) => {
  try{
    if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
    const bno = String(req.query.client_batch_no||'');
    const all = Array.isArray(demoStore.reservations)? demoStore.reservations : [];
    if (bno) {
      const list = all.filter(r => String(r.client_batch_no||'')===bno).map(r => ({
        reservation_number: r.reservation_number,
        items: Array.isArray(r.detail_lines)? r.detail_lines.length : 0,
        total_planned_quantity: Number(r.total_planned_quantity||0),
        status: r.status,
        created_at: r.created_at
      }));
      const total_items = list.reduce((s,x)=>s+Number(x.items||0),0);
      const reservations_count = list.length;
      const lastImport = (Array.isArray(demoStore.auditLogs)? demoStore.auditLogs : []).find(x => x.action==='import_create' && String(x?.detail?.client_batch_no||'')===bno) || null;
      return res.json({ code:0, data:{ client_batch_no: bno, reservations:list, reservations_count, total_items, last_import: lastImport } });
    }
    const map = new Map();
    for (const r of all){
      const k = String(r.client_batch_no||'');
      if (!k) continue;
      const entry = map.get(k) || { client_batch_no:k, reservations_count:0, total_items:0, total_planned_quantity:0, latest_reservation_number:'', latest_created_at:'' };
      entry.reservations_count += 1;
      entry.total_items += Array.isArray(r.detail_lines)? r.detail_lines.length : 0;
      entry.total_planned_quantity += Number(r.total_planned_quantity||0);
      if (!entry.latest_created_at || String(r.created_at||'')>entry.latest_created_at){ entry.latest_created_at = String(r.created_at||''); entry.latest_reservation_number = r.reservation_number; }
      map.set(k, entry);
    }
    return res.json({ code:0, data:{ list: Array.from(map.values()), total: map.size } });
  }catch(e){ return res.status(500).json({ code:500, message:String(e?.message||e) }); }
});

app.get('/v1/inbound/reservations/batch/:batch/detail', (req, res) => {
  try{
    if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
    const bno = String(req.params.batch||'');
    if (!bno) return res.json({ code:0, data:{ client_batch_no:'', reservations:[], items:[], total_items:0, total_planned_quantity:0 } });
    const all = Array.isArray(demoStore.reservations)? demoStore.reservations : [];
    const reservations = all.filter(r => String(r.client_batch_no||'')===bno);
    const items = [];
    let total_planned_quantity = 0;
    for (const r of reservations){
      total_planned_quantity += Number(r.total_planned_quantity||0);
      const lines = Array.isArray(r.detail_lines)? r.detail_lines : [];
      for (const d of lines){ items.push({ client_batch_no:bno, reservation_number: r.reservation_number, status: r.status, ...d }); }
    }
    return res.json({ code:0, data:{ client_batch_no:bno, reservations: reservations.map(r=>({ reservation_number:r.reservation_number, status:r.status, created_at:r.created_at })), items, total_items: items.length, total_planned_quantity } });
  }catch(e){ return res.status(500).json({ code:500, message:String(e?.message||e) }); }
});

app.get('/v1/inbound/reservations/:id', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const row = demoStore.reservations.find(r => String(r.id)===String(req.params.id) || r.reservation_number===req.params.id);
  if (!row) return res.json({ code:404, message:'not found' });
  return res.json({ code:0, data: row });
});

// fetch reservation detail_lines by reservation_number or id
app.get('/v1/inbound/reservations/:id/detail', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const row = demoStore.reservations.find(r => String(r.id)===String(req.params.id) || r.reservation_number===req.params.id);
  if (!row) return res.json({ code:404, message:'not found' });
  const list = Array.isArray(row.detail_lines)? row.detail_lines : [];
  return res.json({ code:0, data:{ reservation_number: row.reservation_number, client_batch_no: row.client_batch_no, list, total: list.length } });
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
  if (b.client_batch_no != null) row.client_batch_no = String(b.client_batch_no);
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

// cancel reservation (demo)
app.post('/v1/inbound/reservations/:id/cancel', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const r = demoStore.reservations.find(x => String(x.id)===String(req.params.id) || x.reservation_number===req.params.id);
  if (!r) return res.json({ code:404, message:'not found' });
  r.status = 'cancelled';
  return res.json({ code:0 });
});

// pending list for a warehouse (demo)
app.get('/v1/inbound/reservations/pending', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const wid = req.query.warehouse_id?
    String(req.query.warehouse_id) : undefined;
  const list = demoStore.reservations.filter(r => (r.status==='pending' || r.status==='submitted') && (!wid || String(r.target_warehouse_id)===wid));
  return res.json({ code:0, data:{ list, total:list.length } });
});

function ensureInventory(){ if(!demoStore.inventory) demoStore.inventory = new Map(); }
function invKey(wh, pid, unit, lot){ return [String(wh||''), String(pid||''), String(unit||''), String(lot||'')].join('|'); }
function addInventoryDemo(warehouse_id, product_id, quantity, unit, lot_no=''){
  ensureInventory();
  const key = invKey(warehouse_id, product_id, unit, lot_no);
  const old = demoStore.inventory.get(key) || { warehouse_id, product_id, unit, lot_no, quantity: 0 };
  const now = { ...old, quantity: Number(old.quantity||0) + Number(quantity||0) };
  demoStore.inventory.set(key, now);
  return now;
}

// approve reservation (demo): 仅状态流转，不直接入库
app.post('/v1/inbound/reservations/:id/confirm', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const r = demoStore.reservations.find(x => String(x.id)===String(req.params.id) || x.reservation_number===req.params.id);
  if (!r) return res.json({ code:404, message:'not found' });
  r.status = 'approved';
  r.warehouse_handled_at = new Date().toISOString().slice(0,16).replace('T',' ');
  pushAudit({ scope:'inbound_reservation', ref_id:r.reservation_number, action:'warehouse_approve', actor:'warehouse_demo', ts:r.warehouse_handled_at });
  // 同步到“存货人入库申请单列表”所用数据源（此处直接返回最新全量，前端可轮询）
  const depositorList = (demoStore.reservations||[]).slice().sort((a,b)=> (b.id||0)-(a.id||0));
  return res.json({ code:0, data:{ reservation:r, depositor_list: depositorList } });
});

// reject reservation (demo)
app.post('/v1/inbound/reservations/:id/reject', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const r = demoStore.reservations.find(x => String(x.id)===String(req.params.id) || x.reservation_number===req.params.id);
  if (!r) return res.json({ code:404, message:'not found' });
  r.status = 'rejected';
  r.reject_reason = String((req.body&&req.body.reason) || '');
  pushAudit({ scope:'inbound_reservation', ref_id:r.reservation_number, action:'warehouse_reject', actor:'warehouse_demo', ts:new Date().toISOString().slice(0,16).replace('T',' '), detail:{ reason: r.reject_reason } });
  return res.json({ code:0, data:r });
});

// submit reservation (demo): 存货人端“申请入库”
app.post('/v1/inbound/reservations/:id/submit', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const r = demoStore.reservations.find(x => String(x.id)===String(req.params.id) || x.reservation_number===req.params.id);
  if (!r) return res.json({ code:404, message:'not found' });
  r.status = 'pending';
  pushAudit({ scope:'inbound_reservation', ref_id:r.reservation_number, action:'submit', actor:'depositor_demo', ts:new Date().toISOString().slice(0,16).replace('T',' ') });
  return res.json({ code:0, data:r });
});

// apply reservation (demo): 审核通过后由存货人发起“入库申请”完成闭环
app.post('/v1/inbound/reservations/:id/apply', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const r = demoStore.reservations.find(x => String(x.id)===String(req.params.id) || x.reservation_number===req.params.id);
  if (!r) return res.json({ code:404, message:'not found' });
  // 仅当已通过才允许“申请入库”完成闭环
  if (r.status !== 'approved') {
    return res.json({ code:400, message:'当前状态不可申请入库' });
  }
  r.status = 'completed';
  r.completed_at = new Date().toISOString().slice(0,16).replace('T',' ');
  pushAudit({ scope:'inbound_reservation', ref_id:r.reservation_number, action:'apply_to_inbound', actor:'depositor_demo', ts:r.completed_at });
  return res.json({ code:0, data:r });
});

// Warehouse receipts
app.get('/v1/warehouse-receipts', async (req, res) => {
  try {
    if (allowDemo) {
      const page = Number(req.query.page || 1);
      const pageSize = Number(req.query.pageSize || 10);
      // @ts-ignore
      const ctx = req.ctx || { role:'', userId:0 };
      // demo 仓单集合，如果未初始化则基于 inboundOrders 构造两条示例
      if (!demoStore.warehouseReceipts) demoStore.warehouseReceipts = [];
      if (!demoStore.warehouseReceipts.length && Array.isArray(demoStore.inboundOrders)){
        demoStore.warehouseReceipts = (demoStore.inboundOrders.slice(0,2) || []).map((o,idx)=>({
          id: Date.now()+idx,
          receipt_number: `WR-DEMO-${String(idx+1).padStart(3,'0')}`,
          quantity: Number(o.actual||o.planned_quantity||0),
          measurement_unit: o.measurement_unit||'吨',
          status: 'in_stock',
          created_by_user_id: Number(o.created_by_user_id||0)
        }));
      }
      let rows = demoStore.warehouseReceipts.slice();
      if (ctx.role==='inventory' && ctx.userId){ rows = rows.filter(r => Number(r.created_by_user_id||0)===Number(ctx.userId)); }
      const total = rows.length;
      const list = rows.slice((page-1)*pageSize, page*pageSize);
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
      // @ts-ignore
      const ctx = req.ctx || { userId:0, role:'' };
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
              : null,
        created_by_user_id: Number(ctx.userId||0),
        created_by_role: String(ctx.role||'') || 'inventory'
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
      // @ts-ignore
      const ctx = req.ctx || { role:'', userId:0, warehouseId:0 };
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
      // role-based filtering (demo): inventory by ownerId, warehouse by warehouseId
      const { role='inventory', ownerId='', warehouseId='', carrierId='' } = req.query || {};
      let rows = demoStore.inboundOrders.slice();
      if (ctx.role==='inventory' && ctx.userId){ rows = rows.filter(r => Number(r.created_by_user_id||0)===Number(ctx.userId)); }
      if (ctx.role==='warehouse' && req.query.warehouseId){ rows = rows.filter(r => String(r.warehouse_id||r.target_warehouse_id||'')===String(req.query.warehouseId)); }
      if(String(role)==='warehouse' && warehouseId){ rows = rows.filter(r => String(r.warehouse_id||r.target_warehouse_id||'')===String(warehouseId)); }
      if(String(role)==='inventory' && ownerId){ rows = rows.filter(r => String(r.owner_id||'')===String(ownerId)); }
      if(String(role)==='logistics' && carrierId){ rows = rows.filter(r => String(r.logistics_carrier_id||'')===String(carrierId)); }
      const total = rows.length;
      const list = rows.slice((page-1)*pageSize, page*pageSize);
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

// Import reservations from CSV-like rows (demo)
// Import reservations from CSV-like rows (demo) - FIXED VERSION
app.post('/v1/inbound/reservations/import', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code: 501, message: 'not implemented' });

  const items = Array.isArray(req.body) ? req.body : [];
  const created = [];
  const errors = [];
  const debug = [];

  // 分组：一批一聚合（按货物批次号/客户预约号）
  /** @type {Map<string, any[]>} */
  const batchMap = new Map();
  for (let i = 0; i < items.length; i++) {
    const it = items[i] || {};
    // 放宽校验：warehouse_id/commodity_id 缺失时默认 1（demo），仅数量<=0 时判错
    const wh = Number(it.warehouse_id || it.target_warehouse_id || 1);
    const cid = Number(it.commodity_id || 1);
    const qty = Number(it.quantity || it.planned_quantity || 0);
    if (!qty || !Number.isFinite(qty) || qty<=0) { errors.push(`Row ${i}: 数量必须为正数`); continue; }
    const batch = String(it.client_batch_no || it.client_reservation_no || it.batch_no || it.reservation_number || '').trim() || `ROW_${i+1}`;
    const rec = {
      warehouse_id: wh,
      commodity_id: cid,
      quantity: qty,
      unit: String(it.unit || it.measurement_unit || '吨'),
      vehicle_plate: String(it.vehicle_plate || ''),
      driver_phone: String(it.driver_phone || ''),
      driver_id_no: String(it.driver_id_no || it.driver_id_card || ''),
      spec: String(it.spec || it.commodity || it.commodity_spec || ''),
      owner_name: String(it.owner_name || '导入货主'),
      eta: String(it.eta || it.expected_arrival_time || ''),
      source_row_index: i
    };
    if (!batchMap.has(batch)) batchMap.set(batch, []);
    batchMap.get(batch).push(rec);
    debug.push({ i, batch, rec });
  }

  // 为每个批次生成一条预约记录，并挂接 detail_lines
  const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ') + ':00';
  for (const [batch, lines] of batchMap.entries()) {
    try {
      const id = Date.now() * 1000 + Math.floor(Math.random() * 1000) + created.length;
      const reservation_number = 'RSV' + id;
      const code6 = generateSixDigitCode();
      const sumQty = lines.reduce((s, r) => s + Number(r.quantity || 0), 0);
      const first = lines[0] || {};
      const row = {
        id,
        reservation_number,
        unique_reservation_code: code6,
        status: 'pending',
        created_at: nowStr,
        created_by: 'depositor_demo',
        source_type: 'excel',
        target_warehouse_id: Number(first.warehouse_id || 1),
        commodity_id: Number(first.commodity_id || 1),
        total_planned_quantity: sumQty,
        measurement_unit: String(first.unit || '吨'),
        owner_name: String(first.owner_name || '导入货主'),
        client_batch_no: batch,
        // 明细：用于“点击批次号查看一行一单”
        detail_lines: lines.map((r, idx) => ({
          reservation_number,
          transport_no: '-',
          order_no: '-',
          status: '待审核',
          inbound_proof: '-',
          owner_name: String(r.owner_name || row.owner_name || '-'),
          commodity_text: r.spec ? `#${r.commodity_id} / ${r.spec}` : `#${r.commodity_id}`,
          vehicle_plate: String(r.vehicle_plate || '-'),
          planned_quantity: Number(r.quantity || 0),
          actual_in_weight: '-',
          weigh_mode_text: '-',
          gross: '-',
          tare: '-',
          net: '-',
          deductions: '-',
          entry_time: '-',
          exit_time: '-',
          driver_name: '-',
          driver_phone: String(r.driver_phone || '-'),
          driver_id_card: String(r.driver_id_no || '-'),
          _seq: idx + 1
        }))
      };

      if (!demoStore.reservations) demoStore.reservations = [];
      demoStore.reservations.unshift(row);

      pushAudit({ scope: 'inbound_reservation', ref_id: reservation_number, action: 'import_create', actor: 'depositor_demo', ts: nowStr, detail: { client_batch_no: batch, count: lines.length } });

      created.push({ id, reservation_number, status: 'pending', client_reservation_no: batch });
    } catch (e) {
      errors.push(`Batch ${batch}: 处理失败 - ${String(e?.message || e)}`);
    }
  }

  return res.json({ code: 0, data: { created, errors: errors.length ? errors : undefined, summary: { total: items.length, batches: batchMap.size, success: created.length, failed: errors.length }, debug } });
});

// Excel import → create reservations (file upload)
app.post('/v1/inbound/reservations/import-xlsx', upload.single('file'), (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  try{
    if(!req.file) return res.status(400).json({ code:400, message:'file is required' });
    const wb = xlsx.read(req.file.buffer, { type:'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = xlsx.utils.sheet_to_json(ws, { defval:'' });
    const rows = json.map((r, idx) => ({
      warehouse_id: Number(r.warehouse_id||1),
      commodity_id: Number(r.commodity_id||1),
      quantity: Number(r.quantity||0),
      unit: String(r.unit||'件'),
      vehicle_plate: String(r.vehicle_plate||''),
      driver_phone: String(r.driver_phone||''),
      lot_no: String(r.lot_no||''),
      _row_no: idx+2
    })).filter(r=> Number(r.quantity)>0);
    // 复用 JSON 导入逻辑
    req.body = rows;
    return app._router.handle(req, res, () => {});
  }catch(e){
    return res.status(500).json({ code:500, message:String(e?.message||e) });
  }
});

// ---- OnlyOffice minimal config & file serving ----
app.get('/oo/config', (req, res) => {
  try{
    const OO_BASE = process.env.OO_BASE || '';
    const file = String(req.query.file||'inbound-reservations-template.csv');
    const fileType = file.toLowerCase().endsWith('.xlsx')? 'xlsx':'csv';
    const selfPort = Number(process.env.PORT || 8080);
    const hostForDS = process.env.OO_PUBLIC_BASE || `http://host.docker.internal:${selfPort}`;
    const url = `${hostForDS}/oo/file/${encodeURIComponent(file)}`;
    const callbackUrl = `${hostForDS}/oo/callback?file=${encodeURIComponent(file)}`;
    const config = {
      type: 'desktop',
      documentType: 'spreadsheet',
      document: { fileType, key: String(Date.now()), title: file, url },
      editorConfig: { callbackUrl, lang:'zh-CN' }
    };
    res.json({ code:0, data:{ oo_base: OO_BASE, config } });
  }catch(e){ res.status(500).json({ code:500, message:String(e?.message||e) }); }
});

app.get('/oo/file/:name', (req, res) => {
  try{
    const name = String(req.params.name||'');
    const allow = new Set(['inbound-reservations-template.csv','products-template.csv','blank.csv','blank.xlsx']);
    if(!allow.has(name)) return res.status(404).end();
    // 提供一个即取即用的空白CSV（用于“打开即是表格”体验）
    if(name === 'blank.csv'){
      res.setHeader('Content-Type','text/csv; charset=utf-8');
      res.end('');
      return;
    }
    if(name === 'blank.xlsx'){
      try{
        // 动态生成一个空白的 XLSX（比 CSV 功能更完整，工具栏可用）
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.aoa_to_sheet([['']]);
        xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
        const buf = xlsx.write(wb, { type:'buffer', bookType:'xlsx' });
        res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition','inline; filename="blank.xlsx"');
        return res.end(buf);
      }catch(e){ return res.status(500).send(String(e?.message||e)); }
    }
    const filePath = path.resolve(process.cwd(), 'my_clean','my','public','templates', name);
    if(!fs.existsSync(filePath)) return res.status(404).end();
    res.setHeader('Content-Type', name.endsWith('.csv')? 'text/csv; charset=utf-8' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    fs.createReadStream(filePath).pipe(res);
  }catch{ res.status(500).end(); }
});

app.post('/oo/callback', async (req, res) => {
  try{
    // 打印完整回调体，便于排障
    console.log('OnlyOffice callback:', JSON.stringify(req.body || {}));

    const status = Number(req.body?.status || 0);
    // OnlyOffice 在 status=2（MustSave）或 6（MustForceSave）时提供下载 url
    const downloadUrl = req.body?.url || (req.body?.data && req.body.data.url) || '';
    const fileParam = String(req.query.file || 'document.xlsx');

    // 放宽条件：只要回调里带有 url 即保存（避免前端未触发 MustSave 的情况）
    if (downloadUrl) {
      try{
        if (!fs.existsSync(OO_SAVE_DIR)) fs.mkdirSync(OO_SAVE_DIR, { recursive: true });
        const safeBase = path.basename(fileParam).replace(/[^a-zA-Z0-9._-]/g, '_');
        const saveName = `${Date.now()}-${safeBase}`;
        const savePath = path.join(OO_SAVE_DIR, saveName);
        const r = await fetch(downloadUrl);
        if (!r.ok) throw new Error(`download failed: ${r.status}`);
        const buf = Buffer.from(await r.arrayBuffer());
        fs.writeFileSync(savePath, buf);
        console.log('OnlyOffice saved file:', savePath, 'size=', buf.length);
        pushAudit({ scope:'onlyoffice', ref_id: safeBase, action:'saved', actor:'documentserver', ts:new Date().toISOString(), detail:{ savePath, size: buf.length, status } });
      }catch(e){
        console.error('OnlyOffice save error:', e);
      }
    }
    // 按 OnlyOffice 规范：必须返回 { error: 0 } 表示已处理
    return res.json({ error:0 });
  }catch(e){
    console.error('OnlyOffice callback handler error:', e);
    return res.json({ error:0 });
  }
});

// 列出已保存的 OnlyOffice 文件
app.get('/oo/saved', (_req, res) => {
  try{
    if (!fs.existsSync(OO_SAVE_DIR)) return res.json({ code:0, data:{ list:[] } });
    const list = fs.readdirSync(OO_SAVE_DIR).sort().reverse();
    return res.json({ code:0, data:{ list, dir: OO_SAVE_DIR } });
  }catch(e){ return res.status(500).json({ code:500, message:String(e?.message||e) }); }
});

// 下载指定保存文件
app.get('/oo/saved/:name', (req, res) => {
  try{
    const name = path.basename(String(req.params.name||''));
    const p = path.join(OO_SAVE_DIR, name);
    if (!fs.existsSync(p)) return res.status(404).end();
    return res.sendFile(p);
  }catch(e){ return res.status(500).end(); }
});

// 内嵌页：直接在后端生成一个可编辑、全工具栏的 OnlyOffice 页面，避免前端 CSP/代理问题
app.get('/oo/embed', (req, res) => {
  try{
    const OO_BASE = (process.env.OO_BASE && String(process.env.OO_BASE)) || 'http://127.0.0.1:8082';
    const file = String(req.query.file||'blank.csv');
    const title = String(req.query.title||file);
    const selfPort = Number(process.env.PORT || 8080);
    const hostForDS = process.env.OO_PUBLIC_BASE || `http://host.docker.internal:${selfPort}`;
    const fileType = file.toLowerCase().endsWith('.xlsx')? 'xlsx':'csv';
    const url = `${hostForDS}/oo/file/${encodeURIComponent(file)}`;
    const callbackUrl = `${hostForDS}/oo/callback?file=${encodeURIComponent(file)}`;
    const config = {
      type: 'desktop',
      documentType: 'spreadsheet',
      document: { fileType, key: String(Date.now()), title, url,
        permissions: { edit:true, download:true, print:true, review:true, comment:true }
      },
      editorConfig: {
        callbackUrl,
        lang:'zh-CN',
        mode:'edit',
        customization: {
          autosave: true,
          toolbar: true,
          toolbarNoTabs: false,
          compactToolbar: false,
          leftMenu: true,
          rightMenu: true,
          header: true,
          statusBar: true,
          comments: true,
          help: true,
          feedback: { visible: false }
        }
      },
      width: '100%',
      height: '98%'
    };

    const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>OnlyOffice Embed - ${title.replace(/</g,'&lt;')}</title>
  <style>html,body{margin:0;padding:0;height:100%;}#onlyoffice-container{width:100%;height:98vh;} .oo-ctrl{position:fixed;top:8px;right:12px;z-index:9999;}</style>
  <script src="${OO_BASE.replace(/\/+$/,'')}/web-apps/apps/api/documents/api.js"></script>
</head>
<body>
  <div class="oo-ctrl"><button id="btn-force" style="padding:6px 10px;">强制保存</button></div>
  <div id="onlyoffice-container"></div>
  <script>
    (function(){
      const cfg = ${JSON.stringify(config)};
      // 再次确保编辑与工具栏开启（防止服务端/环境差异覆盖）
      cfg.type = 'desktop';
      cfg.width = '100%';
      cfg.height = '98%';
      if(!cfg.document) cfg.document = {};
      cfg.document.permissions = { edit:true, download:true, print:true, review:true, comment:true };
      cfg.editorConfig = Object.assign({}, cfg.editorConfig||{}, {
        mode: 'edit',
        customization: Object.assign({},{
          autosave:true, toolbar:true, toolbarNoTabs:false, compactToolbar:false,
          leftMenu:true, rightMenu:true, header:true, statusBar:true, comments:true,
          help:true, feedback:{ visible:false }
        }, (cfg.editorConfig||{}).customization||{})
      });
      const editor = new DocsAPI.DocEditor('onlyoffice-container', cfg);
      const key = cfg.document.key;
      // 定时强制保存，避免“未触发 MustSave”导致无法落盘
      setInterval(function(){ fetch('/oo/force-save?key='+encodeURIComponent(key), { method:'POST' }); }, 30000);
      document.getElementById('btn-force').onclick = function(){ fetch('/oo/force-save?key='+encodeURIComponent(key), { method:'POST' }); };
    })();
  </script>
</body>
</html>`;
    res.setHeader('Content-Type','text/html; charset=utf-8');
    return res.end(html);
  }catch(e){
    return res.status(500).send(String(e?.message||e));
  }
});

// 调用 DocumentServer CommandService 执行强制保存（forcesave）
app.post('/oo/force-save', async (req, res) => {
  try{
    const OO_BASE = (process.env.OO_BASE && String(process.env.OO_BASE)) || 'http://127.0.0.1:8082';
    const key = String((req.body && req.body.key) || (req.query && req.query.key) || '');
    if (!key) return res.status(400).json({ code:400, message:'key required' });
    const endpoint = OO_BASE.replace(/\/+$/,'') + '/coauthoring/CommandService.ashx';
    const r = await fetch(endpoint, {
      method:'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ c: 'forcesave', key })
    });
    const data = await r.json().catch(() => ({}));
    return res.json({ code:0, data });
  }catch(e){
    return res.status(500).json({ code:500, message:String(e?.message||e) });
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

// Review inbound order → create a warehouse receipt (demo)
app.post('/v1/inbound/orders/:id/approve', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const row = findDemoOrder(req.params.id); if (!row) return res.json({ code:404, message:'not found' });
  row.status = 'platform_approved';
  // create a demo warehouse receipt
  const receipt = { id: Date.now(), receipt_number: 'WR-'+Date.now(), reservation_number: row.reservation_number, quantity: Number(row.actual||row.planned_quantity||0), measurement_unit: row.measurement_unit||'吨', status: 'in_stock', created_at: new Date().toISOString().slice(0,16).replace('T',' ') };
  if (!demoStore.warehouseReceipts) demoStore.warehouseReceipts = [];
  demoStore.warehouseReceipts.unshift(receipt);
  return res.json({ code:0, data:{ receipt_number: receipt.receipt_number } });
});

app.post('/v1/inbound/orders/:id/reject', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const row = findDemoOrder(req.params.id); if (!row) return res.json({ code:404, message:'not found' });
  row.status = 'platform_rejected';
  return res.json({ code:0 });
});

// --- Audit logs (demo) ---
app.get('/v1/audit/logs', (req, res) => {
  try{
    if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
    const { scope='', ref_id='', action='', client_batch_no='', limit='200' } = req.query || {};
    let list = Array.isArray(demoStore.auditLogs)? demoStore.auditLogs.slice() : [];
    if (scope) list = list.filter(x => String(x.scope)===String(scope));
    if (ref_id) list = list.filter(x => String(x.ref_id)===String(ref_id));
    if (action) list = list.filter(x => String(x.action)===String(action));
    if (client_batch_no) list = list.filter(x => String(x?.detail?.client_batch_no||'')===String(client_batch_no));
    const lim = Math.max(1, Math.min(1000, Number(limit||200)));
    list = list.slice(0, lim);
    return res.json({ code:0, data:{ list, total:list.length } });
  }catch(e){ return res.status(500).json({ code:500, message:String(e?.message||e) }); }
});

app.post('/v1/audit/clear', (_req, res) => {
  try{
    if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
    demoStore.auditLogs = [];
    if (demoLogToFile) {
      try { fs.writeFileSync(demoLogFile, ''); } catch {}
    }
    return res.json({ code:0 });
  }catch(e){ return res.status(500).json({ code:500, message:String(e?.message||e) }); }
});

// Batch stats by client_batch_no (demo)
app.get('/v1/inbound/reservations/batch-stats', (req, res) => {
  try{
    if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
    const bno = String(req.query.client_batch_no||'');
    const all = Array.isArray(demoStore.reservations)? demoStore.reservations : [];
    if (bno) {
      const list = all.filter(r => String(r.client_batch_no||'')===bno).map(r => ({
        reservation_number: r.reservation_number,
        items: Array.isArray(r.detail_lines)? r.detail_lines.length : 0,
        total_planned_quantity: Number(r.total_planned_quantity||0),
        status: r.status,
        created_at: r.created_at
      }));
      const total_items = list.reduce((s,x)=>s+Number(x.items||0),0);
      const reservations_count = list.length;
      const lastImport = (Array.isArray(demoStore.auditLogs)? demoStore.auditLogs : []).find(x => x.action==='import_create' && String(x?.detail?.client_batch_no||'')===bno) || null;
      return res.json({ code:0, data:{ client_batch_no: bno, reservations:list, reservations_count, total_items, last_import: lastImport } });
    }
    // grouped overview
    const map = new Map();
    for (const r of all){
      const k = String(r.client_batch_no||'');
      if (!k) continue;
      const entry = map.get(k) || { client_batch_no:k, reservations_count:0, total_items:0, total_planned_quantity:0, latest_reservation_number:'', latest_created_at:'' };
      entry.reservations_count += 1;
      entry.total_items += Array.isArray(r.detail_lines)? r.detail_lines.length : 0;
      entry.total_planned_quantity += Number(r.total_planned_quantity||0);
      if (!entry.latest_created_at || String(r.created_at||'')>entry.latest_created_at){ entry.latest_created_at = String(r.created_at||''); entry.latest_reservation_number = r.reservation_number; }
      map.set(k, entry);
    }
    return res.json({ code:0, data:{ list: Array.from(map.values()), total: map.size } });
  }catch(e){ return res.status(500).json({ code:500, message:String(e?.message||e) }); }
});

// Batch detail: merge all detail_lines under the same client_batch_no (demo)
app.get('/v1/inbound/reservations/batch/:batch/detail', (req, res) => {
  try{
    if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
    const bno = String(req.params.batch||'');
    if (!bno) return res.json({ code:0, data:{ client_batch_no:'', reservations:[], items:[], total_items:0, total_planned_quantity:0 } });
    const all = Array.isArray(demoStore.reservations)? demoStore.reservations : [];
    const reservations = all.filter(r => String(r.client_batch_no||'')===bno);
    const items = [];
    let total_planned_quantity = 0;
    for (const r of reservations){
      total_planned_quantity += Number(r.total_planned_quantity||0);
      const lines = Array.isArray(r.detail_lines)? r.detail_lines : [];
      for (const d of lines){ items.push({ client_batch_no:bno, reservation_number: r.reservation_number, status: r.status, ...d }); }
    }
    return res.json({ code:0, data:{ client_batch_no:bno, reservations: reservations.map(r=>({ reservation_number:r.reservation_number, status:r.status, created_at:r.created_at })), items, total_items: items.length, total_planned_quantity } });
  }catch(e){ return res.status(500).json({ code:500, message:String(e?.message||e) }); }
});

// --- Redflush (demo) ---
// Full redflush: create negative record mirroring the original; mark original as redflushed
app.post('/v1/inbound/orders/:id/redflush/full', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const row = findDemoOrder(req.params.id); if (!row) return res.json({ code:404, message:'not found' });
  const old = { ...row, redflushed: true };
  // create adjusted negative record
  const neg = { ...row };
  const numeric = ['planned_quantity','calc_weight','actual','gross','tare','net','deductions','pack_count','pieces'];
  for(const k of numeric){ if(neg[k]!=null) neg[k] = -Number(neg[k]); }
  neg.order_no = `${row.order_no}-RED-${Date.now()}`;
  neg.status = 'redflushed_adjusted';
  // insert adjusted next to original
  const i = demoStore.inboundOrders.findIndex(o => o===row);
  if(i>=0){ demoStore.inboundOrders.splice(i+1,0,neg); Object.assign(row, { redflushed:true }); }
  return res.json({ code:0, data:{ old: { ...old }, adjusted: { ...neg } } });
});

// Partial redflush: subtract specified pieces/actual, keep others
app.post('/v1/inbound/orders/:id/redflush/partial', (req, res) => {
  if (!allowDemo) return res.status(501).json({ code:501, message:'not implemented' });
  const row = findDemoOrder(req.params.id); if (!row) return res.json({ code:404, message:'not found' });
  const { pieces=null, actual=null } = req.body || {};
  const old = { ...row, redflushed: true };
  const adj = { ...row };
  if(pieces!=null) adj.pieces = Number(row.pieces||0) - Number(pieces||0);
  if(actual!=null) adj.actual = Number(row.actual||0) - Number(actual||0);
  adj.order_no = `${row.order_no}-ADJ-${Date.now()}`;
  adj.status = 'adjusted';
  const i = demoStore.inboundOrders.findIndex(o => o===row);
  if(i>=0){ demoStore.inboundOrders.splice(i+1,0,adj); Object.assign(row, { redflushed:true }); }
  return res.json({ code:0, data:{ old, adjusted: adj } });
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => console.log(`Backend listening on http://127.0.0.1:${port}`));

