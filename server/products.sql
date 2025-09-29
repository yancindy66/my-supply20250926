DROP TABLE IF EXISTS products;
CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(64) NULL,
  product_name VARCHAR(255) NOT NULL,
  commodity_type VARCHAR(64) NULL,
  platform_standard_grade_name VARCHAR(128) NULL,
  platform_base_premium DECIMAL(10,2) NOT NULL DEFAULT 0,
  custom_premium DECIMAL(10,2) NOT NULL DEFAULT 0,
  packaging_image TEXT NULL,
  production_year INT NULL,
  package_spec VARCHAR(255) NULL,
  current_price DECIMAL(12,2) NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'enabled',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX ix_products_order (created_at, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
