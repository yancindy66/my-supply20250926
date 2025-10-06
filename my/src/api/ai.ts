import http from './http';

export interface AiRecognizePayload {
  dataUrl: string;
  docType?: 'business_license' | 'id_card' | 'other';
}

export interface AiRecognizeResult {
  company?: string;
  creditCode?: string;
  address?: string;
}

export async function recognizeByGpt(payload: AiRecognizePayload): Promise<{ ok: boolean; data?: AiRecognizeResult; msg?: string }>{
  try {
    const res = await http.post<any>('/api/ai/recognize', payload);
    // 兼容 mock {code,data,msg}
    if (res && (res.code === 0 || res.ok)) {
      const data = (res.data || res.result || res);
      return { ok: true, data };
    }
    return { ok: false, msg: res?.msg || 'AI 识别失败' };
  } catch (e: any) {
    return { ok: false, msg: e?.message || 'AI 识别异常' };
  }
}








