export interface FinancialInstitution {
  id: number;
  name: string;           // 金融机构名称
  code: string;           // 机构编码
  bankType?: string;      // 机构类型（银行/信托/券商等）
  licenseNo?: string;     // 许可证编号
  rating?: string;        // 主体评级
  registeredCapital?: string; // 注册资本
  contact?: string;
  phone?: string;
  address?: string;
  createDate?: string;    // 成立日期
}

export interface FiListQuery {
  keyword?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FiListResult {
  list: FinancialInstitution[];
  total: number;
  page: number;
  pageSize: number;
}








