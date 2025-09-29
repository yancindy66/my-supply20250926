export interface SupervisedWarehouse {
  id: number;
  name: string;           // 监管仓库名称
  code: string;           // 仓库编码
  location?: string;      // 地理位置
  capacity?: string;      // 总容量（吨/件等）
  supervisor?: string;    // 监管方/监管员
  contact?: string;
  phone?: string;
  address?: string;
}

export interface SwListQuery {
  keyword?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SwListResult {
  list: SupervisedWarehouse[];
  total: number;
  page: number;
  pageSize: number;
}








