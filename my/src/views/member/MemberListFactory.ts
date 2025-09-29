import { ref, onMounted, computed } from 'vue';

export interface ColumnDef<T> {
  key: keyof T | string;
  title: string;
}

export function useListPage<T>(fetcher: (q:any)=>Promise<any>) {
  const rows = ref<T[]>([]);
  const keyword = ref('');
  const page = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  const sortBy = ref('');
  const sortOrder = ref<'asc'|'desc'>('asc');
  const loading = ref(false);

  const totalPages = computed(()=> Math.max(1, Math.ceil(total.value / pageSize.value)));

  async function load(){
    loading.value = true;
    try{
      const data = await fetcher({ keyword: keyword.value, page: page.value, pageSize: pageSize.value, sortBy: sortBy.value, sortOrder: sortOrder.value });
      const d = (data as any).data || data;
      rows.value = d.list || [];
      total.value = d.total || 0;
    } finally { loading.value = false; }
  }

  function onSearch(){ page.value=1; load(); }
  function goPrev(){ if(page.value>1){ page.value--; load(); } }
  function goNext(){ if(page.value<totalPages.value){ page.value++; load(); } }
  function toggleSort(field: string){
    if (sortBy.value===field) sortOrder.value = sortOrder.value==='asc'?'desc':'asc';
    else { sortBy.value = field; sortOrder.value='asc'; }
    page.value=1; load();
  }
  function sortIndicator(field:string){ return sortBy.value===field ? (sortOrder.value==='asc'?'↑':'↓') : ''; }

  onMounted(load);
  return { rows, keyword, page, pageSize, total, sortBy, sortOrder, totalPages, loading, load, onSearch, goPrev, goNext, toggleSort, sortIndicator };
}








