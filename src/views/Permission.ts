import { defineComponent, h } from 'vue';

export default defineComponent({
  name: 'PermissionPage',
  setup() {
    return () => h('div', { style: { padding: '12px' } }, '用户权限');
  }
});








