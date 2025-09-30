<template>
  <div class="shell">
    <aside class="shell-sidebar">
      <div class="sidebar-brand">
        <span class="brand-mark">AI</span>
        <span class="brand-text">供应链金融管理平台</span>
      </div>
      <ul class="menus">
        <li v-for="(menu, idx) in menus" :key="menu.link"
            class="menu-item"
            :class="{ active: isActive(menu.link), open: isOpen(idx), 'parent-active': hasActiveChild(menu) }"
            @click="onMenuClick(menu, idx)">
          <span class="title">{{ menu.title }}</span>
          <ul v-if="menu.children" class="submenu">
            <li v-for="sub in menu.children" :key="sub.link"
                :class="{ active: isActive(sub.link) }"
                @click.stop="go(sub.link)">{{ sub.title }}</li>
          </ul>
        </li>
      </ul>
    </aside>
    <main class="shell-content">
      <div class="content-topbar">
        <div class="topbar-title">郑商云仓 · 平台运营</div>
        <div class="topbar-actions">
          <!-- 可放置切换/搜索/用户按钮等 -->
        </div>
      </div>
      <router-view />
    </main>
  </div>
  </template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { getMenusByRole } from '../roles/menu';

const router = useRouter();
const openMenuIdx = ref<number|null>(null);
const role = (typeof localStorage !== 'undefined' && localStorage.getItem('role')) || 'operation';

const menus = getMenusByRole(role);

function go(link: string) { router.push(link); }
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
  return Boolean((menus[idx] as any)?.open) || openMenuIdx.value === idx;
}

onMounted(() => {
  const cur = router.currentRoute.value.path || '';
  const found = menus.findIndex((m: any) => m.link === cur || (m.children && m.children.some((s: any) => cur.startsWith(s.link))));
  if (found >= 0) openMenuIdx.value = found;
});

watch(() => router.currentRoute.value.path, (p) => {
  const cur = p || '';
  const found = menus.findIndex((m: any) => m.link === cur || (m.children && m.children.some((s: any) => cur.startsWith(s.link))));
  if (found >= 0) openMenuIdx.value = found;
});
</script>

<style scoped>
.shell{ display:flex; min-height:100vh; background:#fff; }
.shell-sidebar{ width:200px; background:#1677FF; border-right:1px solid rgba(255,255,255,0.15); color:#ffffff; padding:0 0 12px; position:sticky; top:0; height:100vh; align-self:flex-start; overflow:auto; }
.sidebar-brand{ height:56px; display:flex; align-items:center; justify-content:center; gap:10px; border-bottom:1px solid rgba(255,255,255,0.18); }
.brand-mark{ width:32px; height:32px; border-radius:50%; display:grid; place-items:center; font-weight:900; letter-spacing:.4px; font-size:14px; color:#ffffff; position:relative; overflow:hidden; border:1px solid rgba(255,255,255,0.70); background: radial-gradient(120% 120% at 30% 20%, #5AA9FF 0%, #3CCBFF 40%, #7C4DFF 100%); box-shadow:
  0 0 10px rgba(34,211,238,0.55),
  0 0 20px rgba(96,165,250,0.45),
  0 0 34px rgba(124,77,255,0.40),
  0 0 0 1px rgba(255,255,255,0.28) inset,
  0 6px 16px rgba(0,0,0,0.15);
text-shadow: 0 0 6px rgba(255,255,255,0.65);
animation: glow 2s ease-in-out infinite alternate;
}
.brand-mark::before{ content:''; position:absolute; inset:0; border-radius:inherit; background: radial-gradient(120% 60% at 50% -10%, rgba(255,255,255,0.75), rgba(255,255,255,0)); opacity:.55; pointer-events:none; }
.brand-mark::after{ content:''; position:absolute; inset:auto 0 0 0; height:42%; background: linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.00)); filter: blur(.3px); }
@keyframes glow { 0%{ box-shadow: 0 0 8px rgba(34,211,238,0.45), 0 0 18px rgba(96,165,250,0.35), 0 0 30px rgba(124,77,255,0.30), 0 0 0 1px rgba(255,255,255,0.26) inset, 0 6px 16px rgba(0,0,0,0.12);} 100%{ box-shadow: 0 0 14px rgba(34,211,238,0.70), 0 0 28px rgba(96,165,250,0.55), 0 0 42px rgba(124,77,255,0.50), 0 0 0 1px rgba(255,255,255,0.30) inset, 0 8px 18px rgba(0,0,0,0.16);} }
.brand-logo{ height:24px; width:auto; filter: drop-shadow(0 0 2px rgba(0,0,0,0.15)); }
.brand-text{ color:#ffffff; font-weight:800; letter-spacing:.6px; text-shadow: 0 0 10px rgba(255,255,255,0.22); }
.menus{ list-style:none; margin:0; padding:0; }
.menu-item{ padding:10px 14px; cursor:pointer; transition:background .15s ease; }
.menu-item:hover{ background:rgba(255,255,255,0.10); }
.menu-item.active{ background:rgba(255,255,255,0.14); }
.menu-item + .menu-item{ margin-top:2px; }
.title{ font-size:14px; color:#ffffff; }
.submenu{ list-style:none; margin:6px 0 0 0; padding:6px 0 0 12px; max-height:0; overflow:hidden; opacity:0; transition:max-height .2s ease, opacity .2s ease; }
.menu-item.open > .submenu{ max-height:600px; opacity:1; }
.submenu li{ padding:8px 10px; font-size:13px; border-radius:6px; color:#ffffff; }
.submenu li.active{ background:rgba(255,255,255,0.12); }
.shell-content{ flex:1; min-width:0; padding:24px 24px; }
.content-topbar{ position:sticky; top:0; z-index:5; height:44px; display:flex; align-items:center; justify-content:space-between; padding:0 12px; margin-bottom:16px; background:rgba(255,255,255,0.55); border:1px solid rgba(255,255,255,0.60); border-radius:10px; box-shadow:0 10px 30px rgba(2,6,23,0.06), inset 0 0 0 1px rgba(255,255,255,0.55); backdrop-filter: blur(12px) saturate(1.06); -webkit-backdrop-filter: blur(12px) saturate(1.06); }
.topbar-title{ font-size:14px; color:#0f172a; font-weight:600; }
.topbar-actions{ display:flex; align-items:center; gap:8px; }
</style>


