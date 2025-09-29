export default [
  {
    url: '/api/ai/recognize',
    method: 'post',
    async response({ body }) {
      const dataUrl = body?.dataUrl || '';
      const hasImage = typeof dataUrl === 'string' && dataUrl.startsWith('data:');
      if (!hasImage) return { code: 1, msg: '缺少图片数据' };
      // 纯 mock：简单正则从 dataUrl 名称中猜测，或返回提示失败（用于前端回退至本地 OCR）
      return {
        code: 1,
        msg: '未配置 OPENAI_API_KEY，返回失败以触发前端本地 OCR 回退'
      };
    }
  }
];








