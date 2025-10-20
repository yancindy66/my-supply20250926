import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

async function runSqlFile(conn, filePath){
  const sql = fs.readFileSync(filePath, 'utf8');
  // 简单分隔；确保文件里不要包含需要保留的分号内联语句
  const statements = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
  for(const stmt of statements){
    try {
      await conn.query(stmt);
    } catch (e) {
      const errno = e && (e.errno || e.code);
      // 容忍可重复场景：字段已存在/索引已存在/表已存在/重复键等
      const ignorable = new Set([1060 /*ER_DUP_FIELDNAME*/, 1061 /*ER_DUP_KEYNAME*/, 1050 /*ER_TABLE_EXISTS_ERROR*/, 1062 /*ER_DUP_ENTRY*/, 1091 /*ER_CANT_DROP_FIELD_OR_KEY*/]);
      if (ignorable.has(Number(errno))) {
        console.warn('[migrate-schema] skip (ignorable)', errno, e.sqlMessage || e.message);
        continue;
      }
      throw e;
    }
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
  // 兼容 Windows：使用 fileURLToPath 获取正确的文件系统路径，避免出现 "D:\\D:" 双盘符
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const root = __dirname;
  const f1 = path.resolve(root, 'migrations', '20251018_01_core_tables.sql');
  const f2 = path.resolve(root, 'migrations', '20251018_02_separation_columns.sql');
  const f3 = path.resolve(root, 'migrations', '20251019_01_org_columns.sql');
  const f4 = path.resolve(root, 'migrations', '20251019_02_users.sql');
  const f5 = path.resolve(root, 'migrations', '20251019_03_usercode_and_regprofiles.sql');
  console.log('[migrate-schema] applying', f1);
  await runSqlFile(conn, f1);
  console.log('[migrate-schema] applying', f2);
  await runSqlFile(conn, f2);
  console.log('[migrate-schema] applying', f3);
  await runSqlFile(conn, f3);
  console.log('[migrate-schema] applying', f4);
  await runSqlFile(conn, f4);
  console.log('[migrate-schema] applying', f5);
  await runSqlFile(conn, f5);
  await conn.end();
  console.log('[migrate-schema] done');
}

main().catch(e=>{ console.error(e); process.exit(1); });


