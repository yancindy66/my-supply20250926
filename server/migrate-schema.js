import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

async function runSqlFile(conn, filePath){
  const sql = fs.readFileSync(filePath, 'utf8');
  // 简单分隔；确保文件里不要包含需要保留的分号内联语句
  const statements = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
  for(const stmt of statements){
    await conn.query(stmt);
  }
}

async function main(){
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || process.env.MYSQL_PORT || 3306),
    user: process.env.DB_USER || process.env.MYSQL_USER || 'root',
    password: process.env.DB_PASS || process.env.MYSQL_PASSWORD || '',
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'my_supply',
    multipleStatements: true
  });
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '.');
  const f1 = path.resolve(root, 'migrations', '20251018_01_core_tables.sql');
  const f2 = path.resolve(root, 'migrations', '20251018_02_separation_columns.sql');
  console.log('[migrate-schema] applying', f1);
  await runSqlFile(conn, f1);
  console.log('[migrate-schema] applying', f2);
  await runSqlFile(conn, f2);
  await conn.end();
  console.log('[migrate-schema] done');
}

main().catch(e=>{ console.error(e); process.exit(1); });


