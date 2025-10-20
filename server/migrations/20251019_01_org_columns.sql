-- 组织维度隔离字段

ALTER TABLE `import_inbound_datasets`
  ADD COLUMN `owner_org_id` BIGINT NULL AFTER `user_id`,
  ADD INDEX `idx_owner_org_id` (`owner_org_id`);



