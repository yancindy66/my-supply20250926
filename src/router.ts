// ...existing code...
import { createRouter, createWebHistory } from 'vue-router';
import Login from './views/Login.vue';
import Welcome from './views/Welcome.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/welcome', component: Welcome },
  // 实验：Excel 实验页（隐藏XLSX导入，后续接 SheetJS）
  { path: '/lab/excel', component: () => import('./views/lab/ExcelLab.vue') },
  // 实验：真·Excel（Luckysheet）
  { path: '/lab/sheet', component: () => import('./views/lab/SheetLab.vue') },
  { path: '/products', component: () => import('./views/Products.vue') },
  {
    path: '/',
    component: () => import('./layout/Layout.vue'),
    children: [
      // 旧入口：/member 作为分组路由（默认重定向在子路由内处理）
      { path: 'dashboard', component: () => import('./views/Dashboard.vue') },
      // 商品管理
      { path: 'inventory', component: () => import('./views/商品管理/ProductBase.vue'), meta: { roles: ['inventory','operation'] } },
      // 机构/成员模块（恢复旧页面）
      {
        path: 'member/financial',
        children: [
          { path: 'list', component: () => import('./views/member/financial/List.vue') },
          { path: 'create', component: () => import('./views/member/financial/Create.vue') },
          { path: 'edit/:id', component: () => import('./views/member/financial/Edit.vue') },
          { path: 'detail/:id', component: () => import('./views/member/financial/Detail.vue') }
        ]
      },
      {
        path: 'member/guarantee',
        children: [
          { path: 'list', component: () => import('./views/member/guarantee/List.vue') },
          { path: 'create', component: () => import('./views/member/guarantee/Create.vue') },
          { path: 'edit/:id', component: () => import('./views/member/guarantee/Edit.vue') },
          { path: 'detail/:id', component: () => import('./views/member/guarantee/Detail.vue') }
        ]
      },
      {
        path: 'member/quality',
        children: [
          { path: 'list', component: () => import('./views/member/quality/List.vue') },
          { path: 'create', component: () => import('./views/member/quality/Create.vue') },
          { path: 'edit/:id', component: () => import('./views/member/quality/Edit.vue') },
          { path: 'detail/:id', component: () => import('./views/member/quality/Detail.vue') }
        ]
      },
      {
        path: 'member/warehouse',
        children: [
          { path: 'list', component: () => import('./views/member/warehouse/List.vue') },
          { path: 'create', component: () => import('./views/member/warehouse/Create.vue') },
          { path: 'edit/:id', component: () => import('./views/member/warehouse/Edit.vue') },
          { path: 'detail/:id', component: () => import('./views/member/warehouse/Detail.vue') }
        ]
      },
      {
        path: 'member/inventory',
        children: [
          { path: 'list', component: () => import('./views/member/inventory/list.vue') },
          { path: 'add', component: () => import('./views/member/inventory/add.vue') },
          { path: 'edit/:id', component: () => import('./views/member/inventory/edit.vue') },
          { path: 'detail/:id', component: () => import('./views/member/inventory/detail.vue') }
        ]
      },
      // 老的单页存货人入口（兼容）
      { path: 'inventory-owner', component: () => import('./views/member/InventoryOwner.vue') },
      { path: 'inventory-owner/create', component: () => import('./views/member/CreateInventoryOwner.vue') },
      { path: 'inventory-owner/edit/:id', component: () => import('./views/member/InventoryOwnerEdit.vue') },
      { path: 'inventory-owner/detail/:id', component: () => import('./views/member/InventoryOwnerDetail.vue') },
      // 会员管理（恢复旧路径，避免 /member 报 404）
      {
        path: 'member',
        children: [
          { path: '', redirect: 'inventory-owner' },
          { path: 'inventory-owner', component: () => import('./views/member/InventoryOwner.vue') },
          { path: 'inventory-owner/create', component: () => import('./views/member/CreateInventoryOwner.vue') },
          { path: 'inventory-owner/edit/:id', component: () => import('./views/member/InventoryOwnerEdit.vue') },
          { path: 'inventory-owner/detail/:id', component: () => import('./views/member/InventoryOwnerDetail.vue') },
          // 可用的存货人子模块
          { path: 'inventory/list', component: () => import('./views/member/inventory/list.vue') },
          { path: 'inventory/add', component: () => import('./views/member/inventory/add.vue') },
          { path: 'inventory/edit/:id', component: () => import('./views/member/inventory/edit.vue') },
          { path: 'inventory/detail/:id', component: () => import('./views/member/inventory/detail.vue') }
        ]
      },
      // 仓库管理（仅平台运营方）
      {
        path: 'operation/warehouse/list',
        component: () => import('./views/仓库管理/WarehouseList.vue'),
        meta: { roles: ['operation'] }
      },
      {
        path: 'operation/warehouse/detail/:id',
        component: () => import('./views/仓库管理/WarehouseDetail.vue'),
        meta: { roles: ['operation'] }
      },
      {
        path: 'operation/warehouse/review/:id',
        component: () => import('./views/仓库管理/WarehouseReview.vue'),
        meta: { roles: ['operation'] }
      },
      // 其他现有页面（仅保留存在的文件）
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 先检查角色，再检查登录；未选角色先去选择
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('role');

  // 免鉴权白名单
  const publicPaths = ['/login', '/role-select', '/lab/excel'];
  if (publicPaths.includes(to.path)) return next();

  // 未选角色先去选
  if (!role) return next('/role-select');
  // 未登录再去登录
  if (!token) return next('/login');

  // 角色校验
  const needRoles = to.matched.find(r => r.meta && (r.meta as any).roles)?.meta?.roles as string[] | undefined;
  if (needRoles && role && !needRoles.includes(role)) return next('/role-select');

  return next();
});

export default router;
