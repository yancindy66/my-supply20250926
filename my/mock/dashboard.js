export default [
  {
    url: '/api/dashboard/list',
    method: 'get',
    response: () => {
      return {
        code: 0,
        data: [
          { id: 1, name: '仪表1', value: 100, status: '正常', expire: '2025-12-31' },
          { id: 2, name: '仪表2', value: 200, status: '警告', expire: '2025-10-01' },
          { id: 3, name: '仪表3', value: 300, status: '过期', expire: '2025-09-01' }
        ]
      };
    }
  }
];
