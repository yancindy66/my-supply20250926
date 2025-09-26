import http from './http';
import type { ApiResponse } from './http';
import type { InventoryOwner, OwnerListQuery, OwnerListResult } from '../types/inventoryOwner';

export async function listOwners(params: OwnerListQuery): Promise<OwnerListResult> {
  const res = await http.get<ApiResponse<{ list: InventoryOwner[]; total: number; page: number; pageSize: number }>>('/api/inventory-owner/list', { params });
  if ((res as any).code === 0) {
    return (res as any).data as OwnerListResult;
  }
  throw new Error((res as any).msg || '获取列表失败');
}

export async function getOwnerDetail(id: number): Promise<InventoryOwner> {
  const res = await http.get<ApiResponse<InventoryOwner>>('/api/inventory-owner/detail', { params: { id } });
  if ((res as any).code === 0) {
    return (res as any).data as InventoryOwner;
  }
  throw new Error((res as any).msg || '获取详情失败');
}

export async function createOwner(payload: Omit<InventoryOwner, 'id'>): Promise<InventoryOwner> {
  const res = await http.post<ApiResponse<InventoryOwner>>('/api/inventory-owner/create', payload);
  if ((res as any).code === 0) {
    return (res as any).data as InventoryOwner;
  }
  // 容错：部分 mock 可能直接返回 data
  if ((res as any).data) return (res as any).data as InventoryOwner;
  throw new Error((res as any).msg || '创建失败');
}

export async function updateOwner(payload: Partial<InventoryOwner> & { id: number }): Promise<InventoryOwner> {
  const res = await http.post<ApiResponse<InventoryOwner>>('/api/inventory-owner/update', payload);
  if ((res as any).code === 0) {
    return (res as any).data as InventoryOwner;
  }
  throw new Error((res as any).msg || '更新失败');
}

export async function deleteOwner(id: number): Promise<void> {
  const res = await http.post<ApiResponse>('/api/inventory-owner/delete', { id });
  if ((res as any).code === 0) return;
  throw new Error((res as any).msg || '删除失败');
}

export function exportOwnersServerUrl(params: OwnerListQuery): string {
  const usp = new URLSearchParams({
    keyword: params.keyword || '',
    sortBy: params.sortBy || '',
    sortOrder: params.sortOrder || 'asc'
  });
  return `/api/inventory-owner/export?${usp.toString()}`;
}

export function ownerFileUrl(id: number, type: 'license' | 'seal', filename?: string): string {
  const usp = new URLSearchParams({ id: String(id), type, filename: filename || '' });
  return `/api/inventory-owner/file?${usp.toString()}`;
}

