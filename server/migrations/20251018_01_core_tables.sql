-- MySQL 8.0+ 初始化核心表（审计、导入数据集）
-- 执行顺序：先运行本文件，再运行 20251018_02_separation_columns.sql

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- 审计日志（通用）
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `scope` VARCHAR(64) NOT NULL,
  `ref_id` VARCHAR(128) NOT NULL,
  `action` VARCHAR(64) NOT NULL,
  `actor` VARCHAR(128) NOT NULL,
  `ts` DATETIME NOT NULL,
  `detail` JSON NULL,
  INDEX `idx_scope_ref` (`scope`, `ref_id`),
  INDEX `idx_ts` (`ts`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 导入数据集（入库申请 Excel 导入的草稿/快照）
CREATE TABLE IF NOT EXISTS `import_inbound_datasets` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` BIGINT NULL,
  `dataset_date` CHAR(8) NULL COMMENT 'YYYYMMDD',
  `headers` JSON NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `import_inbound_rows` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `dataset_id` VARCHAR(64) NOT NULL,
  `row_index` INT NOT NULL,
  `data` JSON NOT NULL,
  `deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  INDEX `idx_dataset_row` (`dataset_id`, `row_index`),
  CONSTRAINT `fk_import_rows_dataset` FOREIGN KEY (`dataset_id`) REFERENCES `import_inbound_datasets`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 兜底创建业务表（若不存在则以最小字段创建）
CREATE TABLE IF NOT EXISTS `inbound_reservations` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `reservation_number` VARCHAR(64) NOT NULL,
  `reservation_type` VARCHAR(32) NULL,
  `reservist_id` BIGINT NULL,
  `applicant_id` BIGINT NULL,
  `target_warehouse_id` BIGINT NULL,
  `commodity_id` BIGINT NULL,
  `total_planned_quantity` DECIMAL(18,6) NULL,
  `measurement_unit` VARCHAR(16) NULL,
  `status` VARCHAR(32) NULL,
  `created_at` DATETIME NULL,
  INDEX `idx_reservation_number` (`reservation_number`),
  INDEX `idx_target_warehouse` (`target_warehouse_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `inbound_orders` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `order_no` VARCHAR(64) NOT NULL,
  `reservation_number` VARCHAR(64) NULL,
  `applicant_id` BIGINT NULL,
  `warehouse_id` BIGINT NULL,
  `planned_quantity` DECIMAL(18,6) NULL,
  `measurement_unit` VARCHAR(16) NULL,
  `status` VARCHAR(32) NULL,
  `created_at` DATETIME NULL,
  INDEX `idx_order_no` (`order_no`),
  INDEX `idx_applicant` (`applicant_id`),
  INDEX `idx_warehouse` (`warehouse_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `warehouse_receipts` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `receipt_number` VARCHAR(64) NOT NULL,
  `reservation_number` VARCHAR(64) NULL,
  `quantity` DECIMAL(18,6) NULL,
  `measurement_unit` VARCHAR(16) NULL,
  `status` VARCHAR(32) NULL,
  `created_at` DATETIME NULL,
  INDEX `idx_receipt_number` (`receipt_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


