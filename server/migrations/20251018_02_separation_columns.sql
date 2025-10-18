-- MySQL 8.0+ 数据隔离所需字段补全与索引

ALTER TABLE `inbound_reservations`
  ADD COLUMN IF NOT EXISTS `created_by_user_id` BIGINT NULL AFTER `measurement_unit`,
  ADD COLUMN IF NOT EXISTS `created_by_role` VARCHAR(32) NULL AFTER `created_by_user_id`;

ALTER TABLE `inbound_reservations`
  ADD INDEX IF NOT EXISTS `idx_created_by_user` (`created_by_user_id`),
  ADD INDEX IF NOT EXISTS `idx_status` (`status`);

ALTER TABLE `inbound_orders`
  ADD COLUMN IF NOT EXISTS `created_by_user_id` BIGINT NULL AFTER `status`,
  ADD COLUMN IF NOT EXISTS `created_by_role` VARCHAR(32) NULL AFTER `created_by_user_id`;

ALTER TABLE `inbound_orders`
  ADD INDEX IF NOT EXISTS `idx_created_by_user` (`created_by_user_id`),
  ADD INDEX IF NOT EXISTS `idx_status` (`status`);

ALTER TABLE `warehouse_receipts`
  ADD COLUMN IF NOT EXISTS `created_by_user_id` BIGINT NULL AFTER `status`;

ALTER TABLE `warehouse_receipts`
  ADD INDEX IF NOT EXISTS `idx_created_by_user` (`created_by_user_id`),
  ADD INDEX IF NOT EXISTS `idx_status` (`status`);


