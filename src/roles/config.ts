// 轻量占位：按角色切换页面主题（可后续替换为真实主题系统）
export function applyThemeForRole(role: string = (localStorage.getItem('role') || 'operation')): void {
  const root = document.documentElement;
  const theme = role || 'operation';
  root.setAttribute('data-role-theme', theme);
}


