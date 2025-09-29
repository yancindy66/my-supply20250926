import { defineComponent, h, onMounted, onBeforeUnmount, ref } from 'vue';

declare global { interface Window { luckysheet?: any; } }

async function loadScriptAny(sources: string[]): Promise<void> {
  let lastErr: any;
  for (const src of sources) {
    try {
      await new Promise<void>((resolve, reject) => {
        const el = document.createElement('script');
        el.src = src;
        el.async = true;
        el.onload = () => resolve();
        el.onerror = () => reject(new Error('Failed to load ' + src));
        document.head.appendChild(el);
      });
      return;
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('Failed to load scripts');
}

async function loadStyleAny(sources: string[]): Promise<void> {
  let lastErr: any;
  for (const href of sources) {
    try {
      await new Promise<void>((resolve, reject) => {
        const el = document.createElement('link');
        el.rel = 'stylesheet';
        el.href = href;
        el.onload = () => resolve();
        el.onerror = () => reject(new Error('Failed to load ' + href));
        document.head.appendChild(el);
      });
      return;
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('Failed to load styles');
}

export default defineComponent({
  name: 'ExcelSheet',
  setup() {
    let container: HTMLDivElement | null = null;
    let mounted = false;
    const isReady = ref(false);
    let autosaveTimer: any = null;

    const STORAGE_KEY = 'excel_sheet_luckysheet_file_v1';

    onMounted(async () => {
      mounted = true;
      try {
        const useLocal = (import.meta as any)?.env?.VITE_LS_ASSET === 'local';
        const localBase = '/vendor/luckysheet';
        const cssPlugins = useLocal
          ? [ `${localBase}/plugins/css/pluginsCss.css` ]
          : [ `${localBase}/plugins/css/pluginsCss.css`, 'https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/plugins/css/pluginsCss.css', 'https://unpkg.com/luckysheet@2.1.13/dist/plugins/css/pluginsCss.css' ];
        const cssBundle = useLocal
          ? [ `${localBase}/plugins/plugins.css` ]
          : [ `${localBase}/plugins/plugins.css`, 'https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/plugins/plugins.css', 'https://unpkg.com/luckysheet@2.1.13/dist/plugins/plugins.css' ];
        const cssMain = useLocal
          ? [ `${localBase}/css/luckysheet.css` ]
          : [ `${localBase}/css/luckysheet.css`, 'https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/css/luckysheet.css', 'https://unpkg.com/luckysheet@2.1.13/dist/css/luckysheet.css' ];
        const jsPlugin = useLocal
          ? [ `${localBase}/plugins/js/plugin.js` ]
          : [ `${localBase}/plugins/js/plugin.js`, 'https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/plugins/js/plugin.js', 'https://unpkg.com/luckysheet@2.1.13/dist/plugins/js/plugin.js' ];
        const jsMain = useLocal
          ? [ `${localBase}/luckysheet.umd.js` ]
          : [ `${localBase}/luckysheet.umd.js`, 'https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/luckysheet.umd.js', 'https://unpkg.com/luckysheet@2.1.13/dist/luckysheet.umd.js' ];
        const jsLuckyExcel = useLocal
          ? [ `${localBase}/luckyexcel.umd.js` ]
          : [ `${localBase}/luckyexcel.umd.js`, 'https://cdn.jsdelivr.net/npm/luckyexcel@1.0.1/dist/luckyexcel.umd.js', 'https://unpkg.com/luckyexcel@1.0.1/dist/luckyexcel.umd.js' ];

        await loadStyleAny(cssPlugins);
        await loadStyleAny(cssBundle);
        await loadStyleAny(cssMain);
        await loadScriptAny(jsPlugin);
        await loadScriptAny(jsMain);
        await loadScriptAny(jsLuckyExcel);
        if (!mounted || !container) return;
        const saved = loadFromStorage();
        const commonOptions = {
          container: container.id,
          lang: 'zh',
          showRowHead: true,
          showColumnHead: true,
          showtoolbar: true,
          showinfobar: true,
          showsheetbar: true,
          showstatisticBar: true,
          enableAddRow: true,
          enableAddCol: true,
          allowEdit: true,
          // 暂停所有插件，避免第三方插件注册缺失导致 Ry[e] 报错
          plugins: [],
          showtoolbarConfig: {
            undoRedo: true,
            paintFormat: true,
            currencyFormat: true,
            percentageFormat: true,
            numberDecrease: true,
            numberIncrease: true,
            moreFormats: true,
            font: true,
            fontSize: true,
            bold: true,
            italic: true,
            strikethrough: true,
            underline: true,
            textColor: true,
            fillColor: true,
            border: true,
            mergeCell: true,
            horizontalAlignMode: true,
            verticalAlignMode: true,
            textWrapMode: true,
            textRotateMode: true,
            freeze: true,
            sortAndFilter: true,
            conditionalFormat: true,
            dataVerification: true,
            findAndReplace: true,
            splitColumn: true,
            screenshot: true,
            link: true,
            image: true,
            chart: true,
            protection: true,
            print: true
          }
        } as any;

        if (saved) {
          window.luckysheet?.create({
            ...commonOptions,
            title: saved.title || 'Excel表',
            data: saved.data
          });
        } else {
          window.luckysheet?.create({
            ...commonOptions,
            title: 'Excel表',
            data: [
              { name: 'Sheet1', row: 60, column: 26 },
              { name: 'Sheet2', row: 60, column: 26 }
            ]
          });
        }
        isReady.value = true;
        startAutosave();
        // 强制调整尺寸，避免表头/工具栏被裁切
        setTimeout(() => {
          try { (window as any).luckysheet?.resize?.(); } catch {}
        }, 0);
        try {
          const style = document.createElement('style');
          style.textContent = `
            .luckysheet-toolbar-box { overflow: auto !important; }
            .luckysheet-toolbar-box .luckysheet-toolbar { display:flex; flex-wrap: wrap; row-gap: 6px; }
            .luckysheet-statistic { display:block !important; }
          `;
          document.head.appendChild(style);
        } catch {}
        // 自适应窗口，避免表头被裁切
        const onResize = () => {
          try { (window as any).luckysheet?.resize?.(); } catch {}
        };
        window.addEventListener('resize', onResize);
        // @ts-ignore
        ;(window as any).__ls_onresize__ = onResize;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    });

    onBeforeUnmount(() => {
      mounted = false;
      stopAutosave();
      // 清理 resize 监听
      // @ts-ignore
      const onResize = (window as any).__ls_onresize__;
      if (onResize) window.removeEventListener('resize', onResize);
    });

    function triggerOpenFile() {
      const input = document.getElementById('excel-import-input') as HTMLInputElement | null;
      input?.click();
    }

    function onImportChange(e: Event) {
      const input = e.target as HTMLInputElement;
      const file = (input.files && input.files[0]) || null;
      if (!file) return;
      const name = file.name.toLowerCase();
      if (!/\.(xlsx?|csv)$/.test(name)) {
        alert('仅支持导入 .xls/.xlsx/.csv 文件');
        input.value = '';
        return;
      }
      // @ts-ignore
      const LuckyExcel = (window as any).LuckyExcel;
      if (!LuckyExcel) {
        alert('导入模块未就绪，请稍后重试');
        return;
      }
      LuckyExcel.transformExcelToLucky(file, (exportJson: any) => {
        if (!exportJson || !exportJson.sheets || exportJson.sheets.length === 0) {
          alert('解析失败，文件内容为空');
          return;
        }
        window.luckysheet?.destroy?.();
        window.luckysheet?.create({
          container: 'luckysheet-container',
          title: exportJson.info?.name || 'Excel表',
          lang: 'zh',
          data: exportJson.sheets
        });
      });
      input.value = '';
    }

    function exportExcel() {
      // @ts-ignore
      const LuckyExcel = (window as any).LuckyExcel;
      if (!LuckyExcel || !window.luckysheet) {
        alert('导出模块未就绪');
        return;
      }
      const luckysheetfile = window.luckysheet.getLuckysheetfile?.();
      LuckyExcel.transformLuckyToExcel(luckysheetfile, 'excel导出.xlsx');
    }

    function addSheet() {
      if (!window.luckysheet) return;
      const idx = window.luckysheet.getAllSheets?.().length || 1;
      window.luckysheet.insertSheet({ index: idx, name: 'Sheet' + (idx + 1) });
    }

    function clearSheet() {
      if (!window.luckysheet) return;
      const file = window.luckysheet.getLuckysheetfile?.();
      const cur = window.luckysheet.getSheet?.();
      if (!cur) return;
      window.luckysheet.clearRange?.({ range: [{ row: [0, cur.row - 1], column: [0, cur.column - 1] }] });
    }

    return () => h('div', { style: { height: 'calc(100vh - 80px)' } }, [
      h('div', { style: { position: 'sticky', top: '0', zIndex: '10', padding: '8px 0', display: 'flex', gap: '8px', background: '#fff' } }, [
        h('button', { disabled: !isReady.value, onClick: triggerOpenFile, style: btnStyle() }, '导入Excel'),
        h('input', { id: 'excel-import-input', type: 'file', accept: '.xls,.xlsx,.csv', style: { display: 'none' }, onChange: onImportChange }),
        h('button', { disabled: !isReady.value, onClick: exportExcel, style: btnStyle() }, '导出Excel'),
        h('button', { disabled: !isReady.value, onClick: addSheet, style: btnStyle() }, '新增Sheet'),
        h('button', { disabled: !isReady.value, onClick: clearSheet, style: btnStyle() }, '清空当前Sheet'),
        h('button', { disabled: !isReady.value, onClick: saveToStorage, style: btnPrimary() }, '保存')
      ]),
      h('div', {
        id: 'luckysheet-container',
        ref: (el: any) => (container = el as HTMLDivElement),
        style: { height: 'calc(100% - 44px)', width: '100%', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }
      })
    ]);

    function btnStyle() {
      return { padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f8fafc', cursor: 'pointer' } as any;
    }

    function btnPrimary() {
      return { padding: '6px 10px', border: '1px solid #60a5fa', color: '#0f172a', borderRadius: '8px', background: '#eaf2ff', cursor: 'pointer' } as any;
    }

    function getCurrentFile() {
      if (!window.luckysheet) return null;
      const data = window.luckysheet.getLuckysheetfile?.();
      if (!data) return null;
      const title = 'Excel表';
      return { title, data };
    }

    function saveToStorage() {
      const content = getCurrentFile();
      if (!content) return;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
      } catch {}
    }

    function loadFromStorage(): any | null {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }

    function startAutosave() {
      stopAutosave();
      autosaveTimer = setInterval(() => saveToStorage(), 5000);
      window.addEventListener('beforeunload', saveToStorage);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') saveToStorage();
      });
    }

    function stopAutosave() {
      if (autosaveTimer) clearInterval(autosaveTimer);
      autosaveTimer = null;
      window.removeEventListener('beforeunload', saveToStorage as any);
    }
  }
});


