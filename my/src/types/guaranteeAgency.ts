export interface GuaranteeAgency {
  id: number;
  name: string;         // 担保机构名称
  code: string;         // 机构编码
  guaranteeScope?: string; // 担保范围
  guaranteeLimit?: string; // 担保额度上限
  rating?: string;      // 主体/资信评级
  contact?: string;
  phone?: string;
  address?: string;
}

export interface GaListQuery {
  keyword?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GaListResult {
  list: GuaranteeAgency[];
  total: number;
  page: number;
  pageSize: number;
}








