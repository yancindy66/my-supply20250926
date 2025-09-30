-- 主体表（一个账号一个主体；平台运营用户可不绑定主体）
CREATE TABLE IF NOT EXISTS organizations (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '主体主键ID',
  org_type ENUM('depositor','warehouse','financial','guarantee','qc','regulator','platform') NOT NULL COMMENT '主体类型',
  name VARCHAR(255) NOT NULL COMMENT '主体名称',
  unified_social_credit_code VARCHAR(100) NULL COMMENT '统一社会信用代码',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-正常，2-待审核',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_org_name_type (name, org_type),
  UNIQUE KEY uk_org_uscc (unified_social_credit_code),
  KEY idx_org_type (org_type),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='业务主体表';

-- 组织结构：部门表（树形）
CREATE TABLE IF NOT EXISTS departments (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  organization_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(128) NOT NULL,
  parent_id BIGINT UNSIGNED NULL,
  path VARCHAR(1024) NULL COMMENT '路径编码，如 /1/3/5',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_org (organization_id),
  KEY idx_parent (parent_id),
  KEY idx_path (path),
  CONSTRAINT fk_dept_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_dept_parent FOREIGN KEY (parent_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门表';

-- 组织结构：岗位表
CREATE TABLE IF NOT EXISTS positions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  organization_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(128) NOT NULL,
  department_id BIGINT UNSIGNED NULL,
  rank INT NULL COMMENT '职级/序列',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_org (organization_id),
  KEY idx_dept (department_id),
  CONSTRAINT fk_pos_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  CONSTRAINT fk_pos_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='岗位表';

-- 用户-岗位关联（可多岗位，标记主岗）
CREATE TABLE IF NOT EXISTS user_positions (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  position_id BIGINT UNSIGNED NOT NULL,
  department_id BIGINT UNSIGNED NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_position (user_id, position_id),
  KEY idx_user (user_id),
  KEY idx_position (position_id),
  CONSTRAINT fk_up_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_up_pos FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE,
  CONSTRAINT fk_up_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户岗位关联表';

-- 统一用户表（来自业务定义）
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '用户主键ID',
  organization_id BIGINT UNSIGNED NULL COMMENT '所属主体，平台运营可为空',
  username VARCHAR(64) NOT NULL COMMENT '用户名（登录用）',
  password_hash VARCHAR(255) NOT NULL COMMENT '加密密码',
  name VARCHAR(64) NOT NULL COMMENT '显示名称（公司名/人名）',
  email VARCHAR(255) NULL COMMENT '邮箱',
  phone VARCHAR(20) NULL COMMENT '手机号',
  avatar_url VARCHAR(500) NULL COMMENT '头像链接',
  type ENUM('depositor','warehouse','financial','guarantee','qc','platform') NOT NULL COMMENT '用户类型',
  company_name VARCHAR(255) NULL COMMENT '公司法定名称',
  unified_social_credit_code VARCHAR(100) NULL COMMENT '统一社会信用代码',
  business_license_url VARCHAR(500) NULL COMMENT '营业执照',
  legal_representative VARCHAR(64) NULL COMMENT '法定代表人',
  contact_person VARCHAR(64) NULL COMMENT '联系人',
  contact_phone VARCHAR(20) NULL COMMENT '联系人电话',
  registered_address TEXT NULL COMMENT '注册地址',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-正常，2-待审核',
  last_login_at DATETIME NULL COMMENT '最后登录时间',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_org_id (organization_id),
  UNIQUE KEY uk_username (username),
  UNIQUE KEY uk_phone (phone),
  UNIQUE KEY uk_social_credit_code (unified_social_credit_code),
  KEY idx_type (type),
  KEY idx_status (status),
  CONSTRAINT fk_users_org FOREIGN KEY (organization_id) REFERENCES organizations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='统一用户表';

-- 系统角色表
CREATE TABLE IF NOT EXISTS roles (
  id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  role_key VARCHAR(64) NOT NULL COMMENT '角色键（英文，程序内使用）',
  role_name VARCHAR(64) NOT NULL COMMENT '角色名称（中文，用于显示）',
  description VARCHAR(255) DEFAULT NULL COMMENT '角色描述',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_role_key (role_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统角色表';

-- 初始化角色数据
INSERT INTO roles (role_key, role_name, description) VALUES
('depositor', '存货人', '货物的所有者，可进行仓单的各项操作'),
('warehouse_manager', '仓储机构', '负责货物的仓储、入库、出库、仓单管理'),
('financial_org', '金融机构', '提供融资服务，进行风控与规则管理'),
('guarantee_org', '担保机构', '为融资提供担保服务'),
('qc_org', '质检机构', '负责货物的质量检验'),
('regulator', '监管方', '物联网监控角色，监管可视化'),
('platform_admin', '平台运营', '系统后台管理员，拥有全部权限')
ON DUPLICATE KEY UPDATE role_name=VALUES(role_name), description=VALUES(description);

-- 用户与角色关联表
CREATE TABLE IF NOT EXISTS user_roles (
  id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT(20) UNSIGNED NOT NULL,
  role_id BIGINT(20) UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_role (user_id, role_id),
  KEY idx_role_id (role_id),
  CONSTRAINT fk_user_roles_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role_id FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户与角色关联表';

-- 权限明细表
CREATE TABLE IF NOT EXISTS permissions (
  id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  permission_key VARCHAR(255) NOT NULL COMMENT '权限键（通常对应前端路由或API路径）',
  name VARCHAR(64) NOT NULL COMMENT '权限名称',
  description VARCHAR(255) DEFAULT NULL COMMENT '权限描述',
  module VARCHAR(64) DEFAULT NULL COMMENT '所属模块（如：仓单管理）',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_permission_key (permission_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限明细表';

-- 初始化权限（示例；可按路由清单批量扩充）
INSERT INTO permissions (permission_key, name, module) VALUES
('/inbound/apply', '入库申请', '入库管理'),
('/inbound/list', '入库申请列表', '入库管理'),
('/warehouse-receipt/list', '仓单列表', '仓单管理'),
('/pledge/create', '创建质押', '质押管理'),
('/pledge/list', '质押列表', '质押管理'),
('/freeze/apply', '冻结申请', '仓单管理'),
('/freeze/release', '冻结解冻', '仓单管理'),
('/trade/list', '交易列表', '交易管理'),
('/trade/create', '发布交易', '交易管理'),
('/transfer/confirm', '过户确认', '交易管理'),
('/outbound/apply', '出库预约', '出库管理'),
('/outbound/list', '出库预约列表', '出库管理'),
('/unfreeze/apply', '解冻申请', '质押管理'),
('/unfreeze/review', '解冻审批', '质押管理')
ON DUPLICATE KEY UPDATE name=VALUES(name), module=VALUES(module);

-- 角色-权限关联表
CREATE TABLE IF NOT EXISTS role_permissions (
  id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  role_id BIGINT(20) UNSIGNED NOT NULL,
  permission_id BIGINT(20) UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_role_permission (role_id, permission_id),
  KEY idx_permission_id (permission_id),
  CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
  CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色-权限关联表';

-- 入库预约表（新版定义）
CREATE TABLE IF NOT EXISTS inbound_reservations (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  reservation_number VARCHAR(64) NOT NULL COMMENT '预约单号',
  reservation_type ENUM('by_depositor','by_logistics','by_warehouse') NOT NULL,
  reservist_id BIGINT UNSIGNED NOT NULL COMMENT '预约人ID',
  applicant_id BIGINT UNSIGNED NOT NULL COMMENT '货主ID',
  target_warehouse_id BIGINT UNSIGNED NOT NULL COMMENT '目标仓库ID',
  commodity_id BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
  total_planned_quantity DECIMAL(20,4) NOT NULL COMMENT '计划入库总量',
  measurement_unit VARCHAR(20) NOT NULL COMMENT '计量单位',
  logistics_provider VARCHAR(255) NULL COMMENT '物流承运商',
  transport_vehicle_no VARCHAR(100) NULL COMMENT '运输车牌',
  driver_name VARCHAR(64) NULL COMMENT '司机姓名',
  driver_phone VARCHAR(20) NULL COMMENT '司机电话',
  driver_id_card VARCHAR(50) NULL COMMENT '司机身份证',
  expected_arrival_time DATETIME NULL COMMENT '预计到库时间',
  source_of_goods VARCHAR(500) NULL COMMENT '货物来源',
  status ENUM('draft','submitted','warehouse_confirmed','warehouse_rejected','platform_approved','in_progress','partially_completed','fully_completed','cancelled') NOT NULL DEFAULT 'draft',
  unique_reservation_code VARCHAR(12) NULL COMMENT '唯一预约码',
  warehouse_operator_id BIGINT UNSIGNED NULL,
  warehouse_handled_at DATETIME NULL,
  warehouse_remarks TEXT NULL,
  platform_auditor_id BIGINT UNSIGNED NULL,
  platform_audited_at DATETIME NULL,
  platform_audit_remarks TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_reservation_number (reservation_number),
  UNIQUE KEY uk_reservation_code (unique_reservation_code),
  KEY idx_applicant_id (applicant_id),
  KEY idx_status (status),
  CONSTRAINT fk_inbound_reservations_applicant FOREIGN KEY (applicant_id) REFERENCES users(id),
  CONSTRAINT fk_inbound_reservations_warehouse FOREIGN KEY (target_warehouse_id) REFERENCES warehouses(id),
  CONSTRAINT fk_inbound_reservations_commodity FOREIGN KEY (commodity_id) REFERENCES commodities(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='入库预约表';

-- 入库单表（新版定义）
CREATE TABLE IF NOT EXISTS inbound_orders (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  inbound_order_number VARCHAR(64) NOT NULL COMMENT '入库单号',
  reservation_id BIGINT UNSIGNED NOT NULL COMMENT '所属预约单ID',
  actual_vehicle_no VARCHAR(100) NOT NULL COMMENT '实际车牌',
  actual_driver_name VARCHAR(64) NOT NULL COMMENT '实际司机',
  actual_driver_phone VARCHAR(20) NOT NULL COMMENT '司机电话',
  actual_driver_id_card VARCHAR(50) NOT NULL COMMENT '司机身份证',
  actual_quantity DECIMAL(20,4) NOT NULL COMMENT '本车实际入库量',
  storage_location_id BIGINT UNSIGNED NOT NULL COMMENT '入库垛位ID',
  vehicle_capture_image_url VARCHAR(500) NULL COMMENT '车辆抓拍',
  storage_empty_image_url VARCHAR(500) NULL COMMENT '空仓照片',
  unloading_video_url VARCHAR(500) NULL COMMENT '卸货视频',
  qc_report_url VARCHAR(500) NULL COMMENT '质检报告',
  qc_video_conference_url VARCHAR(500) NULL COMMENT '视频验货链接',
  status ENUM('arrived','unloading','qc_pending','qc_passed','qc_failed','completed') NOT NULL DEFAULT 'arrived',
  warehouse_receipt_id BIGINT UNSIGNED NULL COMMENT '生成的仓单ID',
  receipt_generation_status ENUM('pending','generating','success','failed') NOT NULL DEFAULT 'pending',
  receipt_generation_attempts INT NOT NULL DEFAULT 0,
  receipt_generation_error TEXT NULL,
  receipt_generated_at DATETIME NULL,
  warehouse_operator_id BIGINT UNSIGNED NOT NULL COMMENT '仓库操作员',
  completed_at DATETIME NULL COMMENT '完成时间',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_inbound_order_number (inbound_order_number),
  KEY idx_reservation_id (reservation_id),
  KEY idx_receipt_status (receipt_generation_status),
  CONSTRAINT fk_inbound_orders_reservation FOREIGN KEY (reservation_id) REFERENCES inbound_reservations(id) ON DELETE CASCADE,
  CONSTRAINT fk_inbound_orders_storage_location FOREIGN KEY (storage_location_id) REFERENCES warehouse_storage_locations(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='入库单表';

-- 入库单明细（为质押标记等提供精确到项的关联）
CREATE TABLE IF NOT EXISTS inbound_order_items (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  inbound_order_id BIGINT UNSIGNED NOT NULL,
  commodity_id BIGINT UNSIGNED NOT NULL,
  quantity DECIMAL(20,4) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_inbound_order_id (inbound_order_id),
  CONSTRAINT fk_in_items_order FOREIGN KEY (inbound_order_id) REFERENCES inbound_orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_in_items_commodity FOREIGN KEY (commodity_id) REFERENCES commodities(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='入库单明细';

-- 仓库表（来自业务定义），外键指向 users(id) 作为经营方
CREATE TABLE IF NOT EXISTS warehouses (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '仓库主键ID',
  warehouse_owner_id BIGINT UNSIGNED NOT NULL COMMENT '仓库经营方ID',
  warehouse_code VARCHAR(64) NOT NULL COMMENT '仓库编码',
  warehouse_name VARCHAR(255) NOT NULL COMMENT '仓库名称',
  warehouse_alias VARCHAR(255) NULL COMMENT '仓库别称',
  region_code VARCHAR(20) NOT NULL COMMENT '行政区划代码',
  address_detail TEXT NOT NULL COMMENT '详细地址',
  longitude DECIMAL(10,7) NULL COMMENT '经度',
  latitude DECIMAL(10,7) NULL COMMENT '纬度',
  warehouse_type ENUM('general','cold_storage','dangerous_goods') NOT NULL DEFAULT 'general',
  total_area DECIMAL(10,2) NULL COMMENT '总面积（㎡）',
  usable_area DECIMAL(10,2) NULL COMMENT '可用面积（㎡）',
  storage_capacity DECIMAL(15,4) NULL COMMENT '设计库容（吨）',
  is_supervised TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否监管仓',
  supervision_license_url VARCHAR(500) NULL COMMENT '监管资质文件',
  contact_person VARCHAR(64) NULL COMMENT '仓库负责人',
  contact_phone VARCHAR(20) NULL COMMENT '仓库电话',
  status ENUM('pending_review','approved','rejected','deactivated') NOT NULL DEFAULT 'pending_review',
  audit_remarks TEXT NULL COMMENT '审核备注',
  auditor_id BIGINT UNSIGNED NULL COMMENT '审核人',
  audited_at DATETIME NULL COMMENT '审核时间',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_warehouse_code (warehouse_code),
  UNIQUE KEY uk_warehouse_name_owner (warehouse_name, warehouse_owner_id),
  KEY idx_owner_id (warehouse_owner_id),
  KEY idx_status (status),
  CONSTRAINT fk_warehouses_owner_id FOREIGN KEY (warehouse_owner_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='仓库表';

-- 商品表（commodities）
CREATE TABLE IF NOT EXISTS commodities (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '商品主键ID',
  spu_code VARCHAR(64) NOT NULL COMMENT '标准产品编码',
  sku_code VARCHAR(64) NOT NULL COMMENT '库存单位编码',
  product_name VARCHAR(255) NOT NULL COMMENT '商品品名',
  product_brand VARCHAR(255) NULL COMMENT '商品品牌',
  specifications TEXT NOT NULL COMMENT '商品规格',
  measurement_unit VARCHAR(20) NOT NULL COMMENT '计量单位',
  category_id BIGINT UNSIGNED NULL COMMENT '商品分类ID',
  hs_code VARCHAR(100) NULL COMMENT '海关HS编码',
  quality_standard VARCHAR(255) NULL COMMENT '执行质量标准',
  extended_attributes JSON NULL COMMENT '扩展属性',
  status ENUM('draft','pending_review','approved','rejected','disabled') NOT NULL DEFAULT 'draft',
  audit_remarks TEXT NULL COMMENT '审核备注',
  auditor_id BIGINT UNSIGNED NULL COMMENT '审核人',
  audited_at DATETIME NULL COMMENT '审核时间',
  created_by BIGINT UNSIGNED NOT NULL COMMENT '创建人',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_sku_code (sku_code),
  UNIQUE KEY uk_spu_sku (spu_code, sku_code),
  KEY idx_status (status),
  KEY idx_created_by (created_by),
  CONSTRAINT fk_commodities_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

-- 仓库垛位/货位表
CREATE TABLE IF NOT EXISTS warehouse_storage_locations (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  warehouse_id BIGINT UNSIGNED NOT NULL COMMENT '所属仓库ID',
  location_code VARCHAR(64) NOT NULL COMMENT '垛位/货位编码',
  current_commodity_id BIGINT UNSIGNED NULL COMMENT '当前存放的商品ID',
  current_capacity DECIMAL(20,4) NULL COMMENT '当前存放量',
  max_capacity DECIMAL(20,4) NOT NULL COMMENT '最大库容',
  status ENUM('empty','occupied','maintenance') NOT NULL DEFAULT 'empty',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_warehouse_location (warehouse_id, location_code),
  KEY idx_status (status),
  CONSTRAINT fk_storage_locations_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='仓库垛位表';

-- 仓单表
CREATE TABLE IF NOT EXISTS warehouse_receipts (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT COMMENT '仓单主键ID',
  receipt_number VARCHAR(64) NOT NULL COMMENT '仓单编号',
  receipt_name VARCHAR(255) NOT NULL COMMENT '仓单名称',
  depositor_id BIGINT UNSIGNED NOT NULL COMMENT '存货人ID',
  warehouse_id BIGINT UNSIGNED NOT NULL COMMENT '仓库ID',
  commodity_id BIGINT UNSIGNED NOT NULL COMMENT '商品ID',
  related_reservation_id BIGINT UNSIGNED NULL COMMENT '关联的入库预约ID',
  quantity DECIMAL(20,4) NOT NULL COMMENT '货物数量',
  measurement_unit VARCHAR(20) NOT NULL COMMENT '计量单位',
  storage_location VARCHAR(255) NULL COMMENT '存储位置',
  qc_report_url VARCHAR(500) NULL COMMENT '质检报告',
  qc_result VARCHAR(100) NULL COMMENT '质检结果',
  inbound_time DATETIME NOT NULL COMMENT '入库时间',
  effective_start DATETIME NOT NULL COMMENT '有效期开始',
  effective_end DATETIME NOT NULL COMMENT '有效期结束',
  status ENUM('pending','in_stock','pledged','frozen','transferring','outbound','completed') NOT NULL DEFAULT 'pending',
  receipt_class ENUM('non_standard','exchange_standard') NOT NULL DEFAULT 'non_standard',
  standard_code VARCHAR(50) NULL COMMENT '遵循的标准编码',
  exchange_type ENUM('SHFE','DCE','CZCE','INE','NONE') DEFAULT 'NONE',
  is_pledgeable TINYINT(1) NOT NULL DEFAULT 1,
  is_tradable TINYINT(1) NOT NULL DEFAULT 1,
  liquidity_level ENUM('low','medium','high') NOT NULL DEFAULT 'low',
  blockchain_tx_hash VARCHAR(255) NULL COMMENT '区块链哈希',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_receipt_number (receipt_number),
  KEY idx_depositor_id (depositor_id),
  KEY idx_status (status),
  KEY idx_receipt_class (receipt_class),
  KEY idx_effective_end (effective_end),
  CONSTRAINT fk_receipts_depositor_id FOREIGN KEY (depositor_id) REFERENCES users(id),
  CONSTRAINT fk_receipts_warehouse_id FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
  CONSTRAINT fk_receipts_commodity_id FOREIGN KEY (commodity_id) REFERENCES commodities(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='仓单表';

-- 仓单质押冻结记录表
CREATE TABLE IF NOT EXISTS receipt_pledge_records (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  record_number VARCHAR(64) NOT NULL UNIQUE COMMENT '质押记录编号',
  warehouse_receipt_id BIGINT UNSIGNED NOT NULL COMMENT '关联仓单ID',
  storage_in_id BIGINT UNSIGNED NOT NULL COMMENT '关联入库单ID',
  pledge_type ENUM('full_pledge','partial_pledge') NOT NULL COMMENT '质押类型:全额/部分',
  pledge_status ENUM('active','frozen','released','disposed') DEFAULT 'active' COMMENT '质押状态',
  pledged_quantity DECIMAL(15,4) NOT NULL COMMENT '质押数量',
  pledged_unit VARCHAR(20) NOT NULL COMMENT '质押单位',
  pledged_value DECIMAL(15,2) NOT NULL COMMENT '质押物估值',
  original_quantity DECIMAL(15,4) NOT NULL COMMENT '原始数量',
  freeze_type ENUM('judicial_freeze','pledge_freeze','other_freeze') NOT NULL COMMENT '冻结类型',
  freeze_status ENUM('frozen','partially_released','fully_released') DEFAULT 'frozen' COMMENT '冻结状态',
  freeze_start_date DATETIME NOT NULL COMMENT '冻结开始时间',
  freeze_end_date DATETIME NULL COMMENT '冻结结束时间',
  freeze_reason VARCHAR(500) NOT NULL COMMENT '冻结原因',
  financing_application_id BIGINT UNSIGNED NULL COMMENT '关联融资申请ID',
  guarantee_project_id BIGINT UNSIGNED NULL COMMENT '关联担保项目ID',
  pledge_agreement_url VARCHAR(500) NULL COMMENT '质押协议文件',
  frozen_by BIGINT UNSIGNED NOT NULL COMMENT '冻结操作人',
  frozen_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '冻结操作时间',
  released_by BIGINT UNSIGNED NULL COMMENT '解冻操作人',
  released_at DATETIME NULL COMMENT '解冻操作时间',
  release_reason VARCHAR(500) NULL COMMENT '解冻原因',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_pledge_status (pledge_status),
  KEY idx_freeze_status (freeze_status),
  KEY idx_receipt_id (warehouse_receipt_id),
  KEY idx_receipt_status_receipt (warehouse_receipt_id, pledge_status),
  KEY idx_financing_app (financing_application_id),
  KEY idx_freeze_date (freeze_start_date),
  CONSTRAINT fk_rpr_receipt FOREIGN KEY (warehouse_receipt_id) REFERENCES warehouse_receipts(id),
  CONSTRAINT fk_rpr_in_order FOREIGN KEY (storage_in_id) REFERENCES inbound_orders(id),
  CONSTRAINT fk_rpr_frozen_by FOREIGN KEY (frozen_by) REFERENCES users(id),
  CONSTRAINT fk_rpr_released_by FOREIGN KEY (released_by) REFERENCES users(id)
) COMMENT='仓单质押冻结记录表';

-- 仓单冻结操作明细
CREATE TABLE IF NOT EXISTS receipt_freeze_details (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  pledge_record_id BIGINT UNSIGNED NOT NULL COMMENT '质押记录ID',
  operation_type ENUM('freeze','partial_release','full_release') NOT NULL COMMENT '操作类型',
  operated_quantity DECIMAL(15,4) NOT NULL COMMENT '操作数量',
  remaining_quantity DECIMAL(15,4) NOT NULL COMMENT '剩余冻结数量',
  before_quantity DECIMAL(15,4) NOT NULL COMMENT '操作前数量',
  after_quantity DECIMAL(15,4) NOT NULL COMMENT '操作后数量',
  operated_by BIGINT UNSIGNED NOT NULL COMMENT '操作人',
  operated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  operation_reason VARCHAR(500) NOT NULL COMMENT '操作原因',
  business_document_no VARCHAR(100) NULL COMMENT '业务单据号',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_pledge_record (pledge_record_id),
  KEY idx_operation_time (operated_at),
  CONSTRAINT fk_rfd_record FOREIGN KEY (pledge_record_id) REFERENCES receipt_pledge_records(id),
  CONSTRAINT fk_rfd_operator FOREIGN KEY (operated_by) REFERENCES users(id)
) COMMENT='仓单冻结操作明细表';

-- 入库单质押标记表
CREATE TABLE IF NOT EXISTS storage_in_pledge_marks (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  storage_in_id BIGINT UNSIGNED NOT NULL COMMENT '入库单ID',
  storage_in_item_id BIGINT UNSIGNED NOT NULL COMMENT '入库单明细ID',
  is_pledged BOOLEAN DEFAULT FALSE COMMENT '是否已质押',
  pledged_quantity DECIMAL(15,4) DEFAULT 0 COMMENT '已质押数量',
  available_quantity DECIMAL(15,4) NOT NULL COMMENT '可质押数量',
  warehouse_receipt_id BIGINT UNSIGNED NULL COMMENT '生成的仓单ID',
  receipt_quantity DECIMAL(15,4) NULL COMMENT '仓单数量',
  mark_status ENUM('pending','partial_pledged','fully_pledged','released') DEFAULT 'pending' COMMENT '标记状态',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_storage_item (storage_in_item_id),
  KEY idx_storage_in (storage_in_id),
  KEY idx_pledge_status (mark_status),
  CONSTRAINT fk_sipm_in_order FOREIGN KEY (storage_in_id) REFERENCES inbound_orders(id),
  CONSTRAINT fk_sipm_in_item FOREIGN KEY (storage_in_item_id) REFERENCES inbound_order_items(id),
  CONSTRAINT fk_sipm_receipt FOREIGN KEY (warehouse_receipt_id) REFERENCES warehouse_receipts(id)
) COMMENT='入库单质押标记表';

-- 出库预约表
CREATE TABLE IF NOT EXISTS outbound_reservations (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  reservation_number VARCHAR(64) NOT NULL COMMENT '出库预约单号',
  applicant_id BIGINT UNSIGNED NOT NULL COMMENT '申请人（存货人）',
  warehouse_id BIGINT UNSIGNED NOT NULL COMMENT '出库仓库',
  warehouse_receipt_id BIGINT UNSIGNED NOT NULL COMMENT '对应仓单',
  planned_quantity DECIMAL(20,4) NOT NULL COMMENT '计划出库量',
  measurement_unit VARCHAR(20) NOT NULL,
  expected_outbound_time DATETIME NULL,
  status ENUM('draft','submitted','warehouse_confirmed','completed','cancelled') NOT NULL DEFAULT 'draft',
  confirmed_by BIGINT UNSIGNED NULL COMMENT '仓储方确认人',
  confirmed_at DATETIME NULL COMMENT '仓储方确认时间',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_out_reservation_number (reservation_number),
  KEY idx_applicant_id (applicant_id),
  KEY idx_receipt_id (warehouse_receipt_id),
  CONSTRAINT fk_out_res_applicant FOREIGN KEY (applicant_id) REFERENCES users(id),
  CONSTRAINT fk_out_res_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
  CONSTRAINT fk_out_res_receipt FOREIGN KEY (warehouse_receipt_id) REFERENCES warehouse_receipts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='出库预约表';

-- 出库单表
CREATE TABLE IF NOT EXISTS outbound_orders (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  outbound_order_number VARCHAR(64) NOT NULL COMMENT '出库单号',
  reservation_id BIGINT UNSIGNED NOT NULL COMMENT '所属出库预约',
  actual_quantity DECIMAL(20,4) NOT NULL COMMENT '实际出库量',
  measurement_unit VARCHAR(20) NOT NULL,
  status ENUM('arranged','picking','loading','completed','cancelled') NOT NULL DEFAULT 'arranged',
  completed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_outbound_order_number (outbound_order_number),
  KEY idx_reservation_id (reservation_id),
  CONSTRAINT fk_out_orders_reservation FOREIGN KEY (reservation_id) REFERENCES outbound_reservations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='出库单表';

-- 仓单交易表（挂单/撮合）
CREATE TABLE IF NOT EXISTS warehouse_receipt_trades (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  trade_no VARCHAR(64) NOT NULL,
  warehouse_receipt_id BIGINT UNSIGNED NOT NULL,
  seller_id BIGINT UNSIGNED NOT NULL,
  buyer_id BIGINT UNSIGNED NULL,
  price DECIMAL(16,2) NOT NULL,
  quantity DECIMAL(20,4) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  status ENUM('listed','matched','settled','cancelled') NOT NULL DEFAULT 'listed',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_trade_no (trade_no),
  KEY idx_receipt_id (warehouse_receipt_id),
  KEY idx_seller (seller_id),
  KEY idx_buyer (buyer_id),
  CONSTRAINT fk_wrtr_receipt FOREIGN KEY (warehouse_receipt_id) REFERENCES warehouse_receipts(id),
  CONSTRAINT fk_wrtr_seller FOREIGN KEY (seller_id) REFERENCES users(id),
  CONSTRAINT fk_wrtr_buyer FOREIGN KEY (buyer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='仓单交易表';

-- 仓单过户表
CREATE TABLE IF NOT EXISTS warehouse_receipt_transfers (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  transfer_no VARCHAR(64) NOT NULL,
  warehouse_receipt_id BIGINT UNSIGNED NOT NULL,
  from_user_id BIGINT UNSIGNED NOT NULL,
  to_user_id BIGINT UNSIGNED NOT NULL,
  quantity DECIMAL(20,4) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  status ENUM('pending','approved','rejected','completed') NOT NULL DEFAULT 'pending',
  trade_id BIGINT UNSIGNED NULL COMMENT '来源交易ID（若由交易触发）',
  approved_by BIGINT UNSIGNED NULL,
  approved_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_transfer_no (transfer_no),
  KEY idx_receipt_id (warehouse_receipt_id),
  KEY idx_from_user (from_user_id),
  KEY idx_to_user (to_user_id),
  CONSTRAINT fk_wrtrf_receipt FOREIGN KEY (warehouse_receipt_id) REFERENCES warehouse_receipts(id),
  CONSTRAINT fk_wrtrf_from FOREIGN KEY (from_user_id) REFERENCES users(id),
  CONSTRAINT fk_wrtrf_to FOREIGN KEY (to_user_id) REFERENCES users(id),
  CONSTRAINT fk_wrtrf_approved_by FOREIGN KEY (approved_by) REFERENCES users(id),
  CONSTRAINT fk_wrtrf_trade FOREIGN KEY (trade_id) REFERENCES warehouse_receipt_trades(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='仓单过户表';

-- 质押申请表（审批后由仓储执行冻结，生成/关联质押冻结记录）
CREATE TABLE IF NOT EXISTS pledge_applications (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  application_no VARCHAR(64) NOT NULL,
  warehouse_receipt_id BIGINT UNSIGNED NOT NULL,
  applicant_user_id BIGINT UNSIGNED NOT NULL COMMENT '发起人（存货人/金融）',
  finance_org_user_id BIGINT UNSIGNED NULL COMMENT '目标金融机构用户（可选）',
  requested_quantity DECIMAL(20,4) NOT NULL,
  measurement_unit VARCHAR(20) NOT NULL,
  requested_value DECIMAL(16,2) NULL,
  remarks VARCHAR(500) NULL,
  status ENUM('submitted','finance_approved','finance_rejected','frozen','completed','cancelled') NOT NULL DEFAULT 'submitted',
  approved_by BIGINT UNSIGNED NULL,
  approved_at DATETIME NULL,
  pledge_record_id BIGINT UNSIGNED NULL COMMENT '审批通过后关联的质押冻结记录',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_pledge_app_no (application_no),
  KEY idx_receipt_id (warehouse_receipt_id),
  KEY idx_status (status),
  CONSTRAINT fk_plg_app_receipt FOREIGN KEY (warehouse_receipt_id) REFERENCES warehouse_receipts(id),
  CONSTRAINT fk_plg_app_applicant FOREIGN KEY (applicant_user_id) REFERENCES users(id),
  CONSTRAINT fk_plg_app_fin_user FOREIGN KEY (finance_org_user_id) REFERENCES users(id),
  CONSTRAINT fk_plg_app_approved_by FOREIGN KEY (approved_by) REFERENCES users(id),
  CONSTRAINT fk_plg_app_record FOREIGN KEY (pledge_record_id) REFERENCES receipt_pledge_records(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='质押申请表';

-- 解冻申请表
CREATE TABLE IF NOT EXISTS unfreeze_applications (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  application_no VARCHAR(64) NOT NULL,
  pledge_record_id BIGINT UNSIGNED NOT NULL COMMENT '关联质押记录',
  request_user_id BIGINT UNSIGNED NOT NULL,
  request_reason VARCHAR(500) NOT NULL,
  status ENUM('submitted','approved','rejected','completed') NOT NULL DEFAULT 'submitted',
  approved_by BIGINT UNSIGNED NULL,
  approved_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_unfreeze_no (application_no),
  KEY idx_pledge_record_id (pledge_record_id),
  CONSTRAINT fk_unfreeze_pledge FOREIGN KEY (pledge_record_id) REFERENCES receipt_pledge_records(id),
  CONSTRAINT fk_unfreeze_req_user FOREIGN KEY (request_user_id) REFERENCES users(id),
  CONSTRAINT fk_unfreeze_approved_by FOREIGN KEY (approved_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='解冻申请表';

-- 监管（IoT）相关表：设备、遥测、报警、绑定
CREATE TABLE IF NOT EXISTS iot_devices (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  device_sn VARCHAR(64) NOT NULL,
  device_type VARCHAR(64) NOT NULL,
  vendor VARCHAR(64) NULL,
  status ENUM('online','offline','maintenance') NOT NULL DEFAULT 'offline',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_device_sn (device_sn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='IoT 设备';

CREATE TABLE IF NOT EXISTS iot_device_bindings (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  device_id BIGINT UNSIGNED NOT NULL,
  warehouse_id BIGINT UNSIGNED NULL,
  storage_location_id BIGINT UNSIGNED NULL,
  warehouse_receipt_id BIGINT UNSIGNED NULL,
  bound_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_device_binding (device_id, warehouse_id, storage_location_id, warehouse_receipt_id),
  KEY idx_device_id (device_id),
  CONSTRAINT fk_iot_binding_device FOREIGN KEY (device_id) REFERENCES iot_devices(id),
  CONSTRAINT fk_iot_binding_wh FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
  CONSTRAINT fk_iot_binding_loc FOREIGN KEY (storage_location_id) REFERENCES warehouse_storage_locations(id),
  CONSTRAINT fk_iot_binding_receipt FOREIGN KEY (warehouse_receipt_id) REFERENCES warehouse_receipts(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='IoT 设备绑定';

CREATE TABLE IF NOT EXISTS iot_telemetry (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  device_id BIGINT UNSIGNED NOT NULL,
  ts DATETIME NOT NULL,
  metrics JSON NOT NULL,
  KEY idx_device_ts (device_id, ts),
  CONSTRAINT fk_iot_telemetry_device FOREIGN KEY (device_id) REFERENCES iot_devices(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='IoT 遥测';

CREATE TABLE IF NOT EXISTS iot_alerts (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  device_id BIGINT UNSIGNED NOT NULL,
  level ENUM('info','warning','critical') NOT NULL DEFAULT 'warning',
  title VARCHAR(255) NOT NULL,
  detail VARCHAR(1000) NULL,
  status ENUM('open','ack','closed') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at DATETIME NULL,
  KEY idx_device_status (device_id, status),
  CONSTRAINT fk_iot_alerts_device FOREIGN KEY (device_id) REFERENCES iot_devices(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='IoT 告警';
