import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';

export interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg?: string;
}

const apiBase = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_BASE)
  ? String((import.meta as any).env.VITE_API_BASE)
  : '';

const http: AxiosInstance = axios.create({
  baseURL: apiBase,
  timeout: 10000,
  headers: { 'Accept': 'application/json' }
});

http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response.data as any;
  },
  (error) => Promise.reject(error)
);

// 请求拦截：自动附带 token
http.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any)['Authorization'] = `Bearer ${token}`;
    }
  } catch {}
  return config;
});

export default http;

