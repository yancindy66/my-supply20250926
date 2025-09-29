import http from './http';
import type { ApiResponse } from './http';
import type { RegulatoryAgency, RegAgencyListQuery, RegAgencyListResult } from '../types/regulatoryAgency';

export async function listRegAgencies(params: RegAgencyListQuery): Promise<RegAgencyListResult> {
  const res = await http.get<ApiResponse<{ list: RegulatoryAgency[]; total: number; page: number; pageSize: number }>>('/api/regulatory-agency/list', { params });
  if ((res as any).code === 0) return (res as any).data as RegAgencyListResult;
  throw new Error((res as any).msg || '获取列表失败');
}

export async function createRegAgency(payload: Omit<RegulatoryAgency, 'id'>): Promise<RegulatoryAgency> {
  const res = await http.post<ApiResponse<RegulatoryAgency>>('/api/regulatory-agency/create', payload);
  if ((res as any).code === 0) return (res as any).data as RegulatoryAgency;
  throw new Error((res as any).msg || '创建失败');
}

export async function updateRegAgency(payload: Partial<RegulatoryAgency> & { id: number }): Promise<RegulatoryAgency> {
  const res = await http.post<ApiResponse<RegulatoryAgency>>('/api/regulatory-agency/update', payload);
  if ((res as any).code === 0) return (res as any).data as RegulatoryAgency;
  throw new Error((res as any).msg || '更新失败');
}

export async function deleteRegAgency(id: number): Promise<void> {
  const res = await http.post<ApiResponse>('/api/regulatory-agency/delete', { id });
  if ((res as any).code === 0) return;
  throw new Error((res as any).msg || '删除失败');
}

export function exportRegAgenciesUrl(params: RegAgencyListQuery): string {
  const usp = new URLSearchParams({
    keyword: params.keyword || '',
    sortBy: params.sortBy || '',
    sortOrder: params.sortOrder || 'asc'
  });
  return `/api/regulatory-agency/export?${usp.toString()}`;
}








