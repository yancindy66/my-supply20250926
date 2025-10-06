import http from './http';

export function makeCrud(base: string) {
  return {
    list: (params: any) => http.get<any>(`${base}/list`, { params }),
    detail: (id: number) => http.get<any>(`${base}/detail`, { params: { id } }),
    create: (payload: any) => http.post<any>(`${base}/create`, payload),
    update: (payload: any) => http.post<any>(`${base}/update`, payload),
    delete: (id: number) => http.post<any>(`${base}/delete`, { id })
  };
}

export const financialApi = makeCrud('/api/member/financial');
export const guaranteeApi = makeCrud('/api/member/guarantee');
export const qualityApi = makeCrud('/api/member/quality');
export const warehouseApi = makeCrud('/api/member/warehouse');








