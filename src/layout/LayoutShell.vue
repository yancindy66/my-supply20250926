<template>
  <div class="layout-shell">
    <aside :class="['shell-sidebar', { collapsed: isCollapsed, 'is-collapsed': isCollapsed, hovering: isCollapsed && isHovering }]" @mouseenter="onSidebarEnter" @mouseleave="onSidebarLeave">
      <div class="sidebar-top">
        <div class="logo-wrap" @mouseenter="onLogoEnter" @mouseleave="onLogoLeave">
          <div class="logo-mark" @click.stop="onLogoClick" title="收起/展开侧栏">ZH</div>
          <div v-if="!isCollapsed || (isCollapsed && isHovering)" class="logo-text" @click="goHome" title="返回仪表盘">中芯辉腾·运营平台</div>
        </div>
        
      </div>

      <nav class="menu" :class="{ scrollable: true }">
        <ul class="menu-list">
          <li v-for="item in menuItems" :key="item.key" :class="['menu-item', { active: isActive(item) }]">
            <button class="item-main" @click="onItemClick(item)">
              <span class="item-icon" aria-hidden="true" v-html="item.icon" />
              <span v-if="!isCollapsed || (isCollapsed && isHovering)" class="item-title">{{ item.title }}</span>
              <span v-if="( !isCollapsed || (isCollapsed && isHovering) )" class="item-arrow" :class="{ open: item.children?.length && isOpen(item.key) }">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M8.12 9.29L12 13.17l3.88-3.88L17.3 10.7 12 16l-5.3-5.3z"/></svg>
              </span>
            </button>

            <transition name="submenu">
              <ul v-if="( !isCollapsed || (isCollapsed && isHovering) ) && item.children?.length && isOpen(item.key)" class="submenu-list">
                <li v-for="sub in item.children" :key="sub.key" class="submenu-item">
                  <router-link class="submenu-link" :to="sub.to">{{ sub.title }}</router-link>
                </li>
              </ul>
            </transition>
          </li>
        </ul>
      </nav>

      <div class="sidebar-bottom">
        <button class="logout-btn" @click="logout">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3h-8c-1.1 0-2 .9-2 2v4h2V5h8v14h-8v-4h-2v4c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
          <span v-if="!isCollapsed">退出登录</span>
        </button>
      </div>
    </aside>

    <main class="shell-content">
      <div class="tabs-bar" v-if="tabs.length">
        <div class="tabs-scroll">
          <button
            v-for="(t, idx) in tabs"
            :key="t.path"
            :class="['tab', { active: t.path === activePath }]"
            @click="go(t.path)"
            draggable="true"
            @dragstart="onTabDragStart(t.path)"
            @dragover.prevent="onTabDragOver(idx)"
            @drop.prevent="onTabDrop(idx)"
          >
            <span class="tab-title">{{ t.title }}</span>
            <button class="tab-close" @click.stop="closeTab(t.path)" title="关闭">
              <span class="tab-close-dot">×</span>
            </button>
          </button>
        </div>
        <div class="tabs-actions">
          <select class="font-switch" v-model="selectedFontKey" @change="applyFont">
            <option v-for="f in fontOptions" :key="f.key" :value="f.key">{{ f.label }}</option>
          </select>
          <select class="lang-switch" v-model="selectedLang" @change="applyLang">
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

type MenuChild = { key: string; title: string; to: string };
type MenuItem = { key: string; title: string; icon: string; children?: MenuChild[]; to?: string };

const router = useRouter();
const route = useRoute();

const isCollapsed = ref(false);
const isHovering = ref(false);
const openMap = reactive<Record<string, boolean>>({ member: true });

const menuItems = computed<MenuItem[]>(() => [
  {
    key: 'dashboard',
    title: '仪表盘',
    to: '/operation/dashboard',
    icon: `<svg viewBox='0 0 24 24' width='18' height='18'><path fill='currentColor' d='M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z'/></svg>`
  },
  {
    key: 'member',
    title: '会员管理',
    icon: `<svg viewBox='0 0 24 24' width='18' height='18'><path fill='currentColor' d='M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z'/></svg>`,
    children: [
      { key: 'inventory', title: '存货人管理', to: '/operation/member/inventory/list' },
      { key: 'financial-institutions', title: '金融机构管理', to: '/operation/member/financial-institutions' },
      { key: 'guarantee-agencies', title: '担保机构管理', to: '/operation/member/guarantee-agencies' },
      { key: 'quality-agencies', title: '质检机构管理', to: '/operation/member/quality-agencies' },
      { key: 'supervised-warehouses', title: '监管仓库管理', to: '/operation/member/supervised-warehouses' },
      { key: 'inventory-users-excel', title: 'EXCEL编辑', to: '/operation/inventory-users-excel' },
      
    ]
  },
  {
    key: 'product',
    title: '商品管理',
    icon: `<svg viewBox='0 0 24 24' width='18' height='18'><path fill='currentColor' d='M21 16V8l-8-5-8 5v8l8 5 8-5zM5 8l7 4 7-4-7-4-7 4zm7 6l-7-4v4l7 4 7-4v-4l-7 4z'/></svg>`,
    children: [
      { key: 'product-base', title: '基础信息表', to: '/operation/products' },
      { key: 'product-price', title: '价格管理表', to: '/operation/products/price' },
      { key: 'product-trace', title: '溯源信息表', to: '/operation/products/trace' },
      { key: 'product-monitor', title: '监测指标表', to: '/operation/products/monitor' }
    ]
  },
  {
    key: 'warehouse',
    title: '仓储管理',
    icon: `<svg viewBox='0 0 24 24' width='18' height='18'><path fill='currentColor' d='M12 2L2 7v13h20V7l-10-5zm0 2.18L19 8v1H5V8l7-3.82zM5 12h14v6H5v-6z'/></svg>`,
    to: '/operation/warehouse'
  },
  {
    key: 'warrant',
    title: '仓单管理',
    icon: `<svg viewBox='0 0 24 24' width='18' height='18'><path fill='currentColor' d='M4 2h14l4 4v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm12 0v4h4l-4-4zM6 12h12v2H6v-2zm0 4h12v2H6v-2zM6 8h8v2H6V8z'/></svg>`,
    to: '/operation/warrants'
  },
  {
    key: 'permission',
    title: '用户权限',
    icon: `<svg viewBox='0 0 24 24' width='18' height='18'><path fill='currentColor' d='M12 1a5 5 0 015 5v3a5 5 0 01-10 0V6a5 5 0 015-5zm7 14H5a3 3 0 00-3 3v4h20v-4a3 3 0 00-3-3z'/></svg>`,
    to: '/operation/permission'
  },
  {
    key: 'excel',
    title: 'EXCEL表',
    icon: `<svg viewBox='0 0 24 24' width='18' height='18'><path fill='currentColor' d='M4 4h16v16H4V4zm3 3v10h2l3-4 3 4h2V7h-2v6l-3-4-3 4V7H7z'/></svg>`,
    to: '/operation/excel'
  },
  {
    key: 'ms-excel',
    title: 'MS Excel Online',
    icon: `<svg viewBox='0 0 24 24' width='18' height='18'><path fill='currentColor' d='M4 4h10v4H4V4zm0 6h16v4H4v-4zm0 6h12v4H4v-4z'/></svg>`,
    to: '/operation/excel-microsoft'
  }
]);

function isActive(item: MenuItem): boolean {
  if (item.to) return route.path.startsWith(item.to);
  if (item.children?.length) return item.children.some(c => route.path.startsWith(c.to)) || isOpen(item.key);
  return false;
}

function isOpen(key: string): boolean {
  if (openMap[key]) return true;
  const item = menuItems.value.find(i => i.key === key);
  if (item?.children?.length) {
    return item.children.some(c => route.path.startsWith(c.to));
  }
  return false;
}

function onItemClick(item: MenuItem): void {
  if (item.children?.length) {
    openMap[item.key] = !openMap[item.key];
  } else if (item.to) {
    router.push(item.to);
  }
}

function toggleCollapse(): void {
  isHovering.value = false;
  isCollapsed.value = !isCollapsed.value;
}

function goHome(): void {
  router.push('/operation/dashboard');
}

function logout(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentRole');
    }
  } catch {}
  router.replace('/login');
}

function onSidebarEnter(): void {
  isHovering.value = true;
}

function onSidebarLeave(): void {
  isHovering.value = false;
}

function onLogoEnter(): void {
  if (isCollapsed.value) isHovering.value = true;
}

function onLogoLeave(): void {
  if (isCollapsed.value) isHovering.value = false;
}

function onLogoClick(): void {
  isHovering.value = false;
  isCollapsed.value = !isCollapsed.value;
}

type TabItem = { path: string; title: string };
const tabs = ref<TabItem[]>([]);
function normalizeTabPath(p: string): string {
  if (p.startsWith('/operation/member/inventory')) return '/operation/member/inventory/list';
  if (p.startsWith('/operation/member/financial-institutions')) return '/operation/member/financial-institutions';
  if (p.startsWith('/operation/member/guarantee-agencies')) return '/operation/member/guarantee-agencies';
  if (p.startsWith('/operation/member/quality-agencies')) return '/operation/member/quality-agencies';
  if (p.startsWith('/operation/member/supervised-warehouses')) return '/operation/member/supervised-warehouses';
  return p;
}
const activePath = computed(() => normalizeTabPath(route.path));
let dragTabPath: string | null = null;

function routeToTitle(path: string): string {
  const p = normalizeTabPath(path);
  if (p === '/operation/member/inventory/list') return '存货人管理';
  if (p === '/operation/member/financial-institutions') return '金融机构管理';
  if (p === '/operation/member/guarantee-agencies') return '担保机构管理';
  if (p === '/operation/member/quality-agencies') return '质检机构管理';
  if (p === '/operation/member/supervised-warehouses') return '监管仓库管理';
  if (p.startsWith('/operation/products')) return '商品管理';
  if (p.startsWith('/operation/warehouse')) return '仓储管理';
  if (p.startsWith('/operation/warrants')) return '仓单管理';
  if (p.startsWith('/operation/permission')) return '用户权限';
  if (p.startsWith('/operation/dashboard')) return '仪表盘';
  return '页面';
}

function ensureTab(path: string): void {
  if (!path.startsWith('/operation')) return;
  const tabPath = normalizeTabPath(path);
  const exists = tabs.value.some(t => t.path === tabPath);
  if (!exists) {
    tabs.value.push({ path: tabPath, title: routeToTitle(tabPath) });
  }
}

watch(() => route.path, (p) => {
  ensureTab(p);
}, { immediate: true });

function go(path: string): void {
  // 点击标签回到模块主列表
  const target = normalizeTabPath(path);
  if (normalizeTabPath(route.path) !== target) router.push(target);
}

function closeTab(path: string): void {
  const idx = tabs.value.findIndex(t => t.path === path);
  if (idx === -1) return;
  const isActive = route.path === path;
  tabs.value.splice(idx, 1);
  if (isActive) {
    const fallback = tabs.value[idx - 1] || tabs.value[idx] || { path: '/operation/dashboard' };
    router.push(fallback.path);
  }
}

function onTabDragStart(path: string): void { dragTabPath = path; }
function onTabDragOver(overIndex: number): void { /* 仅触发 drop 接受 */ }
function onTabDrop(dropIndex: number): void {
  if (dragTabPath == null) return;
  const from = tabs.value.findIndex(t => t.path === dragTabPath);
  if (from === -1 || from === dropIndex) { dragTabPath = null; return; }
  const [moved] = tabs.value.splice(from, 1);
  tabs.value.splice(dropIndex, 0, moved);
  dragTabPath = null;
}

// Font switcher (same as Layout.vue)
const fontOptions = [
  { key: 'MiSans', label: 'MiSans', family: '"MiSans", sans-serif' },
  { key: 'HarmonyOS', label: 'HarmonyOS Sans SC', family: '"HarmonyOS Sans SC", sans-serif' },
  { key: 'Noto', label: 'Noto Sans SC', family: '"Noto Sans SC", sans-serif' },
  { key: 'SourceHan', label: '思源黑体 SC', family: '"Source Han Sans SC", sans-serif' },
  { key: 'Inter', label: 'Inter', family: 'Inter, sans-serif' },
  { key: 'System', label: 'System UI', family: 'system-ui, -apple-system, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif' }
];
const selectedFontKey = ref<string>('MiSans');
function setAppFontFamily(family: string){
  try { document.documentElement?.style?.setProperty('--app-font', family); } catch {}
}
function applyFont(){
  const found = fontOptions.find(f=> f.key === selectedFontKey.value);
  const family = found?.family || 'system-ui, -apple-system, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif';
  setAppFontFamily(family);
  try { localStorage.setItem('appFontFamily', family); localStorage.setItem('appFontKey', selectedFontKey.value); } catch {}
}
const selectedLang = ref<'zh'|'en'>('zh');
function applyLang(): void {
  try {
    localStorage.setItem('appLang', selectedLang.value);
    // 刷新页面以应用 i18n
    window.location.reload();
  } catch {}
}
onMounted(() => {
  try {
    const saved = localStorage.getItem('appFontFamily');
    const savedKey = localStorage.getItem('appFontKey') || 'MiSans';
    if (saved) { setAppFontFamily(saved); }
    selectedFontKey.value = savedKey;
    const savedLang = localStorage.getItem('appLang') || 'zh';
    selectedLang.value = savedLang as 'zh'|'en';
  } catch {}
});
</script>

<style scoped>
.layout-shell { display: flex; min-height: 100vh; background: linear-gradient(180deg, #eaf4ff 0%, #cfe2f1 100%); -webkit-font-smoothing: antialiased; }

.shell-sidebar {
  /* 局部变量定义在侧栏根节点，避免 scoped :root 失效 */
  --sb-width: 248px;
  --sb-width-collapsed: 76px;
  /* 光晕靛蓝配色 */
  --sb-bg-start: #1e1b4b; /* indigo deep */
  --sb-bg-mid:   #3730a3; /* indigo 800 */
  --sb-bg-end:   #0b1533; /* deep navy */
  --sb-glass: rgba(255,255,255,0.08);
  --sb-text: #e5e7eb;
  --sb-text-strong: #ffffff;
  --accent: #38bdf8;
  --bookmark: #60a5fa;    /* sky-400 光感更强 */
  --sep: rgba(255,255,255,0.12);
  --font-size-main: 15px;
  --font-size-sub: 13px;
  --neon-cyan: #22d3ee;     /* 赛博蓝青 */
  --neon-blue: #60a5fa;     /* 霓虹靛蓝偏蓝 */
  --neon-purple: #818cf8;   /* 靛蓝紫过渡 */
  /* 暮色高光（黄昏光晕） */
  /* 顶部光晕改为蓝青系，保持光晕效果不变 */
  --dusk-warm: rgba(56, 189, 248, 0.14);  /* sky-400 */
  --dusk-pink: rgba(99, 102, 241, 0.12);  /* indigo-500 */
  --btn-surface: rgba(255,255,255,0.06);

  position: sticky;
  top: 0;
  align-self: flex-start;
  height: 100vh;
  width: var(--sb-width);
  color: #0f172a;
  background: linear-gradient(180deg, rgba(234,244,255,0.06) 0%, rgba(167,204,255,0.03) 100%);
  box-shadow: 2px 0 8px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(255,255,255,0.28);
  border-right: 1px solid rgba(255,255,255,0.30);
  backdrop-filter: blur(24px) saturate(1.02) brightness(1.04);
  -webkit-backdrop-filter: blur(24px) saturate(1.02) brightness(1.04);
  display: flex;
  flex-direction: column;
  padding: 14px 12px;
  /* 移除 backdrop 滤镜，避免高开销 */
  /* backdrop-filter: saturate(120%); */
  transition: width .25s ease;
  contain: layout paint;
  perspective: none;
}
.shell-sidebar.collapsed { width: var(--sb-width-collapsed); }
.shell-sidebar.collapsed { overflow: hidden; }
.shell-sidebar.hovering { width: var(--sb-width); }

.sidebar-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
.logo-wrap { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.logo-mark { width: 34px; height: 34px; border-radius: 10px; background: #ffffff; color: #0f172a; display: grid; place-items: center; font-weight: 800; letter-spacing: .5px; border: 1px solid #e5e7eb; box-shadow: none; }
.logo-text { color: #0f172a; font-weight: 700; white-space: nowrap; }
.collapse-btn { background: transparent; color: #e2e8f0; border: none; width: 32px; height: 32px; border-radius: 8px; display: grid; place-items: center; cursor: pointer; }
.collapse-btn:hover { background: var(--sb-glass); color: #fff; }

.menu { flex: 1; overflow: auto; padding: 6px; border-top: 1px solid var(--sep); border-bottom: 1px solid var(--sep); }
.menu::-webkit-scrollbar { width: 8px; height: 8px; }
.menu::-webkit-scrollbar-track { background: rgba(255,255,255,0.40); border-radius: 8px; }
.menu::-webkit-scrollbar-thumb { background: rgba(22,119,255,0.60); border-radius: 8px; border: 2px solid rgba(255,255,255,0.65); }
.menu { scrollbar-color: rgba(22,119,255,0.60) rgba(255,255,255,0.40); scrollbar-width: thin; }
.menu-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }

.menu-item { position: relative; }
.menu-item.active::before { display: none; }

/* 收起态下彩色条同步变窄并贴边，避免溢出与不协调 */
.shell-sidebar.collapsed .menu-item.active::before {
  left: 0;
  width: 4px;
  border-radius: 0 4px 4px 0;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.18),
    0 4px 12px rgba(37,99,235,.35),
    inset 0 0 6px rgba(96,165,250,.5);
}

.item-main { width: 100%; display: flex; align-items: center; gap: 12px; padding: 10px 12px; border: none; color: inherit; background: transparent; border-radius: 10px; cursor: pointer; transition: background .12s ease, color .12s ease; user-select: none; -webkit-tap-highlight-color: transparent; touch-action: manipulation; position: relative; }
.item-main:hover { background: #EAF4FF; }
.item-main:active { background: #DDEBFF; }

/* 一级菜单 激活态：深科技蓝（朴素扁平） */
.menu-item.active .item-main { background: #1677FF; color: #ffffff; box-shadow: none; outline: none; }
.menu-item.active .item-main::before { display: none; }
.menu-item.active .item-main::after { display: none; }
.menu-item.active::after { display: none; }

.item-icon { width: 20px; height: 20px; display: inline-grid; place-items: center; color: #0f172a; opacity: .92; }
.menu-item.active .item-icon { color: #ffffff; }
.item-title { flex: 1; text-align: left; font-weight: 700; font-size: var(--font-size-main); letter-spacing: .2px; color: #0f172a; }
.item-arrow { transition: transform .12s ease; color: #94a3b8; }
.item-arrow.open { transform: rotate(180deg); color: #0f172a; }

.submenu-list { list-style: none; margin: 4px 0 8px 44px; padding: 0; display: flex; flex-direction: column; gap: 6px; will-change: transform, opacity; transform-origin: top; }
.submenu-item {}
.submenu-link { display: block; color: #0f172a; text-decoration: none; padding: 9px 12px; border-radius: 8px; background: transparent; font-size: var(--font-size-sub); letter-spacing: .2px; border: 1px solid transparent; transition: background .12s ease, color .12s ease, border-color .12s ease; }
.submenu-link:hover { background: #EAF4FF; color: #0f172a; }
.submenu-link:active { background: #DDEBFF; }
.submenu-link.router-link-active { color: #ffffff; background: #5AA9FF; border-color: transparent; box-shadow: none; text-shadow: none; }


.submenu-enter-active, .submenu-leave-active { transition: transform .12s ease, opacity .12s ease; }
.submenu-enter-from, .submenu-leave-to { opacity: 0; transform: scaleY(.96); }

.sidebar-bottom { padding: 10px 8px 6px; display: flex; }
.logout-btn { width: 100%; display: inline-flex; align-items: center; gap: 10px; justify-content: center; background: linear-gradient(180deg, #EAF4FF 0%, #A7CCFF 100%); color: #0f172a; border: 1px solid rgba(0,0,0,0.08); padding: 10px 12px; border-radius: 12px; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.06); backdrop-filter: blur(6px) saturate(1.05); -webkit-backdrop-filter: blur(6px) saturate(1.05); }
.logout-btn:hover { background: linear-gradient(180deg, #E3F0FF 0%, #9CC6FF 100%); }

.shell-content { flex: 1; padding: 20px; background: linear-gradient(180deg, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.42) 100%); color: #0f172a; min-width: 0; position: relative; border-radius: 12px; box-shadow: 0 10px 30px rgba(2, 6, 23, 0.06), inset 0 0 0 1px rgba(255,255,255,0.55); backdrop-filter: blur(14px) saturate(1.06); -webkit-backdrop-filter: blur(14px) saturate(1.06); }
.shell-content::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 26px;
  pointer-events: none;
  background: linear-gradient(90deg,
    rgba(15,23,42,0.14) 0%,
    rgba(15,23,42,0.08) 42%,
    rgba(15,23,42,0.04) 74%,
    rgba(15,23,42,0.00) 100%
  );
}
.shell-content::after {
  content: '';
  position: absolute;
  left: 0; right: 0; top: 0;
  height: 34px;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255,255,255,0.38), rgba(255,255,255,0.06) 60%, transparent);
  border-top-left-radius: 12px; border-top-right-radius: 12px;
}

.tabs-bar { position: sticky; top: 0; z-index: 5; background: #fff; border-bottom: 1px solid #e5e7eb; margin: -8px -8px 10px; padding: 6px 8px; position: sticky; }
.tabs-scroll { display: flex; gap: 6px; overflow: auto; }
.tabs-actions { position: absolute; right: 8px; top: 6px; display: flex; align-items: center; gap: 8px; }
.font-switch { height: 26px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0 8px; background: #fff; color:#111827; }
.lang-switch { height: 26px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0 8px; background: #fff; color:#111827; }
.tab { display: inline-flex; align-items: center; gap: 6px; border: 1px solid #e5e7eb; background: #ffffff; color: #0f172a; border-radius: 999px; padding: 2px 8px; height: 22px; font-size: 12px; cursor: pointer; transition: background .12s ease, border-color .12s ease; }
.tab:hover { background: #f6f8fb; }
.tab.active { border-color: #1677ff; background: #eaf2ff; }
.tab-title { white-space: nowrap; }
.tab-close { width: 14px; height: 14px; border-radius: 50%; border: none; background: transparent; display: grid; place-items: center; cursor: pointer; }
.tab-close-dot { width: 12px; height: 12px; border-radius: 50%; background: #ef4444; color: #fff; display: inline-grid; place-items: center; font-size: 10px; line-height: 12px; }

/* 折叠态：隐藏文字，仅保留图标与动效 */
.shell-sidebar.collapsed:not(.hovering) .logo-text { display: none; }
.shell-sidebar.collapsed:not(.hovering) .item-title,
.shell-sidebar.collapsed:not(.hovering) .item-arrow { display: none; }
.shell-sidebar.collapsed:not(.hovering) .submenu-list { display: none; }
.shell-sidebar.collapsed .menu { padding-left: 4px; padding-right: 4px; }

@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; }
}
</style>
<style scoped>
/* Sidebar (LayoutShell) non-black text overrides */
.menu .menu-item:not(.active) .item-title,
.menu .menu-item:not(.active) .item-icon { color: rgba(58,93,174,0.82) !important; }
/* Submenu default color */
.submenu-link { color: #3A5DAE !important; }
/* Content area default text color */
.shell-content { color: #334155 !important; }
/* Active state: force white for title/icon/submenu when active */
.menu .menu-item.active .item-title,
.menu .menu-item.active .item-icon,
.submenu-link.router-link-active { color: #ffffff !important; }
/* Blue branding for shell logo and possible header text */
.logo-text { color: #1677FF !important; }
.logo-mark { color: #1677FF !important; border-color: rgba(22,119,255,0.35) !important; }
</style>
<style scoped>
/* Sidebar transparent glass override (shell) */
.shell-sidebar { background: transparent !important; box-shadow: 2px 0 8px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(255,255,255,0.50) !important; border-right: 1px solid rgba(255,255,255,0.55) !important; backdrop-filter: blur(24px) saturate(1.06) !important; -webkit-backdrop-filter: blur(24px) saturate(1.06) !important; }
</style>
<style scoped>
/* Remove overlays on shell sidebar */
.shell-sidebar::before, .shell-sidebar::after { content: none !important; display: none !important; background: transparent !important; }
</style>
<style scoped>
/* FINAL OVERRIDE: White glass shell sidebar + dark text */
.shell-sidebar { background: rgba(255,255,255,0.62) !important; background-image: none !important; box-shadow: 2px 0 8px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(255,255,255,0.60) !important; border-right: 1px solid rgba(255,255,255,0.65) !important; backdrop-filter: blur(22px) saturate(1.06) !important; -webkit-backdrop-filter: blur(22px) saturate(1.06) !important; }
.menu .menu-item:not(.active) .item-title,
.menu .menu-item:not(.active) .item-icon,
.logo-text,
.submenu-link { color: #111827 !important; }
.menu .menu-item.active .item-title,
.menu .menu-item.active .item-icon,
.submenu-link.router-link-active { color: #ffffff !important; }
</style>
<style scoped>
/* Branding: tech blue logo */
.logo-text, .logo-mark { color: #1677FF !important; }
/* Main menu (inactive): light black, no bold */
.menu .menu-item:not(.active) .item-title,
.menu .menu-item:not(.active) .item-icon { color: #374151 !important; font-weight: 400 !important; }
</style>
<style scoped>
/* Submenu active: glass-blue style & full-row (shell) */
.submenu-list { margin-left: 0 !important; }
.submenu-item { margin: 0 !important; }
.submenu-link { display: block; border-radius: 10px; }
.submenu-link.router-link-active {
  background: linear-gradient(180deg, rgba(22,119,255,0.28) 0%, rgba(22,119,255,0.20) 100%) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255,255,255,0.72) !important;
  box-shadow: 0 4px 12px rgba(22,119,255,0.18) !important;
  backdrop-filter: blur(8px) saturate(1.18) !important;
  -webkit-backdrop-filter: blur(8px) saturate(1.18) !important;
}
</style>
<style scoped>
/* Tune main menu active: deeper tech-blue, higher transparency, no blur (shell) */
.menu .menu-item.active .item-main {
  background: linear-gradient(180deg, rgba(22,119,255,0.34) 0%, rgba(22,119,255,0.26) 100%) !important;
  box-shadow: 0 3px 10px rgba(22,119,255,0.16) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
</style>
<style scoped>
/* FINAL: revert active colors (no glass) - shell */
.menu .menu-item.active .item-main { background: #1677FF !important; color: #ffffff !important; border: none !important; box-shadow: none !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
.submenu-link.router-link-active { background: #5AA9FF !important; color: #ffffff !important; border: none !important; box-shadow: none !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
</style>
<style scoped>
/* Submenu text center alignment (shell) */
.submenu-link { display: flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important; text-align: center !important; }
</style>
<style scoped>
/* Top tabs as glass-blue buttons (only secondary menu) */
.tabs-bar { background: transparent !important; }
.tab {
  background: linear-gradient(180deg, rgba(22,119,255,0.20) 0%, rgba(22,119,255,0.12) 100%) !important;
  color: #111827 !important; /* black-ish text */
  border: 1px solid rgba(255,255,255,0.65) !important;
  box-shadow: 0 4px 12px rgba(22,119,255,0.12) !important;
  backdrop-filter: blur(8px) saturate(1.06) !important;
  -webkit-backdrop-filter: blur(8px) saturate(1.06) !important;
  border-radius: 10px !important;
}
.tab:hover { background: linear-gradient(180deg, rgba(22,119,255,0.26) 0%, rgba(22,119,255,0.16) 100%) !important; }
.tab.active { background: linear-gradient(180deg, rgba(22,119,255,0.30) 0%, rgba(22,119,255,0.20) 100%) !important; color: #111827 !important; box-shadow: 0 6px 14px rgba(22,119,255,0.16) !important; }
/* Less prominent close button */
.tab-close { width: 14px !important; height: 14px !important; border-radius: 999px !important; border: 1px solid rgba(17,24,39,0.25) !important; background: transparent !important; color: rgba(17,24,39,0.55) !important; opacity: .6 !important; }
.tab-close:hover { background: rgba(17,24,39,0.06) !important; color: rgba(17,24,39,0.80) !important; opacity: .9 !important; }
</style>
<style scoped>
/* Top tabs 3D depth enhancement (shell) */
.tab {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.66) 0%, rgba(255,255,255,0.10) 48%, rgba(255,255,255,0.00) 100%),
    linear-gradient(180deg, rgba(22,119,255,0.20) 0%, rgba(22,119,255,0.12) 100%) !important;
  color: #111827 !important;
  border: 1px solid rgba(255,255,255,0.75) !important;
  box-shadow:
    0 6px 14px rgba(22,119,255,0.16),
    0 1px 0 rgba(255,255,255,0.80) inset,
    0 -1px 0 rgba(0,0,0,0.06) inset !important;
  border-radius: 10px !important;
}
.tab:hover {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.14) 48%, rgba(255,255,255,0.00) 100%),
    linear-gradient(180deg, rgba(22,119,255,0.26) 0%, rgba(22,119,255,0.16) 100%) !important;
}
.tab.active {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.76) 0%, rgba(255,255,255,0.18) 52%, rgba(255,255,255,0.00) 100%),
    linear-gradient(180deg, rgba(22,119,255,0.30) 0%, rgba(22,119,255,0.20) 100%) !important;
  box-shadow:
    0 8px 18px rgba(22,119,255,0.20),
    0 1px 0 rgba(255,255,255,0.85) inset,
    0 -1px 0 rgba(0,0,0,0.08) inset !important;
}
.tab:active { transform: translateY(1px); box-shadow: 0 4px 10px rgba(22,119,255,0.16), 0 1px 0 rgba(0,0,0,0.08) inset !important; }
</style>
<style scoped>
/* Shell tabs: jelly Q bounce with soft tech blue */
.tab {
  background: linear-gradient(180deg, #EAF2FF 0%, #D7E9FF 100%) !important;
  color: #0f172a !important;
  border: 1px solid rgba(255,255,255,0.75) !important;
  box-shadow: 0 6px 14px rgba(22,119,255,0.12), 0 1px 0 rgba(255,255,255,0.85) inset !important;
  border-radius: 14px !important;
  transition: transform .25s cubic-bezier(.2,.9,.25,1), box-shadow .25s ease, background .25s ease !important;
  backdrop-filter: blur(6px) !important;
  -webkit-backdrop-filter: blur(6px) !important;
  will-change: transform;
}
.tab:hover {
  animation: jelly .6s ease-out both;
  transform: translateY(-1px) scale(1.02);
  background: linear-gradient(180deg, #E3EEFF 0%, #CFE3FF 100%) !important;
  box-shadow: 0 8px 18px rgba(22,119,255,0.16), 0 1px 0 rgba(255,255,255,0.90) inset !important;
}
.tab:active { transform: translateY(0) scale(.98) !important; box-shadow: 0 4px 10px rgba(22,119,255,0.12), 0 1px 0 rgba(0,0,0,0.06) inset !important; }
.tab.active { background: linear-gradient(180deg, #DCEBFF 0%, #C7E0FF 100%) !important; box-shadow: 0 8px 18px rgba(22,119,255,0.18), 0 1px 0 rgba(255,255,255,0.92) inset !important; }
@keyframes jelly { 0%{ transform: scale(1,1);} 30%{ transform: scale(1.12,.88);} 50%{ transform: scale(.94,1.06);} 70%{ transform: scale(1.06,.96);} 100%{ transform: scale(1,1);} }
</style>
<style scoped>
/* FINAL: shell main menu inactive should not be blue */
.menu .menu-item:not(.active) .item-main { background: transparent !important; color: #374151 !important; border: none !important; box-shadow: none !important; }
.menu .menu-item:not(.active) .item-main:hover { background: rgba(17,24,39,0.04) !important; color: #374151 !important; }
</style>


