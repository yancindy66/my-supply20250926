// ...existing code...
import { createRouter, createWebHistory } from 'vue-router';
import Login from './views/Login.vue';
const Register = () => import('./views/Register.vue');
import Welcome from './views/Welcome.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/welcome', component: Welcome },
  { path: '/register', component: Register },
  // 实验：Excel 实验页（隐藏XLSX导入，后续接 SheetJS）
  { path: '/lab/excel', component: () => import('./views/lab/ExcelLab.vue') },
  // 实验：真·Excel（Luckysheet）
  { path: '/lab/sheet', component: () => import('./views/lab/SheetLab.vue') },
  { path: '/products', component: () => import('./views/Products.vue') },
  {
    path: '/',
    component: () => import('./layout/MinimalLayout.vue'),
    children: [
      { path: 'dashboard', component: () => import('./views/Dashboard.vue') },
      { path: 'inventory', component: () => import('./views/商品管理/ProductBase.vue'), meta: { roles: ['inventory','operation'] } },
      // 兼容旧会员路径
      { path: 'member', children: [
        { path: 'inventory/list', component: () => import('./views/member/inventory/list.vue') },
      ]},

      // 占位：角色菜单 JSON 中的常见路由，先挂载占位页，后续替换为真页面
      ...[
        'inbound/apply','inbound/list','warehouse-receipt/list','warehouse-receipt/outbound-apply',
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
        'judicial/manage','judicial/registration-list','judicial/disposal-list','archive/manage','archive/maintenance','archive/definition','sms/manage','sms/template','sms/record'
      ].map(p => ({ path: p, component: () => import('./views/placeholder/BasicStub.vue'), meta: { title: p } }))
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

function roleHome(role: string): string {
  switch (role) {
    case 'operation':
      return '/dashboard';
    case 'inventory':
      return '/member/inventory/list';
    case 'warehouse':
      return '/member/warehouse/list';
    case 'financial':
      return '/member/financial/list';
    case 'guarantee':
      return '/member/guarantee/list';
    default:
      return '/dashboard';
  }
}

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('role');

  const publicPaths = ['/login', '/role-select', '/lab/excel', '/register'];
  if (to.path === '/login' && token && role) return next(roleHome(role));
  if (publicPaths.includes(to.path)) return next();

  if (!role) return next('/login');
  if (!token) return next('/login');

  return next();
});

export default router;
