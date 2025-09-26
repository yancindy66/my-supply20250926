let owners = [
  { id: 1, company: '魔力科技', contact: '张三', phone: '13800000000', address: '上海市浦东新区', license: '营业执照A', seal: '公章A' },
  { id: 2, company: '飞天物流', contact: '李四', phone: '13900000001', address: '北京市朝阳区', license: '营业执照B', seal: '公章B' }
];

export default [
  // 列表
  {
    url: '/api/inventory-owner/list',
    method: 'get',
    response: () => ({ code: 0, data: owners })
  },
  // 详情
  {
    url: '/api/inventory-owner/detail',
    method: 'get',
    response: ({ query }) => {
      const item = owners.find(d => d.id == query.id);
      return { code: item ? 0 : 1, data: item || null };
    }
  },
  // 创建
  {
    url: '/api/inventory-owner/create',
    method: 'post',
    response: ({ body }) => {
      const id = Math.max(0, ...owners.map(o => o.id)) + 1;
      const item = { id, ...body };
      owners.push(item);
      return { code: 0, data: item, msg: '创建成功' };
    }
  },
  // 更新
  {
    url: '/api/inventory-owner/update',
    method: 'post',
    response: ({ body }) => {
      const idx = owners.findIndex(o => o.id == body.id);
      if (idx === -1) return { code: 1, msg: '未找到' };
      owners[idx] = { ...owners[idx], ...body };
      return { code: 0, data: owners[idx], msg: '更新成功' };
    }
  },
  // 删除
  {
    url: '/api/inventory-owner/delete',
    method: 'post',
    response: ({ body }) => {
      owners = owners.filter(o => o.id != body.id);
      return { code: 0, msg: '删除成功' };
    }
  }
];
