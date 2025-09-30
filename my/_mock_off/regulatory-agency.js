let agencies = [
  { id: 1, name: '国家监管局', contact: '王局', phone: '010-88886666', address: '北京市东城区' },
  { id: 2, name: '省级监管局', contact: '李处', phone: '021-66668888', address: '上海市黄浦区' }
];

export default [
  {
    url: '/api/regulatory-agency/list',
    method: 'get',
    response: ({ query }) => {
      const keyword = (query?.keyword || '').toString().trim().toLowerCase();
      const page = parseInt(query?.page || '1', 10) || 1;
      const pageSize = parseInt(query?.pageSize || '10', 10) || 10;
      const sortBy = (query?.sortBy || '').toString();
      const sortOrder = (query?.sortOrder || 'asc').toString().toLowerCase() === 'desc' ? 'desc' : 'asc';
      const filtered = keyword ? agencies.filter(a => [a.name, a.contact, a.phone, a.address].some(v => String(v||'').toLowerCase().includes(keyword))) : agencies;
      const sorted = sortBy ? [...filtered].sort((a,b)=>{
        const av = a[sortBy]; const bv = b[sortBy];
        const as = String(av ?? '').toLowerCase(); const bs = String(bv ?? '').toLowerCase();
        if (as===bs) return 0; return sortOrder==='asc' ? (as>bs?1:-1) : (as<bs?1:-1);
      }) : filtered;
      const total = sorted.length; const start = (page-1)*pageSize; const list = sorted.slice(start, start+pageSize);
      return { code: 0, data: { list, total, page, pageSize } };
    }
  },
  {
    url: '/api/regulatory-agency/create', method: 'post', response: ({ body }) => {
      const id = Math.max(0, ...agencies.map(x=>x.id)) + 1; const item = { id, ...body }; agencies.push(item);
      return { code: 0, data: item, msg: '创建成功' };
    }
  },
  {
    url: '/api/regulatory-agency/update', method: 'post', response: ({ body }) => {
      const idx = agencies.findIndex(x=>x.id==body.id); if (idx===-1) return { code:1, msg:'未找到' };
      agencies[idx] = { ...agencies[idx], ...body }; return { code:0, data: agencies[idx], msg:'更新成功' };
    }
  },
  {
    url: '/api/regulatory-agency/delete', method: 'post', response: ({ body }) => {
      agencies = agencies.filter(x=>x.id!=body.id); return { code:0, msg:'删除成功' };
    }
  },
  {
    url: '/api/regulatory-agency/export', method: 'get', rawResponse: async (req, res) => {
      const { URL } = await import('url'); const u = new URL(req.url, 'http://localhost');
      const keyword = (u.searchParams.get('keyword')||'').toString().trim().toLowerCase();
      const sortBy = (u.searchParams.get('sortBy')||'').toString(); const sortOrder = (u.searchParams.get('sortOrder')||'asc').toString().toLowerCase()==='desc'?'desc':'asc';
      const filtered = keyword ? agencies.filter(a => [a.name, a.contact, a.phone, a.address].some(v => String(v||'').toLowerCase().includes(keyword))) : agencies;
      const sorted = sortBy ? [...filtered].sort((a,b)=>{ const as=String(a[sortBy]??'').toLowerCase(); const bs=String(b[sortBy]??'').toLowerCase(); if(as===bs) return 0; return sortOrder==='asc'?(as>bs?1:-1):(as<bs?1:-1); }) : filtered;
      const header = ['机构名称','联系人','电话','地址'];
      const lines = [header.join(',')].concat(sorted.map(r => [r.name,r.contact,r.phone,r.address].map(v=>String(v??'').replace(/"/g,'""')).map(s=>/[",\n]/.test(s)?'"'+s+'"':s).join(',')));
      const csv='\ufeff'+lines.join('\n'); const asciiName = `regulatory-agencies-${Date.now()}.csv`;
      res.statusCode=200; res.setHeader('Content-Type','text/csv; charset=utf-8'); res.setHeader('Content-Disposition',`attachment; filename="${asciiName}"`); res.end(csv);
    }
  }
];








