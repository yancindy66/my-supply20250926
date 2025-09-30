import http from './http';

export interface LoginReq { username: string; password: string }
export interface LoginResp { token: string; user_id: number; expires_in: number }

export function login(payload: LoginReq) {
  return http.post<{ code: number; data: LoginResp }>('/v1/auth/login', payload);
}

export interface MeResp {
  user: { id: number; name: string; username: string; organization_id?: number|null; type: 'depositor'|'warehouse'|'financial'|'guarantee'|'qc'|'regulator'|'platform' };
  roles: Array<{ id: number; role_key: string; role_name: string }>;
  permissions: string[];
  data_scope: 'self'|'department'|'department_and_sub'|'organization'|'warehouse'|'platform_summary';
}

export function me() {
  return http.get<MeResp>('/v1/auth/me');
}

import http from './http';

export interface LoginPayload {
  role: 'operation' | 'financial' | 'warehouse' | 'inventory' | 'guarantee';
  username: string;
  password?: string;
  code?: string;
}

export interface LoginResult {
  token: string;
  role: LoginPayload['role'];
  user: { id: number; name: string };
}

export async function login(payload: LoginPayload): Promise<LoginResult> {
  const res: any = await http.post('/api/auth/login', payload);
  if (res?.code === 0) return res.data as LoginResult;
  throw new Error(res?.msg || '登录失败');
}








