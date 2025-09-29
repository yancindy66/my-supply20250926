import { defineComponent, h, onMounted, onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';

declare global {
  interface Window {
    luckysheet?: any;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error('Failed to load ' + src));
    document.head.appendChild(el);
  });
}

function loadStyle(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const el = document.createElement('link');
    el.rel = 'stylesheet';
    el.href = href;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error('Failed to load ' + href));
    document.head.appendChild(el);
  });
}

const STORAGE_KEY = 'excel_inventory_owner_v1';

export default defineComponent({
  name: 'InventoryOwnerExcel',
  setup() {
    const router = useRouter();
    let container: HTMLDivElement | null = null;
    let mounted = false;
    let autosaveTimer: any = null;
    const isReady = ref(false);
    const syncing = ref(false);
    const mirror = ref(false);

    onMounted(async () => {
      mounted = true;
      try {
        await loadStyle('https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/plugins/css/pluginsCss.css');
        await loadStyle('https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/plugins/plugins.css');
        await loadStyle('https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/css/luckysheet.css');
        await loadScript('https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/plugins/js/plugin.js');
        await loadScript('https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/luckysheet.umd.js');
        if (!mounted || !container) return;

        const saved = loadFromStorage();
        if (saved) {
          window.luckysheet?.create({
            container: container.id,
            title: '存货人Excel编辑',
            lang: 'zh',
            data: saved.data
          });
        } else {
          const owners = await fetchAllOwners();
          const header = ['公司名称','存货人编码','统一社会信用代码','联系人','电话','地址','营业执照','法人公章'];
          const data: any[] = owners.map((o: any) => [o.company, o.code || '', o.creditCode || '', o.contact, o.phone, o.address, o.license || '', o.seal || '']);
          window.luckysheet?.create({
            container: container.id,
            title: '存货人Excel编辑',
            lang: 'zh',
            data: [
              {
                name: '存货人',
                row: Math.max(60, data.length + 10),
                column: header.length,
                celldata: toCellData([[...header], ...data])
              }
            ]
          });
        }
        isReady.value = true;
        startAutosave();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    });

    onBeforeUnmount(() => {
      mounted = false;
      stopAutosave();
    });

    function toCellData(matrix: any[][]) {
      const cells: any[] = [];
      for (let r = 0; r < matrix.length; r++) {
        const row = matrix[r];
        for (let c = 0; c < row.length; c++) {
          const v = row[c];
          if (v == null || v === '') continue;
          cells.push({ r, c, v: { v: String(v) } });
        }
      }
      return cells;
    }

    async function fetchAllOwners() {
      const params = new URLSearchParams({ page: '1', pageSize: '99999' });
      const res = await fetch(`/api/inventory-owner/list?${params.toString()}`);
      const json = await res.json();
      return json?.data?.list || [];
    }

    async function syncToSystem() {
      if (!window.luckysheet || syncing.value) return;
      syncing.value = true;
      try {
        const file = window.luckysheet.getLuckysheetfile?.();
        const sheet = Array.isArray(file) ? file[0] : null;
        if (!sheet) return alert('未找到数据');
        const get = (r: number, c: number) => String(sheet.data?.[r]?.[c]?.v || '').trim();
        // 第0行是表头
        const rows: any[] = [];
        for (let r = 1; r < (sheet.data?.length || 0); r++) {
          const company = get(r, 0);
          const code = get(r, 1);
          const creditCode = get(r, 2);
          const contact = get(r, 3);
          const phone = get(r, 4);
          const address = get(r, 5);
          const license = get(r, 6);
          const seal = get(r, 7);
          if (!company && !code && !contact && !phone && !address && !license && !seal) continue;
          if (!company || !code) continue; // 必填
          rows.push({ company, code, creditCode, contact, phone, address, license, seal });
        }
        // 现有数据
        const existing = await fetchAllOwners();
        const key = (o: any) => `${String(o.company).trim()}__${String(o.code||'').trim()}`;
        const byKey = new Map(existing.map((o: any) => [key(o), o]));
        const excelKeys = new Set(rows.map(key));
        // 逐条 upsert
        for (const row of rows) {
          const found = byKey.get(key(row));
          if (found) {
            await fetch('/api/inventory-owner/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: found.id, ...row }) });
          } else {
            await fetch('/api/inventory-owner/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(row) });
          }
        }
        // 镜像删除：Excel中不存在的，执行删除
        if (mirror.value) {
          const toDelete = existing.filter((o: any) => !excelKeys.has(key(o)));
          for (const item of toDelete) {
            await fetch('/api/inventory-owner/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id }) });
          }
        }
        alert('同步成功');
      } catch (e) {
        console.error(e);
        alert('同步失败');
      } finally {
        syncing.value = false;
      }
    }

    function saveToStorage() {
      if (!window.luckysheet) return;
      try {
        const data = window.luckysheet.getLuckysheetfile?.();
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ data }));
      } catch {}
    }
    function loadFromStorage(): any | null {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    }
    function startAutosave() {
      stopAutosave();
      autosaveTimer = setInterval(saveToStorage, 5000);
      window.addEventListener('beforeunload', saveToStorage);
    }
    function stopAutosave() {
      if (autosaveTimer) clearInterval(autosaveTimer);
      autosaveTimer = null;
      window.removeEventListener('beforeunload', saveToStorage as any);
    }

    function btnStyle() {
      return { padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f8fafc', cursor: 'pointer' } as any;
    }
    function btnPrimary() {
      return { padding: '6px 10px', border: '1px solid #60a5fa', color: '#0f172a', borderRadius: '8px', background: '#eaf2ff', cursor: 'pointer' } as any;
    }

    function exportCsvServer() {
      const url = `/api/inventory-owner/export`;
      const link = document.createElement('a');
      link.href = url;
      link.download = '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    async function exportCsvClient() {
      const params = new URLSearchParams({ page: '1', pageSize: '99999' });
      const res = await fetch(`/api/inventory-owner/list?${params.toString()}`);
      const data = await res.json();
      const rows: any[] = data?.data?.list || [];
      const header = ['公司名称','联系人','电话','地址','营业执照','法人公章'];
      const toCell = (v: any) => {
        const s = String(v ?? '');
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      };
      const lines = [header.join(',')].concat(
        rows.map(r => [r.company, r.contact, r.phone, r.address, r.license, r.seal].map(toCell).join(','))
      );
      const csv = '\ufeff' + lines.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory-owners-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    function goCreateOwner() {
      router.push('/operation/inventory-users/create');
    }

    return () => h('div', { style: { height: 'calc(100vh - 80px)' } }, [
      h('div', { style: { position: 'sticky', top: '0', zIndex: '10', padding: '8px 0', display: 'flex', gap: '8px', background: '#fff', flexWrap: 'wrap', alignItems: 'center' } }, [
        h('button', { disabled: !isReady.value || syncing.value, onClick: syncToSystem, style: btnPrimary() }, syncing.value ? '同步中…' : '同步到系统'),
        h('label', { style: { display: 'inline-flex', alignItems: 'center', gap: '6px' } }, [
          h('input', { type: 'checkbox', checked: mirror.value, onChange: (e: any) => mirror.value = !!e?.target?.checked }),
          h('span', {}, '镜像删除')
        ]),
        h('button', { disabled: !isReady.value, onClick: saveToStorage, style: btnStyle() }, '保存'),
        h('button', { disabled: !isReady.value, onClick: goCreateOwner, style: btnStyle() }, '新增存货人'),
        h('button', { disabled: !isReady.value, onClick: exportCsvClient, style: btnStyle() }, '导出CSV'),
        h('button', { disabled: !isReady.value, onClick: exportCsvServer, style: btnStyle() }, '服务端导出')
      ]),
      h('div', {
        id: 'luckysheet-owner',
        ref: (el: any) => (container = el as HTMLDivElement),
        style: { height: 'calc(100% - 44px)', width: '100%', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }
      })
    ]);
  }
});


