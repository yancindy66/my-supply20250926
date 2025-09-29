import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';

export interface ApiResponse<T = any> {
  code: number;
  data: T;
  msg?: string;
}

const http: AxiosInstance = axios.create({
  baseURL: '',
  timeout: 10000,
  headers: { 'Accept': 'application/json' }
});

http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response.data as any;
  },
  (error) => Promise.reject(error)
);

export default http;

