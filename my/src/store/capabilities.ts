import { ref } from 'vue';
import http from '@/api/http';

export const capabilities = ref<any>({});

export async function initCapabilities(): Promise<void> {
  try {
    const resp: any = await http.get('/v1/auth/me');
    const caps = resp?.capabilities || {};
    capabilities.value = caps;
    try { localStorage.setItem('capabilities', JSON.stringify(caps)); } catch {}
  } catch {
    try {
      const cached = localStorage.getItem('capabilities');
      capabilities.value = cached ? JSON.parse(cached) : {};
    } catch { capabilities.value = {}; }
  }
}


