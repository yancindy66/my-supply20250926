-- 基础用户与多角色（简化：直接 users.role_key；后续可扩展 roles/user_roles）

CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `username` VARCHAR(64) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(64) NULL,
  `role_key` VARCHAR(32) NOT NULL,
  `organization_id` BIGINT NULL,
  `warehouse_id` BIGINT NULL,
  `status` VARCHAR(16) NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL,
  INDEX `idx_role_key` (`role_key`),
  INDEX `idx_org_id` (`organization_id`),
  INDEX `idx_wh_id` (`warehouse_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



