<template>
  <div class="layout-root cyber-bg">
    <header class="topbar">
      <div class="topbar-inner">
        <div class="brand-inline">
          <img class="brand-logo" :src="brandLogo" alt="logo" @error="onLogoError" />
          <span class="brand-text">{{ brandName }}</span>
        </div>
        <nav class="top-nav">
          <ul>
            <li v-for="item in topNav" :key="item.link" :class="{ active: navActive(item.link) }" @click="navGo(item.link)">{{ item.title }}</li>
          </ul>
        </nav>
      </div>
    </header>
    <div class="layout-body">
      <aside class="sidebar cyber-sidebar">
        <!-- 顶部品牌已移至导航栏，这里不再显示 LOGO -->
        <ul class="menus">
          <li v-for="(menu, idx) in menus" :key="menu.link"
              class="menu-item"
              @click="onMenuClick(menu, idx)"
              :class="{ active: isActive(menu.link), open: isOpen(idx), 'parent-active': hasActiveChild(menu) }">
            <span class="chev" aria-hidden="true"></span>
            <span class="title">{{ menu.title }}</span>
            <!-- 折叠手风琴：常规子菜单常驻，使用 CSS 过渡（仅当有 children 时渲染） -->
            <ul v-if="menu.children" class="submenu">
              <li v-for="sub in menu.children" :key="sub.link"
                  @click.stop="go(sub.link)"
                  :class="{ active: isActive(sub.link) }">{{ sub.title }}</li>
            </ul>
          </li>
        </ul>
      </aside>
      <main class="main-content cyber-content">
        <router-view />
      </main>
      <footer class="app-footer">
        <button class="logout" @click="doLogout">退出登录</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
// 极简基线：移除侧栏折叠与悬停飞出逻辑
const openMenuIdx = ref<number|null>(null);
const role = localStorage.getItem('role') || 'operation';
const brandName = ref('');
function updateBrand(){
  const r = localStorage.getItem('role') || 'operation';
  brandName.value = r === 'inventory' ? '存货人管理平台'
    : r === 'warehouse' ? '仓储机构管理平台'
    : r === 'financial' ? '金融机构管理平台'
    : r === 'guarantee' ? '担保机构管理平台'
    : '平台运营管理平台';
}
updateBrand();
window.addEventListener('storage', (e) => { if(e.key==='role') updateBrand(); });
const brandLogo = ref('/logo-zhengshang.png');
function onLogoError(){
  if(brandLogo.value !== '/vite.svg') brandLogo.value = '/vite.svg';
}
const topNav = [
  { title: '看板 | Dashboard', link: '/role-dashboard' },
  { title: '会员', link: '/member/inventory-owner' },
  { title: '商品', link: '/inventory' },
  { title: '仓库', link: '/operation/warehouse/list' },
  { title: 'API', link: '/products' }
] as const;

function roleDashboardPath(r: string): string {
  return r === 'inventory' ? '/inventory/dashboard'
    : r === 'warehouse' ? '/warehouse/dashboard'
    : r === 'financial' ? '/financial/dashboard'
    : r === 'guarantee' ? '/guarrentee/dashboard'
    : '/operation/dashboard';
}
const allMenus = [
  // 汇总看板仅平台运营可见
  { title: '汇总看板 | Dashboard', icon: '📊', link: '/operation/dashboard', roles: ['operation'], children: [ { title: '首页 | Home', link: '/operation/dashboard' } ] },
  { title: '平台运营 · 会员管理 | Operation · Members', icon: '👥', link: '/member', roles: ['operation'], children: [
    { title: '存货人管理', link: '/member/depositor-list' },
    { title: '金融机构管理', link: '/member/financial-org-list' },
    { title: '担保机构管理', link: '/member/guarantee-org-list' },
    { title: '质检机构管理', link: '/member/qc-org-list' },
    { title: '监管仓库管理', link: '/member/supervising-warehouse-list' }
  ] },
  { title: '商品管理', icon: '📦', link: '/inventory', roles: ['inventory','operation'], children: [
    { title: '商品列表', link: '/inventory' }
  ] },
  { title: '产品（API）', icon: '🧩', link: '/products', roles: ['inventory','operation'], children: [
    { title: '产品列表（后端）', link: '/products' }
  ] },
  { title: '仓库管理', icon: '🏬', link: '/operation/warehouse/list', roles: ['operation'], children: [
    { title: '仓库列表', link: '/operation/warehouse/list' }
  ] },
  // 业务模块（按角色显示）
  { title: '入库管理', icon: '📥', link: '/biz/inbound', roles: ['inventory','warehouse','operation'], children: [
    { title: '入库预约', link: '/inbound/apply' },
    { title: '入库单列表', link: '/inbound/order/list' }
  ] },
  { title: '出库管理', link: '/biz/outbound', roles: ['inventory','warehouse','operation'] },
  { title: '仓单管理', link: '/biz/warrant', roles: ['inventory','warehouse','operation'] },
  { title: '移库管理', link: '/biz/relocate', roles: ['inventory','warehouse','operation'] },
  { title: '融资管理', link: '/biz/finance', roles: ['inventory','operation'] },
  // 担保机构端
  { title: '担保机构端 | Guarrantee', icon: '🛡️', link: '/guarrentee', roles: ['guarantee'], children: [
    { title: '看板 | Dashboard', link: '/guarrentee/dashboard' },
    { title: '融资申请（信息列表） | Financing Applications (List)', link: '/guarrentee/financing/application/list' },
    { title: '融资风险（信息列表） | Financing Risks (List)', link: '/guarrentee/financing/risk/list' },
    { title: '公告信息列表 | Announcements', link: '/guarrantee/announcement/list' }
  ] },
  // 金融机构端
  { title: '金融机构端 | Financial', icon: '🏦', link: '/financial', roles: ['financial'], children: [
    { title: '看板 | Dashboard', link: '/financial/dashboard' },
    { title: '融资申请（信息列表） | Financing Applications (List)', link: '/financial/financing/application/list' },
    { title: '融资信息列表 | Financing Info (List)', link: '/financial/financing/info/list' },
    { title: '融资风险（信息列表） | Financing Risks (List)', link: '/financial/financing/risk/list' },
    { title: '融资规则设置 | Financing Rules', link: '/financial/financing/rules' },
    { title: '公告信息列表 | Announcements', link: '/financial/announcement/list' }
  ] },
  { title: '仓单过户', link: '/biz/transfer', roles: ['inventory','warehouse','operation'] },
  { title: '仓单续期', link: '/biz/renew', roles: ['inventory','warehouse','operation'] },
  { title: '仓单交易', link: '/biz/trade', roles: ['inventory','operation'] },
  { title: '费用管理', link: '/biz/fee', roles: ['inventory','operation'] },
  { title: '公告管理', link: '/biz/notice', roles: ['inventory','warehouse','financial','guarantee','operation'] },
  { title: '日志管理', link: '/biz/log', roles: ['warehouse','operation'] },
  { title: '司法协助', link: '/biz/judicial', roles: ['operation'] },
  { title: '资料管理', link: '/biz/document', roles: ['inventory','warehouse','financial','guarrantee','operation'] },
  { title: '短信管理', link: '/biz/sms', roles: ['inventory','warehouse','financial','guarrantee','operation'] },
  { title: '用户权限管理', icon: '🔑', link: '/role-select', children: [
    { title: '权限配置', link: '/role-select' }
  ] }
] as any[];
// 过滤分组和子项：仅保留当前角色可见项
const menus = allMenus
  .filter(m => !m.roles || m.roles.includes(role))
  .map(m => {
    if (m.children && Array.isArray(m.children)) {
      const children = m.children.filter((s: any) => !s.roles || s.roles.includes(role));
      return { ...m, children };
    }
    return m;
  })
  .filter(m => !m.children || (m.children && m.children.length > 0));
function go(link: string) {
  router.push(link);
}
function onMenuClick(menu: any, idx: number) {
  if (menu?.children && menu.children.length) {
    openMenuIdx.value = openMenuIdx.value === idx ? null : idx;
    return;
  }
  go(menu.link);
}
function isActive(link: string) {
  const cur = router.currentRoute.value.path || '';
  return cur === link || cur.startsWith(link + '/');
}
function hasActiveChild(menu: any) {
  if (!menu?.children) return false;
  return menu.children.some((s: any) => isActive(s.link));
}
function isOpen(idx: number) {
  // 默认展开标记或当前点击展开
  return Boolean((menus[idx] as any)?.open) || openMenuIdx.value === idx;
}
function doLogout(){
  try{ localStorage.removeItem('authToken'); }catch{}
  router.push('/login');
}
const navGo = (link: string) => {
  if (link === '/role-dashboard') {
    const r = localStorage.getItem('role') || role;
    router.push(roleDashboardPath(r));
    return;
  }
  router.push(link);
};
const navActive = (link: string) => {
  const cur = router.currentRoute.value.path || '';
  if (link === '/role-dashboard') return /\/dashboard$/.test(cur);
  return cur === link || cur.startsWith(link + '/');
};
// 保留占位：后续可接入真实登出逻辑
onMounted(() => {
  // 手动折叠/展开：不再监听滚动自动折叠
  const cur = router.currentRoute.value.path || '';
  const found = menus.findIndex((m: any) => m.link === cur || (m.children && m.children.some((s: any) => cur.startsWith(s.link))));
  if (found >= 0) openMenuIdx.value = found;
});

// 路由变化时保持父分组展开
watch(() => router.currentRoute.value.path, (p) => {
  const cur = p || '';
  const found = menus.findIndex((m: any) => m.link === cur || (m.children && m.children.some((s: any) => cur.startsWith(s.link))));
  if (found >= 0) openMenuIdx.value = found;
});
</script>

<style scoped>
/* 赛博蓝色背景 */
.cyber-bg {
  min-height: 100vh;
  background: var(--app-bg-gradient, #fff);
  display: flex;
  flex-direction: column;
}
/* 顶部导航（功能切换） */
.topbar { position: sticky; top: 0; z-index: 120; border-bottom: 1px solid rgba(2,6,23,0.06); background: #ffffff; }
.topbar-inner { height: 44px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; }
.brand-inline { display:flex; align-items:center; gap:8px; }
.brand-inline .brand-logo { height: 18px; width: auto; opacity: .98; }
.brand-inline .brand-text { font-size: 14px; font-weight: 400; color: var(--text); }
.top-nav ul { display: flex; gap: 12px; list-style: none; padding: 0; margin: 0; }
.top-nav li { padding: 6px 10px; font-size: 12px; color: #6b7280; border-radius: 8px; cursor: pointer; }
.top-nav li.active { color: #0f172a; font-weight: 600; background: rgba(2,6,23,0.04); }
.top-title { font-size: 12px; color: #9ca3af; letter-spacing: .08em; }
/* 顶部 LOGO 区 */
/* 侧栏顶部品牌已移除 */
/* 顶部导航横向铺满 */
.cyber-navbar {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  background: linear-gradient(90deg, #0050ff 0%, #00cfff 100%);
  box-shadow: 0 2px 12px rgba(0,80,255,0.12);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}
.logo {
  font-size: 1.6rem;
  font-weight: bold;
  color: #fff;
  letter-spacing: 2px;
  position: relative;
}
.glow-bar {
  background: linear-gradient(90deg, #00cfff 0%, #0050ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: glow 2s infinite linear alternate;
}
@keyframes glow {
  0% { filter: drop-shadow(0 0 6px #00cfff); }
  100% { filter: drop-shadow(0 0 16px #0050ff); }
}
.navbar-right {
  display: flex;
  align-items: center;
  gap: 24px;
}
.logout-btn {
  background: linear-gradient(90deg, #0050ff 0%, #00cfff 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 18px;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,80,255,0.12);
  margin-left: 12px;
  transition: background 0.2s;
}
.logout-btn:hover {
  background: linear-gradient(90deg, #00cfff 0%, #0050ff 100%);
}
.msg-dot {
  width: 10px;
  height: 10px;
  background: #00cfff;
  border-radius: 50%;
  box-shadow: 0 0 8px #00cfff;
  margin-right: 8px;
}
.user {
  color: #fff;
  font-size: 1rem;
}
/* 主体区域：左侧导航+右侧内容 */
.layout-body {
  display: flex;
  flex: 1;
  min-height: calc(100vh - 44px);
  margin-top: 0; /* 无顶部导航，取消上边距 */
}
/* 左侧导航栏固定，毛玻璃+蓝色高光 */
.cyber-sidebar {
  --sidebar-width: 200px;
  width: var(--sidebar-width);
  background: #f6f7fb;
  color: var(--text);
  box-shadow: none;
  border-right: 1px solid rgba(2,6,23,0.06);
  backdrop-filter: none;
  padding-top: 56px; /* 顶部留白，让第一组（如会员管理）不要顶格 */
  transition: width 0.3s cubic-bezier(.4,0,.2,1);
  position: fixed;
  top: 0; /* 无顶部导航，贴顶 */
  left: 0;
  bottom: 0;
  z-index: 99;
  overflow-y: auto;
}
.cyber-sidebar::-webkit-scrollbar-track { background-color: #f6f7fb; }
.cyber-sidebar::-webkit-scrollbar { width: 6px; }
.cyber-sidebar::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.35); border-radius: 4px; }
/* 折叠按钮：1px 细边+悬浮感 */
/* 折叠按钮已移除 */
.menus {
  list-style: none;
  padding: 0;
  margin: 0;
  font-family: var(--app-font);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
.menus > li.menu-item {
  padding: 10px 16px; /* 更靠左，更紧凑 */
  color: #0f172a;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
  font-size: 14px;
  display: block; /* 纵向排列 */
  border-left: 0 !important; /* 彻底去掉左侧边线 */
  background-image: none !important; /* 阻断任何渐变残留 */
}
.menus > li.menu-item .chev {
  display: inline-block;
  width: 10px; height: 10px; margin-right: 8px; vertical-align: -1px;
  background: currentColor; opacity: .55; color: #64748b;
  mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"><path fill="%2364748b" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>') center/contain no-repeat;
}
.sidebar-collapsed .menus { display: none; }
.menus > li.menu-item + li.menu-item { margin-top: 2px; }
.menus > li.menu-item.active {
  background: rgba(2,6,23,0.03); /* 轻微背景，不加粗 */
  color: #0f172a;
  font-weight: 400;
  border-left: 0 !important;
  background-image: none !important;
}
.menus > li.menu-item:hover { background: rgba(2,6,23,0.04); border-left:0 !important; background-image:none !important; }
.menus > li.menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 0; /* 去掉左侧蓝色条 */
  background: transparent;
  opacity: 0;
  transition: none;
}
.menus > li.menu-item:hover::before, .menus > li.menu-item.active::before, .menus > li.menu-item.parent-active::before { opacity: 0; width: 0; }
.menus > li.menu-item.parent-active:not(.active) { background: rgba(2,6,23,0.03); }
/* 统一 hover 颜色，避免产生边框/色带错觉 */
.menus > li.menu-item:hover { background: rgba(2,6,23,0.04); }
/* 去除箭头元素 */
.menus > li.menu-item .title { flex: 1; }
.submenu {
  position: static;
  background: transparent;
  box-shadow: none;
  border-radius: 0;
  min-width: auto;
  padding: 6px 0 0 18px;
  margin: 6px 0 0 0; /* 与一级菜单留出间距 */
  list-style: none; /* 去掉默认圆点 */
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important; /* 去掉二级菜单上的毛玻璃感觉 */
  border: 0 !important; /* 强制无描边 */
  outline: 0 !important; /* 强制无轮廓 */
  background-image: none !important; /* 防止渐变造成框感 */
  font-family: var(--app-font);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  max-height: 0;
  overflow: hidden;
  transition: max-height .25s ease, opacity .25s ease;
  opacity: 0;
}
.submenu > li {
  padding: 8px 24px;
  color: #0f172a;
  cursor: pointer;
  font-size: 13px; /* 二级更轻一点 */
  transition: background 0.2s;
  position: relative;
  border: 0 !important;
  outline: 0 !important;
  background-image: none !important;
  background: transparent !important;
}
.submenu > li.active { font-weight: 400; background: transparent !important; }
.submenu > li:hover { background: transparent !important; }
.menus > li.menu-item, .submenu > li { outline: none; -webkit-tap-highlight-color: transparent; }
.menus > li.menu-item:focus, .menus > li.menu-item:focus-visible,
.submenu > li:focus, .submenu > li:focus-visible { outline: none; box-shadow: none; }
/* 在侧栏内彻底移除焦点描边/黄色框（含浏览器默认 ring） */
.cyber-sidebar *:focus, .cyber-sidebar *:focus-visible { outline: none !important; box-shadow: none !important; }
.cyber-sidebar .submenu li { border: none !important; }
.menu-item.open > .submenu {
  max-height: 600px; /* 合理上限，足够子项展示 */
  opacity: 1;
}

/* 悬停飞出子菜单（在侧栏收起时显示） */
.submenu-flyout {
  position: absolute;
  left: calc(100% + 6px);
  top: 8px;
  min-width: 168px;
  padding: 8px 8px;
  background: #ffffff; /* 纯色，去玻璃感 */
  border: none; /* 去掉描边 */
  border-radius: 10px;
  box-shadow: 0 8px 18px rgba(15,23,42,0.08); /* 更轻的投影 */
  opacity: 0;
  pointer-events: none;
  transform: translateY(4px);
  transition: opacity .18s ease, transform .18s ease;
  z-index: 120;
}
.menu-item:hover > .submenu-flyout { opacity: 1; transform: translateY(0); pointer-events: auto; }
/* 取消圆点标记，更克制的层级表现 */
/* 内容区自适应宽度，网页风格 */
.cyber-content {
  flex: 1;
  min-height: calc(100vh - 44px);
  padding: 20px 24px; /* 控制主内容内边距 16-20px 范围 */
  background: var(--app-content-bg, #fff);
  border-radius: 0;
  box-shadow: none;
  margin: 0;
  width: calc(100% - 200px); /* 避免 100vw 导致出现横向滚动条 */
  margin-left: 200px;
  min-height: 100vh;
  transition: none;
  overflow-x: hidden; /* 防止横向滚动条溢出到侧栏下方 */
  padding-bottom: 56px; /* 为底部工具条预留空间 */
}
.cyber-content:hover { box-shadow: none; }

/* 底部工具条（放置退出登录等） */
.app-footer{ position: fixed; left: 200px; right: 0; bottom: 0; height: 44px; background:#fff; border-top:1px solid rgba(2,6,23,0.06); display:flex; align-items:center; justify-content:flex-end; padding:0 12px; z-index: 120; }
.app-footer .logout{ height:28px; padding:0 12px; border:1px solid rgba(2,6,23,0.12); border-radius:8px; background:#fff; color: var(--text); cursor:pointer; }
</style>

