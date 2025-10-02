// ...existing code...
import { createRouter, createWebHistory } from 'vue-router';
import Login from './views/Login.vue';
const Register = () => import('./views/Register.vue');
import Welcome from './views/Welcome.vue';
const RoleSelect = () => import('./views/RoleSelect.vue');

const routes = [
  { path: '/', redirect: '/role-select' },
  { path: '/login', component: Login },
  { path: '/role-select', component: RoleSelect },
  { path: '/welcome', component: Welcome },
  { path: '/register', component: Register },
  { path: '/lab/excel', component: () => import('./views/lab/ExcelLab.vue') },
  { path: '/lab/sheet', component: () => import('./views/lab/SheetLab.vue') },
  { path: '/products', component: () => import('./views/Products.vue') },
  {
    path: '/',
    component: () => import('./layout/MinimalLayout.vue'),
    children: [
      { path: 'inbound/apply', redirect: '/inbound/order/list' },
      { path: 'dashboard', component: () => import('./views/Dashboard.vue') },
      { path: 'inventory', component: () => import('./views/商品管理/ProductBase.vue'), meta: { roles: ['inventory','operation'] } },
      { path: 'member', children: [ { path: 'inventory/list', component: () => import('./views/member/inventory/list.vue') } ] },

      ...[
        'inbound/apply','warehouse-receipt/list','warehouse-receipt/outbound-apply',
        'outbound/list','transfer/apply','transfer/list','financing/apply','financing/list','financing/risk',
        'transfer-ownership/apply','transfer-ownership/list','renewal/apply','renewal/list','trading/apply','trading/list',
        'fee/payable','fee/refund','fee/report','announcement/list','warehouse/manage','warehouse/list','warehouse/add',
        'inbound/manage','warehouse-receipt/manage','outbound/manage','transfer/manage','financing/manage','renewal/manage',
        'transfer-ownership/manage','fee/manage','announcement/manage','commodity/manage','commodity/list','member/manage',
        'member/depositor-list','member/supervising-warehouse-list','member/qc-org-list','member/guarantee-org-list','member/financial-org-list',
        'risk-control/dashboard','risk-control/risk-list','risk-control/disposal-list','rules/config','rules/financing-rules','rules/param-list','rules/param-add',
        'system/user','system/user/list','system/role/list','system/post/list','system/dept/list','system/online/list',
        'log/manage','log/business','log/login','warehouse-receipt/verify','outbound/query','transfer/record-list','transfer/alert-list',
        'warehouse-receipt/alert-list','financing/risk-param-config','financing/application-list','financing/risk-list','financing/info-list','outbound/info-list',
        'judicial/manage','judicial/registration-list','judicial/disposal-list','archive/manage','archive/maintenance','archive/definition','sms/manage','sms/template','sms/record',
        // 担保机构新增
        'guarantee/dashboard','guarantee/products','guarantee/products/create','guarantee/products/approval','guarantee/applications','guarantee/applications/pending',
        'guarantee/projects/active','guarantee/projects/warning','guarantee/projects/completed','guarantee/compensations','guarantee/compensations/recovery',
        'risk/dashboard','risk/reserve-funds','risk/warning-rules','risk/stress-test','analysis/business-scale','analysis/compensation-rate','analysis/customer-concentration',
        // 仓储机构新增
        'inspection/tasks','inspection/tasks/pending','inspection/records','tanks/monitor','weight/measurements','weight/gross','weight/tare','evidence/requirements','evidence/upload','evidence/audit'
      ].map(p => ({ path: p, component: () => import('./views/placeholder/BasicStub.vue'), meta: { title: p } })),
      { path: 'inbound/apply', component: () => import('./views/placeholder/InboundReservation.vue'), meta: { title: '入库预约' } },
      { path: 'warehouse-receipt/list', component: () => import('./views/placeholder/WarehouseReceiptList.vue'), meta: { title: '仓单列表' } },
      { path: 'pledge/apply', component: () => import('./views/placeholder/PledgeApply.vue'), meta: { title: '质押申请' } },
      { path: 'pledge/list', component: () => import('./views/placeholder/PledgeList.vue'), meta: { title: '质押记录' } },
      { path: 'outbound/apply', component: () => import('./views/placeholder/OutboundReservation.vue'), meta: { title: '出库预约' } },
      { path: 'unfreeze/apply', component: () => import('./views/placeholder/UnfreezeApply.vue'), meta: { title: '解冻申请' } },
      { path: 'unfreeze/review', component: () => import('./views/placeholder/UnfreezeReview.vue'), meta: { title: '解冻审批' } },
      { path: 'inbound/order/list', component: () => import('./views/placeholder/InboundOrderList.vue'), meta: { title: '入库预约列表' } },
      { path: 'inbound/list', redirect: '/inbound/order/list' },
      // { path: 'inbound/office/list', component: () => import('./views/placeholder/GateOffice.vue'), meta: { title: '门岗核验（办公室）', office: true } },
      { path: 'inbound/order/office-list', component: () => import('./views/placeholder/InboundOrderList.vue'), meta: { title: '车辆入库', office: true } },
      { path: 'inbound/gate/verify', component: () => import('./views/placeholder/GateVerify.vue'), meta: { title: '门岗核验' } },
      { path: 'inbound/order/apply', component: () => import('./views/placeholder/InboundOrderApply.vue'), meta: { title: '新建入库预约' } },
      { path: 'inbound/reservation/list', component: () => import('./views/placeholder/InboundOrderList.vue'), meta: { title: '入库预约列表' } },
      { path: 'monitor/overview', component: () => import('./views/placeholder/RegulatorOverview.vue') },

      ...[
        'warehouse/detail/:id','warehouse/review/:id','inbound/review/:id',
        'outbound/detail/:id','outbound/review/:id','transfer/detail/:id','transfer/review/:id','financing/detail/:id','financing/review/:id','financing/repayment/:id',
        'transfer-ownership/detail/:id','transfer-ownership/review/:id','renewal/detail/:id','renewal/review/:id','rules/param-edit/:id','risk-control/handle/:id',
        'guarantee/review/:id','guarantee/compensate/:id','loan/application-list','loan/project-list','warehouse-receipt/update-quality/:id',
        // 担保机构新增的动态路由
        'guarantee/products/edit/:id','guarantee/applications/review/:id','guarantee/projects/monitoring/:id','guarantee/compensations/apply/:id',
        // 仓储机构新增动态
        'inbound/confirm/:id','inbound/start/:id','inbound/complete/:id','outbound/confirm/:id','outbound/complete/:id','tanks/current-data/:id','tanks/snapshot/:id','tanks/history/:id','weight/verify/:id','inspection/review/:id'
      ].map(p => ({ path: p, component: () => import('./views/placeholder/BasicStub.vue'), meta: { title: p } })),
      { path: 'warehouse-receipt/detail/:id', component: () => import('./views/placeholder/WarehouseReceiptDetail.vue'), meta: { title: '仓单详情' } },
      { path: 'inbound/detail/:id', component: () => import('./views/placeholder/InboundOrderDetail.vue'), meta: { title: '入库单详情' } },
      { path: 'inbound/reservation/detail/:id', component: () => import('./views/placeholder/InboundReservationDetail.vue'), meta: { title: '入库预约详情' } }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

function roleHome(role: string): string {
  switch (role) {
    case 'operation': return '/dashboard';
    case 'inventory': return '/inbound/order/list';
    case 'warehouse': return '/warehouse/list';
    case 'financial': return '/financing/list';
    case 'guarantee': return '/guarantee/dashboard';
    case 'regulator': return '/monitor/overview';
    default: return '/dashboard';
  }
}

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');
  const role = localStorage.getItem('role');

  const publicPaths = ['/login', '/role-select', '/lab/excel', '/register'];
  if (to.path === '/login' && token && role) return next(roleHome(role));
  if (publicPaths.includes(to.path)) return next();
  if (!role) return next('/login');
  if (!token) return next('/login');
  return next();
});

export default router;
