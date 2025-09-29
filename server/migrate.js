import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import knexInit from 'knex';

dotenv.config();

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

function readJson(file) {
  try {
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, 'utf8');
      const json = JSON.parse(raw);
      if (Array.isArray(json)) return json;
    }
  } catch (e) {
    console.warn('[migrate] read error:', file, e.message);
  }
  return [];
}

async function migrateProducts(rootDir) {
  const file = path.resolve(rootDir, 'my', 'mock', 'data', 'products.json');
  const list = readJson(file);
  if (!list.length) { console.log('[migrate] products: no data'); return; }
  console.log(`[migrate] products: ${list.length} rows`);
  const SKIP_IMAGES = String(process.env.SKIP_IMAGES || '').toLowerCase() === '1' || String(process.env.SKIP_IMAGES || '').toLowerCase() === 'true';
  const TRUNCATE_IMAGE = String(process.env.TRUNCATE_IMAGE || '').toLowerCase() === '1' || String(process.env.TRUNCATE_IMAGE || '').toLowerCase() === 'true';
  const MAX_IMAGE_LEN = Number(process.env.MAX_IMAGE_LEN || 5000000); // 5MB chars safeguard
  const now = Date.now();
  let i = 0;
  for (const p of list) {
    let packagingImage = p.packaging_image || null;
    if (SKIP_IMAGES) {
      packagingImage = null;
    } else if (TRUNCATE_IMAGE && typeof packagingImage === 'string' && packagingImage.length > MAX_IMAGE_LEN) {
      packagingImage = packagingImage.slice(0, MAX_IMAGE_LEN);
    }

    const row = {
      product_id: p.product_id || null,
      product_name: p.product_name || p.brand_name || '新商品',
      commodity_type: p.commodity_type || p.species || null,
      platform_standard_grade_name: p.platform_standard_grade_name || null,
      platform_base_premium: Number(p.platform_base_premium ?? 0),
      custom_premium: Number(p.custom_premium ?? 0),
      packaging_image: packagingImage,
      production_year: p.production_year || null,
      package_spec: p.package_spec || null,
      current_price: p.current_price != null ? Number(p.current_price) : null,
      status: p.status || '上架',
      created_at: new Date(now - (list.length - i) * 1000)
    };
    i++;
    try {
      await knex('products').insert(row);
    } catch (e) {
      console.warn('[migrate] insert product failed, skip row', { index: i, id: p.id, name: p.product_name || p.brand_name }, e.message);
    }
  }
}

async function migrateInventoryOwners(rootDir) {
  const file = path.resolve(rootDir, 'my', 'mock', 'data', 'inventory-owners.json');
  const list = readJson(file);
  if (!list.length) { console.log('[migrate] inventory_owners: no data'); return; }
  console.log(`[migrate] inventory_owners: ${list.length} rows`);
  const now = Date.now();
  let i = 0;
  for (const o of list) {
    const row = {
      company: o.company || '',
      code: o.code || '',
      creditCode: o.creditCode || null,
      regAddress: o.regAddress || null,
      legalRepName: o.legalRepName || null,
      legalRepId: o.legalRepId || null,
      establishDate: o.establishDate || null,
      registeredCapital: o.registeredCapital || null,
      businessScope: o.businessScope || null,
      bankName: o.bankName || null,
      bankAccount: o.bankAccount || null,
      companyEmail: o.companyEmail || null,
      companyPhone: o.companyPhone || null,
      annualRevenueRange: o.annualRevenueRange || null,
      mainBusiness: o.mainBusiness || null,
      partners: o.partners || null,
      adminName: o.adminName || null,
      adminDept: o.adminDept || null,
      adminTitle: o.adminTitle || null,
      adminPhone: o.adminPhone || null,
      contact: o.contact || null,
      phone: o.phone || null,
      address: o.address || null,
      license: o.license || null,
      legalIdFront: o.legalIdFront || null,
      legalIdBack: o.legalIdBack || null,
      bankPermit: o.bankPermit || null,
      authLetter: o.authLetter || null,
      seal: o.seal || null,
      created_at: new Date(now - (list.length - i) * 1000)
    };
    i++;
    // upsert by (company, code)
    const sql = knex('inventory_owners').insert(row).toString() +
      ' ON DUPLICATE KEY UPDATE ' +
      Object.keys(row).filter(k => k !== 'created_at').map(k => `${k}=VALUES(${k})`).join(', ');
    await knex.raw(sql);
  }
}

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const root = path.resolve(__dirname, '..');
  const args = new Set(process.argv.slice(2));
  try {
    if (args.size === 0 || args.has('--products')) {
      await migrateProducts(root);
    }
    if (args.size === 0 || args.has('--owners')) {
      await migrateInventoryOwners(root);
    }
    console.log('[migrate] done');
  } finally {
    await knex.destroy();
  }
}

main().catch(e => { console.error(e); process.exit(1); });


