// 简易登录相关 Mock：微信扫码 + 生物识别（指纹/刷脸）
// 说明：仅在开发模式下启用（VITE_USE_PROXY=false 且 VITE_USE_MOCK=true）

let sceneStore = new Map();

function ok(data){
  return { code: 0, data };
}

function now(){ return Date.now(); }

export default [
  // 生成微信二维码
  {
    url: '/api/auth/wechat/qr',
    method: 'post',
    response: (req) => {
      const scene = `SCENE_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
      sceneStore.set(scene, { createdAt: now(), status: 'pending' });
      const qr_url = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent('WECHAT_LOGIN_'+scene)}`;
      return ok({ scene, qr_url });
    }
  },
  // 查询扫码状态（6 秒后返回 token，2 分钟过期）
  {
    url: '/api/auth/wechat/status',
    method: 'get',
    response: ({ query }) => {
      const scene = String(query?.scene || '');
      const rec = sceneStore.get(scene);
      if(!scene || !rec) return ok({ status: 'expired' });
      const elapsed = now() - rec.createdAt;
      if(elapsed > 120000){ sceneStore.delete(scene); return ok({ status: 'expired' }); }
      if(elapsed > 6000){ sceneStore.delete(scene); return ok({ status: 'ok', token: 'mock-token-wechat' }); }
      return ok({ status: 'pending' });
    }
  },
  // 指纹登录（立即给 token）
  {
    url: '/api/auth/fingerprint',
    method: 'post',
    response: () => ok({ token: 'mock-token-fp' })
  },
  // 刷脸登录（立即给 token）
  {
    url: '/api/auth/face',
    method: 'post',
    response: () => ok({ token: 'mock-token-face' })
  }
];

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








