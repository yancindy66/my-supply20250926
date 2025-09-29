export type RoleKey = 'operation' | 'inventory' | 'warehouse' | 'financial' | 'guarantee';

export interface RoleTheme {
  name: string;
  primary: string;
  secondary: string;
  bgGradient: string;
  sidebarBg: string;
  contentBg: string;
  accent: string;
}

const defaultTheme: RoleTheme = {
  name: 'Default',
  // 品牌蓝作为强调色，但整体低饱和（通过半透明和浅灰层次表现）
  primary: '#2563eb',
  secondary: '#60a5fa',
  // 中性低饱和基调：雾灰与米白层次
  bgGradient: 'linear-gradient(180deg,#FAF9F6 0%, #F5F7FA 60%, #F2F4F8 100%)',
  // 侧栏采用不透明浅蓝渐变，避免透出底层
  sidebarBg: 'linear-gradient(180deg, #E6F0FF 0%, #D8E8FF 100%)',
  contentBg: '#ffffff',
  accent: '#94a3b8'
};

export const THEMES: Record<RoleKey, RoleTheme> = {
  operation: { ...defaultTheme, name: 'Operation' },
  inventory: { ...defaultTheme, name: 'Inventory' },
  warehouse: { ...defaultTheme, name: 'Warehouse' },
  financial: { ...defaultTheme, name: 'Financial' },
  guarantee: { ...defaultTheme, name: 'Guarantee' }
};

export function applyThemeForRole(role: string | null | undefined) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const r = String(role || 'operation') as RoleKey;
  const theme = THEMES[r] || defaultTheme;
  const el = document.documentElement;
  el.style.setProperty('--app-primary', theme.primary);
  el.style.setProperty('--app-secondary', theme.secondary);
  el.style.setProperty('--app-bg-gradient', theme.bgGradient);
  el.style.setProperty('--app-sidebar-bg', theme.sidebarBg);
  el.style.setProperty('--app-content-bg', theme.contentBg);
  el.style.setProperty('--app-accent', theme.accent);
  el.setAttribute('data-role', r);
}


