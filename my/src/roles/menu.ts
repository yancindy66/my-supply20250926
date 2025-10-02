export type MenuLeaf = { title: string; link: string };
export type MenuItem = { title: string; link: string; children?: MenuLeaf[] };
export type RoleKey = 'operation' | 'inventory' | 'warehouse' | 'financial' | 'guarantee';

// 直接内置菜单（由文档转换而来，避免运行时 JSON 导入导致 500）
const MENUS: Record<RoleKey, MenuItem[]> = {
  // 平台运营（platform）
  operation: [
    { title: '会员管理', link: '/member/manage', children: [
      { title: '存货人管理', link: '/member/depositor-list' },
      { title: '监管仓库管理', link: '/member/supervising-warehouse-list' },
      { title: '质检机构管理', link: '/member/qc-org-list' },
      { title: '担保机构管理', link: '/member/guarantee-org-list' },
      { title: '金融机构管理', link: '/member/financial-org-list' }
    ] },
    { title: '商品管理', link: '/commodity/manage', children: [ { title: '商品列表', link: '/commodity/list' } ] },
    { title: '仓库管理', link: '/warehouse/manage', children: [
      { title: '仓库信息列表', link: '/warehouse/list' },
      { title: '仓库信息查看', link: '/warehouse/detail/:id' },
      { title: '仓库信息审核', link: '/warehouse/review/:id' }
    ] },
    { title: '入库管理', link: '/inbound/manage', children: [
      { title: '入库申请列表', link: '/inbound/list' },
      { title: '入库信息查看', link: '/inbound/detail/:id' },
      { title: '入库信息审核', link: '/inbound/review/:id' }
    ] },
    { title: '出库管理', link: '/outbound/manage', children: [
      { title: '出库申请列表', link: '/outbound/list' },
      { title: '出库信息列表', link: '/outbound/info-list' }
    ] },
    { title: '仓单管理', link: '/warehouse-receipt/manage', children: [
      { title: '仓单列表', link: '/warehouse-receipt/list' },
      { title: '仓单预警列表', link: '/warehouse-receipt/alert-list' }
    ] },
    { title: '移库管理', link: '/transfer/manage', children: [
      { title: '移库记录列表', link: '/transfer/record-list' },
      { title: '移库预警记录列表', link: '/transfer/alert-list' }
    ] },
    { title: '仓单融资管理', link: '/financing/manage', children: [
      { title: '融资风险参数设置', link: '/financing/risk-param-config' },
      { title: '融资申请列表', link: '/financing/application-list' },
      { title: '融资风险列表', link: '/financing/risk-list' },
      { title: '融资信息列表', link: '/financing/info-list' }
    ] },
    { title: '仓单过户管理', link: '/transfer-ownership/manage', children: [
      { title: '过户申请列表', link: '/transfer-ownership/list' },
      { title: '过户信息查看', link: '/transfer-ownership/detail/:id' }
    ] },
    { title: '仓单续期管理', link: '/renewal/manage', children: [
      { title: '续期信息列表', link: '/renewal/list' },
      { title: '续期信息查看', link: '/renewal/detail/:id' }
    ] },
    { title: '费用管理', link: '/fee/manage', children: [
      { title: '费用参数管理', link: '/fee/param-config' },
      { title: '预缴费用列表', link: '/fee/prepaid-list' },
      { title: '应缴费用列表', link: '/fee/payable-list' },
      { title: '违约费用列表', link: '/fee/penalty-list' },
      { title: '费用合计报表', link: '/fee/report' }
    ] },
    { title: '仓单交易管理', link: '/trading/manage', children: [ { title: '仓单交易申请列表', link: '/trading/list' } ] },
    { title: '司法协助', link: '/judicial/manage', children: [
      { title: '司法登记列表', link: '/judicial/registration-list' },
      { title: '司法处置列表', link: '/judicial/disposal-list' }
    ] },
    { title: '资料管理', link: '/archive/manage', children: [
      { title: '资料维护', link: '/archive/maintenance' },
      { title: '资料定义管理', link: '/archive/definition' }
    ] },
    { title: '短信管理', link: '/sms/manage', children: [
      { title: '短信模板', link: '/sms/template' },
      { title: '短信记录', link: '/sms/record' }
    ] },
    { title: '用户权限管理系统', link: '/system/user', children: [
      { title: '用户设置', link: '/system/user/list' },
      { title: '角色设置', link: '/system/role/list' },
      { title: '岗位设置', link: '/system/post/list' },
      { title: '组织机构设置', link: '/system/dept/list' },
      { title: '在线用户设置', link: '/system/online/list' }
    ] },
    { title: '日志管理', link: '/log/manage', children: [
      { title: '业务操作日志', link: '/log/business' },
      { title: '登录日志', link: '/log/login' }
    ] },
    { title: '公告管理', link: '/announcement/manage', children: [ { title: '公告列表', link: '/announcement/list' } ] }
  ],

  // 存货人（depositor）
  inventory: [
    { title: '入库管理', link: '/inbound/order/list', children: [
      { title: '入库预约列表', link: '/inbound/order/list' }
    ] },
    { title: '仓单管理', link: '/warehouse-receipt/list', children: [
      { title: '仓单列表', link: '/warehouse-receipt/list' },
      { title: '出库申请', link: '/warehouse-receipt/outbound-apply' }
    ] },
    { title: '出库管理', link: '/outbound/list', children: [ { title: '出库申请列表', link: '/outbound/list' } ] },
    { title: '移库管理', link: '/transfer/apply', children: [
      { title: '移库申请', link: '/transfer/apply' },
      { title: '移库申请列表', link: '/transfer/list' }
    ] },
    { title: '融资管理', link: '/financing/apply', children: [
      { title: '融资申请', link: '/financing/apply' },
      { title: '融资申请列表', link: '/financing/list' },
      { title: '融资风险列表', link: '/financing/risk' }
    ] },
    { title: '仓单过户', link: '/transfer-ownership/apply', children: [
      { title: '过户申请', link: '/transfer-ownership/apply' },
      { title: '过户申请列表', link: '/transfer-ownership/list' }
    ] },
    { title: '仓单续期', link: '/renewal/apply', children: [
      { title: '续期申请', link: '/renewal/apply' },
      { title: '续期申请列表', link: '/renewal/list' }
    ] },
    { title: '仓单交易', link: '/trading/apply', children: [
      { title: '仓单交易申请', link: '/trading/apply' },
      { title: '仓单交易申请列表', link: '/trading/list' }
    ] },
    { title: '费用管理', link: '/fee/payable', children: [
      { title: '应缴费用列表', link: '/fee/payable' },
      { title: '退费列表', link: '/fee/refund' },
      { title: '费用合计报表', link: '/fee/report' }
    ] },
    { title: '公告管理', link: '/announcement/list', children: [ { title: '公告列表', link: '/announcement/list' } ] },
    { title: '人员功能', link: '/warehouse/manage', children: [
      { title: '仓库管理', link: '/warehouse/manage' },
      { title: '仓库列表', link: '/warehouse/list' },
      { title: '添加仓库', link: '/warehouse/add' }
    ] }
  ],

  // 仓储机构
  warehouse: [
    { title: '仓库管理', link: '/warehouse/manage', children: [
      { title: '仓库列表', link: '/warehouse/list' },
      { title: '添加仓库', link: '/warehouse/add' },
      { title: '编辑仓库', link: '/warehouse/edit/:id' }
    ] },
    { title: '入库管理', link: '/inbound/manage', children: [
      { title: '门岗核验', link: '/inbound/gate/verify' },
      { title: '入库单列表（办公室）', link: '/inbound/order/office-list' },
      { title: '入库单列表', link: '/inbound/list' }
      // 详情/审核/确认/开始/完成等动作页从列表进入
    ] },
    { title: '仓单管理', link: '/warehouse-receipt/manage', children: [
      { title: '仓单列表', link: '/warehouse-receipt/list' },
      { title: '仓单信息查看', link: '/warehouse-receipt/detail/:id' },
      { title: '仓单验真', link: '/warehouse-receipt/verify' },
      { title: '修改质检信息', link: '/warehouse-receipt/update-quality/:id' }
    ] },
    { title: '出库管理', link: '/outbound/manage', children: [
      { title: '出库申请列表', link: '/outbound/list' },
      { title: '出库信息查询', link: '/outbound/query' }
      // 详情/审核/确认/完成由列表进入
    ] },
    { title: '移库管理', link: '/transfer/manage', children: [
      { title: '移库申请列表', link: '/transfer/list' },
      { title: '移库信息查看', link: '/transfer/detail/:id' },
      { title: '移库信息审核', link: '/transfer/review/:id' }
    ] },
    { title: '融资管理', link: '/financing/manage', children: [
      { title: '融资申请列表', link: '/financing/application-list' },
      { title: '融资信息列表', link: '/financing/info-list' },
      { title: '融资信息查看', link: '/financing/detail/:id' },
      { title: '融资信息审核', link: '/financing/review/:id' },
      { title: '还款/部分还款', link: '/financing/repayment/:id' }
    ] },
    { title: '仓单续期', link: '/renewal/manage', children: [
      { title: '续期申请列表', link: '/renewal/list' },
      { title: '续期信息查看', link: '/renewal/detail/:id' },
      { title: '续期信息审核', link: '/renewal/review/:id' }
    ] },
    { title: '仓单过户', link: '/transfer-ownership/manage', children: [
      { title: '过户申请列表', link: '/transfer-ownership/list' },
      { title: '过户申请审核', link: '/transfer-ownership/review/:id' }
    ] },
    { title: '巡检管理', link: '/inspection/tasks', children: [
      { title: '巡检任务', link: '/inspection/tasks' },
      { title: '待处理任务', link: '/inspection/tasks/pending' },
      { title: '巡检记录', link: '/inspection/records' }
      // 审核：/inspection/review/:id
    ] },
    { title: '液位仪管理', link: '/tanks/monitor', children: [
      { title: '液位监控', link: '/tanks/monitor' }
      // 历史/快照/当前数据为详情动作页
    ] },
    { title: '磅重管理', link: '/weight/measurements', children: [
      { title: '称重记录', link: '/weight/measurements' },
      { title: '毛重录入', link: '/weight/gross' },
      { title: '皮重录入', link: '/weight/tare' }
    ] },
    { title: '证据管理', link: '/evidence/requirements', children: [
      { title: '取证要求', link: '/evidence/requirements' },
      { title: '资料上传', link: '/evidence/upload' },
      { title: '取证审核', link: '/evidence/audit' }
    ] },
    { title: '费用管理', link: '/fee/manage', children: [ { title: '费用合计报表', link: '/fee/report' } ] },
    { title: '公告管理', link: '/announcement/manage', children: [ { title: '公告列表', link: '/announcement/list' } ] }
  ],

  // 金融机构
  financial: [
    { title: '融资管理', link: '/financing/manage', children: [
      { title: '融资申请列表', link: '/financing/application-list' },
      { title: '融资信息查看', link: '/financing/detail/:id' },
      { title: '融资信息审核', link: '/financing/review/:id' },
      { title: '还款/部分还款', link: '/financing/repayment/:id' }
    ] },
    { title: '融资风控', link: '/risk-control/dashboard', children: [
      { title: '融资风险列表', link: '/risk-control/risk-list' },
      { title: '风险处置列表', link: '/risk-control/disposal-list' },
      { title: '风险处理', link: '/risk-control/handle/:id' }
    ] },
    { title: '规则与参数', link: '/rules/config', children: [
      { title: '融资规则设置', link: '/rules/financing-rules' },
      { title: '参数管理', link: '/rules/param-list' },
      { title: '增加参数', link: '/rules/param-add' },
      { title: '修改参数', link: '/rules/param-edit/:id' }
    ] },
    { title: '公告管理', link: '/announcement/manage', children: [ { title: '公告列表', link: '/announcement/list' } ] }
  ],

  // 担保机构（按新结构）
  guarantee: [
    { title: '担保工作台', link: '/guarantee/dashboard', children: [ { title: '业务总览', link: '/guarantee/dashboard' } ] },
    { title: '担保产品管理', link: '/guarantee/products', children: [
      { title: '产品列表', link: '/guarantee/products' },
      { title: '产品创建', link: '/guarantee/products/create' },
      { title: '产品审批', link: '/guarantee/products/approval' }
    ] },
    { title: '担保申请审批', link: '/guarantee/applications', children: [
      { title: '申请列表', link: '/guarantee/applications' },
      { title: '待审批申请', link: '/guarantee/applications/pending' }
    ] },
    { title: '在保项目管理', link: '/guarantee/projects/active', children: [
      { title: '在保项目列表', link: '/guarantee/projects/active' },
      { title: '风险预警列表', link: '/guarantee/projects/warning' },
      { title: '已结清项目', link: '/guarantee/projects/completed' }
    ] },
    { title: '代偿追偿管理', link: '/guarantee/compensations', children: [
      { title: '代偿记录列表', link: '/guarantee/compensations' },
      { title: '追偿管理', link: '/guarantee/compensations/recovery' }
    ] },
    { title: '风险管理', link: '/risk/dashboard', children: [
      { title: '风险总览', link: '/risk/dashboard' },
      { title: '风险准备金', link: '/risk/reserve-funds' },
      { title: '预警规则', link: '/risk/warning-rules' },
      { title: '压力测试', link: '/risk/stress-test' }
    ] },
    { title: '统计分析', link: '/analysis/business-scale', children: [
      { title: '业务规模分析', link: '/analysis/business-scale' },
      { title: '代偿率分析', link: '/analysis/compensation-rate' },
      { title: '客户集中度分析', link: '/analysis/customer-concentration' }
    ] }
  ]
};

export function getMenusByRole(role: string | null | undefined): MenuItem[] {
  const r = (role || 'operation') as RoleKey;
  return MENUS[r] || MENUS.operation;
}
