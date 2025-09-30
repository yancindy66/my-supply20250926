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

// 入库单列表
export function listInboundOrders(params: { page?: number; pageSize?: number; reservation_number?: string }) {
  return http.get<ApiResp<{list: InboundOrder[]; total:number}>>('/v1/inbound/orders', { params });
}

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
