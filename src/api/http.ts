type Json = any;

async function request(method: 'GET'|'POST'|'PUT'|'DELETE', url: string, body?: any): Promise<{ data: Json }>{
  // 简易占位实现：返回本地 Mock；真实项目可切换为 fetch/axios
  if (url.includes('/api/warehouses')) {
    return { data: [ { id: 'W001', name: '示例仓库A', address: '郑州·经开区' } ] } as any;
  }
  if (url.includes('/api/products')) {
    return { data: [ { id: 'P001', name: '小麦', spec: '0.05 吨/件' } ] } as any;
  }
  return { data: {} as any };
}

export default {
  get(url: string){ return request('GET', url); },
  post(url: string, data?: any){ return request('POST', url, data); },
};


