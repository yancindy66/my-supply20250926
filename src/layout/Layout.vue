<template>
  <div class="layout-root cyber-bg">
    <div class="layout-body">
      <aside class="sidebar cyber-sidebar" :class="{ 'sidebar-collapsed': collapsed }">
        <ul class="menus">
          <li v-for="(menu, idx) in menus" :key="menu.link"
              class="menu-item"
              @mouseenter="hoverMenu = idx" @mouseleave="hoverMenu = null"
              @click="onMenuClick(menu, idx)"
              :class="{ active: isActive(menu.link), open: isOpen(idx) }">
            <span class="caret" v-if="menu.children" :class="{ open: isOpen(idx) }">▶</span>
            <span class="title">{{ menu.title }}</span>
            <ul v-if="menu.children && isOpen(idx)" class="submenu">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const collapsed = ref(false);
const hoverMenu = ref<number|null>(null);
const openMenuIdx = ref<number|null>(null);
const role = localStorage.getItem('role') || 'operation';
const allMenus = [
  // 汇总看板仅平台运营可见
  { title: '汇总看板', icon: '📊', link: '/dashboard', roles: ['operation'], children: [ { title: '首页', link: '/dashboard' } ] },
  { title: '会员管理', icon: '👥', link: '/member', roles: ['inventory','operation'], open: true, children: [
    { title: '存货人管理', link: '/member/inventory-owner' },
    { title: '金融机构', link: '/member/financial/list' },
    { title: '担保机构', link: '/member/guarantee/list' },
    { title: '质检机构', link: '/member/quality/list' },
    { title: '监管仓库', link: '/member/warehouse/list' }
  ] },
  { title: '商品管理', icon: '📦', link: '/inventory', roles: ['inventory','operation'], children: [
    { title: '商品列表', link: '/inventory' }
  ] },
  { title: '仓库管理', icon: '🏬', link: '/operation/warehouse/list', roles: ['operation'], children: [
    { title: '仓库列表', link: '/operation/warehouse/list' }
  ] },
  // 业务模块（按角色显示）
  { title: '入库管理', link: '/biz/inbound', roles: ['inventory','warehouse','operation'] },
  { title: '出库管理', link: '/biz/outbound', roles: ['inventory','warehouse','operation'] },
  { title: '仓单管理', link: '/biz/warrant', roles: ['inventory','warehouse','operation'] },
  { title: '移库管理', link: '/biz/relocate', roles: ['inventory','warehouse','operation'] },
  { title: '融资管理', link: '/biz/finance', roles: ['inventory','financial','guarantee','operation'] },
  { title: '仓单过户', link: '/biz/transfer', roles: ['inventory','warehouse','operation'] },
  { title: '仓单续期', link: '/biz/renew', roles: ['inventory','warehouse','operation'] },
  { title: '仓单交易', link: '/biz/trade', roles: ['inventory','operation'] },
  { title: '费用管理', link: '/biz/fee', roles: ['inventory','operation'] },
  { title: '公告管理', link: '/biz/notice', roles: ['inventory','warehouse','financial','guarantee','operation'] },
  { title: '日志管理', link: '/biz/log', roles: ['warehouse','operation'] },
  { title: '司法协助', link: '/biz/judicial', roles: ['operation'] },
  { title: '资料管理', link: '/biz/document', roles: ['inventory','warehouse','financial','guarantee','operation'] },
  { title: '短信管理', link: '/biz/sms', roles: ['inventory','warehouse','financial','guarantee','operation'] },
  { title: '用户权限管理', icon: '🔑', link: '/role-select', children: [
    { title: '权限配置', link: '/role-select' }
  ] }
] as any[];
const menus = allMenus.filter(m => !m.roles || m.roles.includes(role));
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
function isOpen(idx: number) {
  // 默认展开标记或当前点击展开
  return Boolean((menus[idx] as any)?.open) || openMenuIdx.value === idx;
}
// 保留占位：后续可接入真实登出逻辑
onMounted(() => {
  let lastScroll = window.scrollY;
  window.addEventListener('scroll', () => {
    const now = window.scrollY;
    collapsed.value = now > lastScroll && now > 40;
    lastScroll = now;
  });
});
</script>

<style scoped>
/* 赛博蓝色背景 */
.cyber-bg {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
}
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
  min-height: calc(100vh - 56px);
  margin-top: 0; /* 无顶部导航，取消上边距 */
}
/* 左侧导航栏固定，毛玻璃+蓝色高光 */
.cyber-sidebar {
  width: 220px;
  background: rgba(255,255,255,0.75);
  color: #0f172a;
  box-shadow: 2px 0 22px rgba(0,80,255,0.12);
  border-right: 1px solid rgba(2,6,23,0.06);
  backdrop-filter: blur(16px);
  padding-top: 24px;
  transition: width 0.3s cubic-bezier(.4,0,.2,1);
  position: fixed;
  top: 0; /* 无顶部导航，贴顶 */
  left: 0;
  bottom: 0;
  z-index: 99;
  overflow-y: auto;
}
.sidebar-collapsed {
  width: 64px;
}
.menus {
  list-style: none;
  padding: 0;
  margin: 0;
}
.menus > li.menu-item {
  padding: 12px 24px;
  color: #0f172a;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}
.menus > li.menu-item.active {
  background: linear-gradient(90deg, rgba(0,112,255,0.10) 0%, rgba(0,207,255,0.10) 100%);
  color: #0f172a;
  font-weight: 700;
}
.menus > li.menu-item:hover {
  background: rgba(0,112,255,0.08);
}
.menus > li.menu-item .caret {
  display: inline-block;
  width: 10px;
  transform: rotate(0deg);
  transition: transform .2s ease;
  opacity: .7;
}
.menus > li.menu-item .caret.open {
  transform: rotate(90deg);
}
.menus > li.menu-item .title { flex: 1; }
.submenu {
  position: static;
  background: transparent;
  box-shadow: none;
  border-radius: 0;
  min-width: auto;
  padding: 6px 0 0 18px;
  margin: 0;
}
.submenu > li {
  padding: 8px 24px;
  color: #0f172a;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.2s;
}
.submenu > li.active { font-weight: bold; }
.submenu > li:hover { text-decoration: underline; }
/* 内容区自适应宽度，网页风格 */
.cyber-content {
  flex: 1;
  min-height: calc(100vh - 56px);
  padding: 32px 40px;
  background: #fff;
  border-radius: 0;
  box-shadow: none;
  margin: 0;
  width: calc(100vw - 220px);
  margin-left: 220px;
  min-height: 100vh;
  transition: none;
}
.cyber-content:hover {
  box-shadow: 0 8px 48px rgba(0,80,255,0.18);
}
</style>
