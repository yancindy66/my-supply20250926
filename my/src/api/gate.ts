import http from '@/api/http';

/**
 * 创建预约单
 * @param data - 预约载荷：如 owner_name, target_warehouse_id, commodity_id, expected_arrival_start, vehicle_plate, status 等
 * @returns Axios 响应 Promise
 */
export function apiCreateReservation(data: any) {
  return http.post('/v1/inbound/reservations', data);
}

/**
 * 创建入库单
 * @param data - 入库单载荷：如 reservation_number, vehicle_plate, goods_name, status, source 等
 * @returns Axios 响应 Promise
 */
export function apiCreateInboundOrder(data: any) {
  return http.post('/v1/inbound/orders', data);
}

/**
 * 更新预约状态
 * @param id - 预约ID
 * @param data - 部分更新字段，如 { status: 'warehouse_confirmed' }
 * @returns Axios 响应 Promise
 */
export function apiUpdateReservation(id: any, data: any) {
  return http.put(`/v1/inbound/reservations/${id}`, data);
}

/**
 * 获取门岗核验侧的预约列表（今日或指定分页）
 * @param params 可选分页/筛选参数，如 { page:1, pageSize:100 }
 * @returns Axios 响应 Promise，data.list 为列表
 */
export function apiGetBookingList(params?: any) {
  return http.get('/v1/inbound/reservations', { params: { page: 1, pageSize: 100, ...(params||{}) } });
}

/**
 * 获取办公室列表数据（与门岗使用同一数据源以保证同步）
 * @param params 可选分页/筛选参数
 * @returns Axios 响应 Promise
 */
export function apiGetOfficeList(params?: any) {
  // 目前使用预约数据源；如需切换为入库单，替换为 /v1/inbound/orders
  return http.get('/v1/inbound/reservations', { params: { page: 1, pageSize: 100, ...(params||{}) } });
}


