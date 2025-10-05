export interface MenuItem {
  title: string;
  link?: string;
  children?: MenuItem[];
  open?: boolean;
}

function baseOperationMenus(): MenuItem[] {
  return [
    { title: '工作台', link: '/dashboard' },
    {
      title: '会员管理',
      open: true,
      children: [
        { title: '会员管理', link: '/member/manage' },
        { title: '存货人管理', link: '/member/depositor-list' },
        { title: '监管仓库管理', link: '/member/supervising-warehouse-list' },
        { title: '质检机构管理', link: '/member/qc-org-list' },
        { title: '担保机构管理', link: '/member/guarantee-org-list' },
        { title: '金融机构管理', link: '/member/financial-org-list' },
      ]
    },
    {
      title: '商品管理',
      children: [
        { title: '商品列表', link: '/commodity/list' },
      ]
    },
    {
      title: '仓库管理',
      children: [
        { title: '仓库信息列表', link: '/warehouse/list' },
      ]
    },
    {
      title: '入库管理',
      children: [
        { title: '入库申请列表', link: '/inbound/list' },
        { title: '入库信息查看', link: '/inbound/detail/demo' },
        { title: '入库信息审核', link: '/inbound/review/demo' },
      ]
    },
    {
      title: '出库管理',
      children: [
        { title: '出库申请列表', link: '/outbound/list' },
        { title: '出库信息列表', link: '/outbound/info-list' },
      ]
    },
    {
      title: '仓单管理',
      children: [
        { title: '仓单列表', link: '/warehouse-receipt/list' },
        { title: '仓单预警列表', link: '/warehouse-receipt/alert-list' },
      ]
    },
    {
      title: '仓单融资',
      children: [
        { title: '融资申请列表', link: '/financing/application-list' },
        { title: '融资风险列表', link: '/financing/risk-list' },
        { title: '融资信息列表', link: '/financing/info-list' },
        { title: '融资风险参数设置', link: '/financing/risk-param-config' },
      ]
    },
    {
      title: '移库管理',
      children: [
        { title: '移库记录列表', link: '/transfer/record-list' },
        { title: '移库预警记录列表', link: '/transfer/alert-list' },
      ]
    },
    {
      title: '资料管理',
      children: [
        { title: '资料维护', link: '/archive/maintenance' },
        { title: '资料定义管理', link: '/archive/definition' },
      ]
    },
    {
      title: '日志管理',
      children: [
        { title: '业务操作日志', link: '/log/business' },
        { title: '登录日志', link: '/log/login' },
      ]
    },
    {
      title: '短信管理',
      children: [
        { title: '短信模板', link: '/sms/template' },
        { title: '短信记录', link: '/sms/record' },
      ]
    },
    {
      title: '系统设置',
      children: [
        { title: '用户设置', link: '/system/user/list' },
      ]
    },
    {
      title: '仓单交易',
      children: [
        { title: '交易申请列表', link: '/trading/list' },
      ]
    },
  ];
}

function warehouseMenus(): MenuItem[] {
  return [
    { title: '工作台', link: '/dashboard' },
    {
      title: '入库管理（仓库）',
      open: true,
      children: [
        { title: '门岗核验', link: '/inbound/gate/verify' },
        { title: '车辆入库（修正）', link: '/inbound/order/office-list' },
        { title: '入库单列表', link: '/warehouse/inbound/order/list' },
      ]
    },
    {
      title: '出库管理（仓库）',
      children: [
        { title: '出库申请列表', link: '/outbound/list' },
        { title: '出库信息列表', link: '/outbound/info-list' },
      ]
    },
    {
      title: '仓单管理',
      children: [
        { title: '仓单列表', link: '/warehouse-receipt/list' },
        { title: '仓单预警列表', link: '/warehouse-receipt/alert-list' },
        { title: '仓单核验', link: '/warehouse-receipt/verify' },
      ]
    },
    {
      title: '移库管理（仓库）',
      children: [
        { title: '移库申请', link: '/transfer/apply' },
        { title: '移库列表', link: '/transfer/list' },
        { title: '移库记录列表', link: '/transfer/record-list' },
        { title: '移库预警记录', link: '/transfer/alert-list' },
      ]
    },
    {
      title: '续期管理（仓库）',
      children: [
        { title: '续期列表', link: '/renewal/list' },
      ]
    },
    {
      title: '仓库管理（仓库）',
      children: [
        { title: '仓库管理', link: '/warehouse/manage' },
        { title: '仓库列表', link: '/warehouse/list' },
        { title: '新增仓库', link: '/warehouse/add' },
      ]
    },
  ];
}

function inventoryMenus(): MenuItem[] {
  return [
    { title: '工作台', link: '/dashboard' },
    {
      title: '入库管理（存货人）',
      open: true,
      children: [
        { title: '入库预约', link: '/inbound/order/apply' },
        { title: '入库单列表', link: '/inbound/order/list' },
        { title: '车辆入库（预约表）', link: '/inventory/vehicle-inbound' },
      ]
    },
    {
      title: '出库管理（存货人）',
      children: [
        { title: '出库预约', link: '/outbound/apply' },
        { title: '出库申请列表', link: '/outbound/list' },
      ]
    },
    {
      title: '仓单管理',
      children: [
        { title: '仓单列表', link: '/warehouse-receipt/list' },
      ]
    },
    {
      title: '移库管理（存货人）',
      children: [
        { title: '移库申请', link: '/transfer/apply' },
        { title: '移库列表', link: '/transfer/list' },
      ]
    },
    {
      title: '融资管理（存货人）',
      children: [
        { title: '融资申请', link: '/financing/apply' },
        { title: '融资记录', link: '/financing/list' },
        { title: '融资风险', link: '/financing/risk' },
      ]
    },
    {
      title: '交易管理（存货人）',
      children: [
        { title: '交易申请', link: '/trading/apply' },
        { title: '交易列表', link: '/trading/list' },
      ]
    },
    {
      title: '过户管理（存货人）',
      children: [
        { title: '过户申请', link: '/transfer-ownership/apply' },
        { title: '过户列表', link: '/transfer-ownership/list' },
      ]
    },
    {
      title: '续期管理（存货人）',
      children: [
        { title: '续期申请', link: '/renewal/apply' },
        { title: '续期列表', link: '/renewal/list' },
      ]
    },
    {
      title: '费用与公告',
      children: [
        { title: '应缴费用', link: '/fee/payable' },
        { title: '费用退款', link: '/fee/refund' },
        { title: '费用报表', link: '/fee/report' },
        { title: '公告列表', link: '/announcement/list' },
      ]
    },
  ];
}

function financialMenus(): MenuItem[] {
  return [
    { title: '工作台', link: '/risk-control/dashboard' },
    {
      title: '融资管理',
      open: true,
      children: [
        { title: '融资申请列表', link: '/financing/application-list' },
        { title: '融资风险列表', link: '/financing/risk-list' },
        { title: '融资信息列表', link: '/financing/info-list' },
      ]
    },
    {
      title: '规则配置',
      children: [
        { title: '融资规则设置', link: '/rules/financing-rules' },
        { title: '规则配置', link: '/rules/config' },
      ]
    },
    {
      title: '仓单管理',
      children: [
        { title: '仓单列表', link: '/warehouse-receipt/list' },
      ]
    },
  ];
}

function guaranteeMenus(): MenuItem[] {
  return [
    { title: '担保工作台', link: '/guarantee/dashboard' },
    {
      title: '产品与申请',
      open: true,
      children: [
        { title: '产品列表', link: '/guarantee/products' },
        { title: '产品创建', link: '/guarantee/products/create' },
        { title: '产品审批', link: '/guarantee/products/approval' },
        { title: '担保申请', link: '/guarantee/applications' },
        { title: '待处理申请', link: '/guarantee/applications/pending' },
      ]
    },
    {
      title: '项目与代偿',
      children: [
        { title: '进行中项目', link: '/guarantee/projects/active' },
        { title: '预警项目', link: '/guarantee/projects/warning' },
        { title: '已完成项目', link: '/guarantee/projects/completed' },
        { title: '代偿记录', link: '/guarantee/compensations' },
        { title: '代偿追偿', link: '/guarantee/compensations/recovery' },
      ]
    },
    {
      title: '风险与分析',
      children: [
        { title: '风险看板', link: '/risk/dashboard' },
        { title: '风险准备金', link: '/risk/reserve-funds' },
        { title: '预警规则', link: '/risk/warning-rules' },
        { title: '压力测试', link: '/risk/stress-test' },
        { title: '业务规模分析', link: '/analysis/business-scale' },
        { title: '代偿率分析', link: '/analysis/compensation-rate' },
        { title: '客户集中度', link: '/analysis/customer-concentration' },
      ]
    },
  ];
}

function regulatorMenus(): MenuItem[] {
  return [
    { title: '监管总览', link: '/monitor/overview' }
  ];
}

export function getMenusByRole(role: string): MenuItem[] {
  switch (role) {
    case 'warehouse':
      return warehouseMenus();
    case 'inventory':
      return inventoryMenus();
    case 'financial':
      return financialMenus();
    case 'guarantee':
      return guaranteeMenus();
    case 'regulator':
      return regulatorMenus();
    case 'operation':
    default:
      return baseOperationMenus();
  }
}


