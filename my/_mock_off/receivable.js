export default [
  {
    url: '/api/receivable/detail',
    method: 'get',
    response: ({ query }) => {
      const data = [
        { id: 1, name: '仪表1', value: 100, status: '正常', expire: '2025-12-31', desc: '仪表1详细信息' },
        { id: 2, name: '仪表2', value: 200, status: '警告', expire: '2025-10-01', desc: '仪表2详细信息' },
        { id: 3, name: '仪表3', value: 300, status: '过期', expire: '2025-09-01', desc: '仪表3详细信息' }
      ];
      const item = data.find(d => d.id == query.id);
      return {
        code: item ? 0 : 1,
        data: item || null
      };
    }
  }
];
