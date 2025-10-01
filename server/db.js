import dotenv from 'dotenv';
dotenv.config();

const useMemory = String(process.env.ALLOW_DEMO || '').toLowerCase() === '1' || String(process.env.ALLOW_DEMO || '').toLowerCase() === 'true';

let mysqlPool = null;
let sqlite = null;
let memoryStore = null; // 纯内存降级
if (!useMemory) {
  const mysql = (await import('mysql2/promise')).default;
  mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || process.env.MYSQL_PORT || 3306),
    user: process.env.DB_USER || process.env.MYSQL_USER || 'root',
    password: process.env.DB_PASS || process.env.MYSQL_PASSWORD || '',
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'my_supply',
    connectionLimit: 10,
    charset: 'utf8mb4_general_ci'
  });
} else {
  try {
    const Database = (await import('better-sqlite3')).default;
    sqlite = new Database(':memory:');
    // 最小表（仅入库预约）
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS inbound_reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reservation_number TEXT,
        reservation_type TEXT,
        reservist_id INTEGER,
        applicant_id INTEGER,
        target_warehouse_id INTEGER,
        commodity_id INTEGER,
        total_planned_quantity REAL,
        measurement_unit TEXT,
        status TEXT
      );
    `);
  } catch (_) {
    // 无 better-sqlite3，降级为纯内存
    memoryStore = {
      inboundReservations: []
    };
  }
}

export async function query(sql, params){
  if (!useMemory) {
    const [rows] = await mysqlPool.query(sql, params);
    return rows;
  }
  // 极简SQL映射，仅满足本次最小CRUD
  const text = String(sql).trim().toUpperCase();
  if (text.startsWith('INSERT INTO INBOUND_RESERVATIONS')) {
    if (sqlite) {
      const stmt = sqlite.prepare('INSERT INTO inbound_reservations (reservation_number,reservation_type,reservist_id,applicant_id,target_warehouse_id,commodity_id,total_planned_quantity,measurement_unit,status) VALUES (?,?,?,?,?,?,?,?,?)');
      const info = stmt.run(
        `RSV-${Date.now()}`,
        'by_depositor',
        params?.[0] ?? 1,
        params?.[1] ?? 1,
        params?.[2] ?? 1,
        params?.[3] ?? 1,
        params?.[4] ?? 0,
        params?.[5] ?? '吨',
        'submitted'
      );
      return { insertId: info.lastInsertRowid };
    }
    // 纯内存
    const rec = {
      id: (memoryStore.inboundReservations.at(-1)?.id || 0) + 1,
      reservation_number: `RSV-${Date.now()}`,
      reservation_type: 'by_depositor',
      reservist_id: params?.[0] ?? 1,
      applicant_id: params?.[1] ?? 1,
      target_warehouse_id: params?.[2] ?? 1,
      commodity_id: params?.[3] ?? 1,
      total_planned_quantity: params?.[4] ?? 0,
      measurement_unit: params?.[5] ?? '吨',
      status: 'submitted'
    };
    memoryStore.inboundReservations.push(rec);
    return { insertId: rec.id };
  }
  if (text.startsWith('SELECT RESERVATION_NUMBER')) {
    if (sqlite) {
      const pageSize = params?.[0] ?? 10;
      const offset = params?.[1] ?? 0;
      const rows = sqlite.prepare('SELECT reservation_number,status,target_warehouse_id,commodity_id,total_planned_quantity,measurement_unit FROM inbound_reservations ORDER BY id DESC LIMIT ? OFFSET ?').all(pageSize, offset);
      return rows;
    }
    // 纯内存
    const pageSize = params?.[0] ?? 10;
    const offset = params?.[1] ?? 0;
    return memoryStore.inboundReservations
      .slice()
      .sort((a,b)=>b.id-a.id)
      .slice(offset, offset + pageSize)
      .map(x => ({
        reservation_number: x.reservation_number,
        status: x.status,
        target_warehouse_id: x.target_warehouse_id,
        commodity_id: x.commodity_id,
        total_planned_quantity: x.total_planned_quantity,
        measurement_unit: x.measurement_unit
      }));
  }
  if (text.startsWith('SELECT COUNT(1) AS C FROM INBOUND_RESERVATIONS')) {
    if (sqlite) {
      const row = sqlite.prepare('SELECT COUNT(1) as c FROM inbound_reservations').get();
      return [row];
    }
    return [{ c: memoryStore.inboundReservations.length }];
  }
  // 其它SQL在演示模式不支持
  return [];
}

export async function getConnection(){
  if (!useMemory) return await mysqlPool.getConnection();
  throw new Error('In-memory mode does not support raw connections');
}


