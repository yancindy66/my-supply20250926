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








