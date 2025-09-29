export default [
  {
    url: '/api/storage/list',
    method: 'get',
    response: () => {
      return {
        code: 0,
        data: [
          { id: 1, item: '魔法石', quantity: 10, remark: '能量充足' },
          { id: 2, item: '飞天扫帚', quantity: 2, remark: '限量版' },
          { id: 3, item: '隐形斗篷', quantity: 1, remark: '稀有' }
        ]
      };
    }
  }
];
