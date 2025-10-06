import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': {
      common: {
        placeholderSearchProducts: '搜索商品...',
        export: '导出',
        importBatch: '批量导入',
        downloadTemplate: '下载模板',
        search: '查询',
        batchDelete: '批量删除',
        cancel: '取消'
      },
      product: {
        add: '新增商品',
        dialog: {
          create: '新增商品',
          edit: '编辑商品'
        }
      }
    }
  }
});

export default i18n;


