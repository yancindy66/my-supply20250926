export interface QualityAgency {
  id: number;
  name: string;           // 质检机构名称
  code: string;           // 机构编码
  qualification?: string; // 资质（CMA/CNAS 等）
  labCount?: number;      // 实验室数量
  contact?: string;
  phone?: string;
  address?: string;
}

export interface QaListQuery {
  keyword?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface QaListResult {
  list: QualityAgency[];
  total: number;
  page: number;
  pageSize: number;
}








