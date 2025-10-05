export async function apiCreateReservation(data: any){
  return { data: { ok: true, reservation_number: `YY${Date.now()}` } } as any;
}

export async function apiUpdateReservation(_id: string, _data: any){
  return { data: { ok: true } } as any;
}

export async function apiCreateInboundOrder(data: any){
  return { data: { ok: true, order_no: `RK${Date.now()}` } } as any;
}

export async function apiGetBookingList(_params: any){
  return { data: { list: [] } } as any;
}


