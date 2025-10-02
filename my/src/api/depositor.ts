import http from './http';

export interface ApiResp<T=any> { code: number; data: T; message?: string }

export interface UserReq {
  username: string;
  password: string;
  name: string;
  type: 'depositor'|'warehouse'|'financial'|'guarantee'|'qc'|'platform';
  company_name: string;
  unified_social_credit_code: string;
}

export interface InboundReservationReq {
  target_warehouse_id: number;
  commodity_id: number;
  total_planned_quantity: number;
  measurement_unit: string;
  expected_arrival_date?: string;
  remarks?: string;
  // 扩展字段（前端已使用，后端demo已支持）
  transport_mode?: 'car'|'ship'|'air'|'train'|string;
  weigh_mode?: 'by_pack'|'by_weight'|string;
  pack_count?: number|null;
  convert_ratio?: number|null;
  weighing_fee?: number|null;
  expected_arrival_start?: string|null;
  expected_arrival_end?: string|null;
  require_weighing?: boolean;
  logistics_carrier?: string;
  vehicle_plate?: string;
  driver_name?: string;
  driver_phone?: string;
  driver_id_card?: string;
  goods_source?: string;
  source_address?: string;
  batch_number?: string;
}

export interface InboundReservation extends InboundReservationReq {
  reservation_number: string;
  status: 'draft'|'submitted'|'warehouse_confirmed'|'platform_approved'|'fully_completed'|'cancelled';
}

export interface InboundOrder {
  order_no: string;
  reservation_number: string;
  status: 'created'|'receiving'|'completed'|'cancelled';
  received_quantity?: number;
  unit?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WarehouseReceipt {
  id?: number;
  receipt_number: string;
  receipt_name?: string;
  depositor_id: number;
  warehouse_id: number;
  commodity_id: number;
  related_reservation_id?: number;
  quantity: number;
  measurement_unit: string;
  storage_location?: string;
  status?: 'pending'|'in_stock'|'pledged'|'frozen'|'transferring'|'outbound'|'completed';
  effective_start?: string;
  effective_end?: string;
}

export interface PledgeRecord {
  id?: number;
  record_number: string;
  warehouse_receipt_id: number;
  storage_in_id: number;
  pledge_type: 'full_pledge'|'partial_pledge';
  pledge_status?: 'active'|'frozen'|'released'|'disposed';
  pledged_quantity: number;
  pledged_unit: string;
  pledged_value?: number;
  freeze_status?: 'frozen'|'partially_released'|'fully_released';
}

// 注册存货人
export function registerDepositor(payload: UserReq) {
  return http.post<ApiResp<{id:number;username:string;status:number}>>('/v1/depositors/register', payload);
}

// 新建入库预约
export function createReservation(payload: InboundReservationReq) {
  return http.post<ApiResp>('/v1/inbound/reservations', payload);
}

// 入库预约列表
export function listReservations(params: { page?: number; pageSize?: number; keyword?: string }) {
  return http.get<ApiResp<{list: InboundReservation[]; total:number}>>('/v1/inbound/reservations', { params });
}

export function getReservation(id: string|number){
  return http.get<ApiResp<any>>(`/v1/inbound/reservations/${id}`);
}
export function updateReservation(id: string|number, data: Partial<InboundReservationReq & { status?: string }>) {
  return http.put<ApiResp<any>>(`/v1/inbound/reservations/${id}`, data);
}
export function deleteReservation(id: string|number){
  return http.delete<ApiResp>(`/v1/inbound/reservations/${id}`);
}

// 通用文档上传（demo）：将已生成的PDF占位上传到仓库
export function uploadReservationPdf(reservationId: string|number, url: string, filename = 'reservation.pdf'){
  return http.post<ApiResp<{id:number}>>('/v1/docs/upload', { scope:'reservation', ref_id:String(reservationId), doc_type:'reservation_pdf', url, filename });
}

// 通用预约单文档上传（支持图片等）
export function uploadReservationDoc(reservationId: string|number, url: string, filename = 'file', docType: string = 'generic'){
  return http.post<ApiResp<{id:number}>>('/v1/docs/upload', { scope:'reservation', ref_id:String(reservationId), doc_type:docType, url, filename });
}

// 门岗核验相关（demo）
export function getReservationByCode(code: string){
  return http.get<ApiResp<any>>('/v1/inbound/reservations/by-code/'+encodeURIComponent(code));
}
export function gateVerifyWechat(payload: { reservation_code: string; driver_phone: string; vehicle_plate?: string; wechat_openid?: string }){
  return http.post<ApiResp<{ ok:boolean; inbound_order_no:string; reservation:any; phoneMatched:boolean }>>('/v1/inbound/gate/verify/wechat', payload);
}
export function listAlerts(){
  return http.get<ApiResp<{ list:any[]; total:number }>>('/v1/alerts');
}

// 入库单列表
export function listInboundOrders(params: { page?: number; pageSize?: number; reservation_number?: string }) {
  return http.get<ApiResp<{list: InboundOrder[]; total:number}>>('/v1/inbound/orders', { params });
}

// 新建入库申请（入库单）
export function createInboundOrder(payload: { reservation_number?: string; planned_quantity: number; measurement_unit: string }) {
  return http.post<ApiResp<number>>('/v1/inbound/orders', payload);
}

export function getInboundOrder(id: string){ return http.get<ApiResp<any>>('/v1/inbound/orders/'+id); }
export function updateInboundOrder(id: string, data: any){ return http.put<ApiResp<any>>('/v1/inbound/orders/'+id, data); }
export function deleteInboundOrder(id: string){ return http.delete<ApiResp>('/v1/inbound/orders/'+id); }

export function approveInboundOrder(id: string){ return http.post<ApiResp>('/v1/inbound/orders/'+id+'/approve', {}); }
export function rejectInboundOrder(id: string){ return http.post<ApiResp>('/v1/inbound/orders/'+id+'/reject', {}); }
export function cancelReservationApi(id: string|number){ return http.post<ApiResp>('/v1/inbound/reservations/'+id+'/cancel', {}); }

export function submitInboundOrder(id: string){ return http.post<ApiResp>('/v1/inbound/orders/'+id+'/submit', {}); }
export function withdrawInboundOrder(id: string){ return http.post<ApiResp>('/v1/inbound/orders/'+id+'/withdraw', {}); }
export function cancelInboundOrder(id: string){ return http.post<ApiResp>('/v1/inbound/orders/'+id+'/cancel', {}); }
export function arrivalInboundOrder(id: string){ return http.post<ApiResp>('/v1/inbound/orders/'+id+'/arrival', {}); }
export function finishInboundOrder(id: string){ return http.post<ApiResp>('/v1/inbound/orders/'+id+'/finish', {}); }

// 仓单列表
export function listWarehouseReceipts(params: { page?: number; pageSize?: number; status?: string }) {
  return http.get<ApiResp<{list: WarehouseReceipt[]; total:number}>>('/v1/warehouse-receipts', { params });
}

// 新增仓单
export function createWarehouseReceipt(payload: WarehouseReceipt) {
  return http.post<ApiResp<number>>('/v1/warehouse-receipts', payload);
}

// 仓单详情
export function getWarehouseReceipt(id: number) {
  return http.get<ApiResp<WarehouseReceipt>>(`/v1/warehouse-receipts/${id}`);
}

// 创建质押记录
export function createPledgeRecord(payload: PledgeRecord) {
  return http.post<ApiResp<number>>('/v1/pledges', payload);
}

// 质押记录列表
export function listPledgeRecords(params: { page?: number; pageSize?: number; warehouse_receipt_id?: number }) {
  return http.get<ApiResp<{list: PledgeRecord[]; total:number}>>('/v1/pledges', { params });
}
