export default [
  {
    url: '/api/auth/login',
    method: 'post',
    response: ({ body }) => {
      const role = String(body?.role||'');
      const username = String(body?.username||'').trim();
      const ok = !!username;
      if (!ok) return { code: 1, msg: '用户名必填' };
      const token = `${role || 'guest'}-${Date.now()}`;
      return { code: 0, data: { token, role: role || 'operation', user: { id: 1, name: username || 'User' } } };
    }
  }
];








