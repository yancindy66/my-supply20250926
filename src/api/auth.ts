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








