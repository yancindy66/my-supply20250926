DROP TABLE IF EXISTS `products`;
CREATE TABLE IF NOT EXISTS `products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `product_id` VARCHAR(64) NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `commodity_type` VARCHAR(64) NULL,
  `platform_standard_grade_name` VARCHAR(128) NULL,
  `platform_base_premium` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `custom_premium` DECIMAL(10,2) NOT NULL DEFAULT 0,
  `packaging_image` LONGTEXT NULL,
  `production_year` INT NULL,
  `package_spec` VARCHAR(255) NULL,
  `current_price` DECIMAL(12,2) NULL,
  `status` VARCHAR(16) NOT NULL DEFAULT '上架',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `ix_products_order` (`created_at`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Warehouses
DROP TABLE IF EXISTS `warehouses`;
CREATE TABLE IF NOT EXISTS `warehouses` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `owner_company` VARCHAR(255) NULL,
  `province` VARCHAR(64) NULL,
  `city` VARCHAR(64) NULL,
  `capacity_ton` INT NULL,
  `area_m2` INT NULL,
  `enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `status` VARCHAR(32) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY `uq_warehouse_code` (`code`),
  INDEX `ix_warehouse_order` (`created_at`, `id`),
  INDEX `ix_warehouse_owner` (`owner_company`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `inventory_owners`;
CREATE TABLE IF NOT EXISTS `inventory_owners` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `company` VARCHAR(255) NOT NULL,
  `code` VARCHAR(64) NOT NULL,
  `creditCode` VARCHAR(64) NULL,
  `regAddress` VARCHAR(255) NULL,
  `legalRepName` VARCHAR(64) NULL,
  `legalRepId` VARCHAR(64) NULL,
  `establishDate` DATE NULL,
  `registeredCapital` VARCHAR(64) NULL,
  `businessScope` VARCHAR(512) NULL,
  `bankName` VARCHAR(128) NULL,
  `bankAccount` VARCHAR(64) NULL,
  `companyEmail` VARCHAR(128) NULL,
  `companyPhone` VARCHAR(32) NULL,
  `annualRevenueRange` VARCHAR(64) NULL,
  `mainBusiness` VARCHAR(255) NULL,
  `partners` VARCHAR(255) NULL,
  `adminName` VARCHAR(64) NULL,
  `adminDept` VARCHAR(64) NULL,
  `adminTitle` VARCHAR(64) NULL,
  `adminPhone` VARCHAR(32) NULL,
  `contact` VARCHAR(64) NULL,
  `phone` VARCHAR(32) NULL,
  `address` VARCHAR(255) NULL,
  `license` VARCHAR(255) NULL,
  `legalIdFront` VARCHAR(255) NULL,
  `legalIdBack` VARCHAR(255) NULL,
  `bankPermit` VARCHAR(255) NULL,
  `authLetter` VARCHAR(255) NULL,
  `seal` VARCHAR(255) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  UNIQUE KEY `uq_owner_company_code` (`company`, `code`),
  INDEX `ix_owner_order` (`created_at`, `id`),
  INDEX `ix_owner_company` (`company`),
  INDEX `ix_owner_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `storages`;
CREATE TABLE IF NOT EXISTS `storages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `item` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 0,
  `remark` VARCHAR(255) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `ix_storage_order` (`created_at`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `receivables`;
CREATE TABLE IF NOT EXISTS `receivables` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `value` DECIMAL(14,2) NOT NULL DEFAULT 0,
  `status` VARCHAR(32) NULL,
  `expire` DATE NULL,
  `desc` VARCHAR(512) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `ix_receivable_order` (`created_at`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


