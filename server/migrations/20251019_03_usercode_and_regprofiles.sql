-- 用户编码与注册资料

ALTER TABLE `users`
  ADD COLUMN `user_code` CHAR(6) NULL UNIQUE AFTER `id`;

CREATE TABLE IF NOT EXISTS `code_counters` (
  `key` VARCHAR(32) PRIMARY KEY,
  `val` INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `registration_profiles` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `role_key` VARCHAR(32) NOT NULL,
  `org_name` VARCHAR(128) NULL,
  `license_no` VARCHAR(64) NULL,
  `contact_name` VARCHAR(64) NULL,
  `contact_phone` VARCHAR(32) NULL,
  `warehouse_name` VARCHAR(128) NULL,
  `warehouse_address` VARCHAR(256) NULL,
  `warehouse_type` VARCHAR(32) NULL,
  `materials` JSON NULL,
  `status` VARCHAR(16) NOT NULL DEFAULT 'submitted',
  `locked` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  INDEX `idx_user_id` (`user_id`),
  CONSTRAINT `fk_regprof_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



