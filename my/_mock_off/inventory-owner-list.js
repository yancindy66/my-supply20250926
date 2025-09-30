let agencies = [
  { id: 1, name: '国家监管局', contact: '王五', phone: '13600000000', region: '全国', code: 'JG-001' },
  { id: 2, name: '上海监管局', contact: '赵六', phone: '13700000001', region: '上海', code: 'JG-002' }
];

export default [
  {
    url: '/api/regulatory-agency/list',
    method: 'get',
    response: ({ query }) => {
      const page = parseInt(query?.page || '1', 10) || 1;
      const pageSize = parseInt(query?.pageSize || '10', 10) || 10;
      const total = agencies.length;
      const start = (page - 1) * pageSize;
      const list = agencies.slice(start, start + pageSize);
      return { code: 0, data: { list, total, page, pageSize } };
    }
  },
  {
    url: '/api/regulatory-agency/create',
    method: 'post',
    response: ({ body }) => {
      const id = Math.max(0, ...agencies.map(o => o.id)) + 1;
      const item = { id, ...body };
      agencies.push(item);
      return { code: 0, data: item };
    }
  },
  {
    url: '/api/regulatory-agency/update',
    method: 'post',
    response: ({ body }) => {
      const idx = agencies.findIndex(o => o.id == body.id);
      if (idx === -1) return { code: 1, msg: '未找到' };
      agencies[idx] = { ...agencies[idx], ...body };
      return { code: 0, data: agencies[idx] };
    }
  }
];








