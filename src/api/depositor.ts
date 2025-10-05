export type ListParams = { page?: number; pageSize?: number; role?: string; ownerId?: string; warehouseId?: string; carrierId?: string };

function mockInboundOrders(n: number){
  const arr:any[] = [];
  for(let i=0;i<n;i++){
    const idx = (i+1).toString().padStart(3,'0');
    arr.push({
      order_no: `RK2025${idx}`,
      reservation_number: `YY${Date.now()}${idx}`,
      unique_reservation_code: `YYSN${idx}`,
      owner_name: i%2? '中储粮公司' : '华夏粮贸',
      warehouse_name: '示例仓库A',
      warehouse_address: '郑州·经开区',
      commodity_name: i%2? '小麦' : '玉米',
      commodity_spec: i%3? '0.05 吨/件' : '0.06 吨/件',
      planned_quantity: 100 + i,
      measurement_unit: '吨',
      actual: i%4===0 ? 60 + i : '',
      calc_weight: i%4!==0 ? 58 + i : '',
      pieces: 1000 + i,
      weigh_mode: i%2? 'by_weight' : 'by_pack',
      status: i%5===0 ? 'platform_approved' : (i%3===0 ? 'receiving' : 'created'),
      created_at: '2025-10-05 10:00',
    });
  }
  return arr;
}

export async function listInboundOrders(_params: ListParams){
  return { data: { list: mockInboundOrders(20) } } as any;
}

export async function uploadReservationPdf(_id: string, _url: string, _filename: string){
  return { data: { ok: true } } as any;
}

export async function approveInboundOrder(_id: string){
  return { data: { ok: true } } as any;
}


