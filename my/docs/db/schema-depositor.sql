-- 存货人模块核心表（MySQL 8.0）
CREATE TABLE IF NOT EXISTS depositor_user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(64) NOT NULL,
  type ENUM('depositor','warehouse','financial','guarantee','qc','platform') NOT NULL DEFAULT 'depositor',
  company_name VARCHAR(128) NOT NULL,
  unified_social_credit_code VARCHAR(32) NOT NULL,
  status TINYINT NOT NULL DEFAULT 1 COMMENT '0禁用 1启用 2待审核',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT='用户表（含存货人企业信息）' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inbound_reservation (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  reservation_number VARCHAR(32) NOT NULL UNIQUE,
  depositor_id BIGINT NOT NULL,
  target_warehouse_id BIGINT NOT NULL,
  commodity_id BIGINT NOT NULL,
  total_planned_quantity DECIMAL(18,6) NOT NULL,
  measurement_unit VARCHAR(16) NOT NULL,
  expected_arrival_date DATE NULL,
  status ENUM('draft','submitted','warehouse_confirmed','platform_approved','fully_completed','cancelled') NOT NULL DEFAULT 'draft',
  remarks VARCHAR(512) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reservation_depositor (depositor_id),
  INDEX idx_reservation_warehouse (target_warehouse_id),
  CONSTRAINT fk_reservation_user FOREIGN KEY (depositor_id) REFERENCES depositor_user(id)
) COMMENT='入库预约' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inbound_order (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_no VARCHAR(32) NOT NULL UNIQUE,
  reservation_number VARCHAR(32) NOT NULL,
  status ENUM('created','receiving','completed','cancelled') NOT NULL DEFAULT 'created',
  received_quantity DECIMAL(18,6) NULL,
  unit VARCHAR(16) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_in_order_reservation (reservation_number)
) COMMENT='入库单' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
