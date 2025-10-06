export interface InventoryOwner {
  id: number;
  company: string;
  code: string;
  // 企业信息
  creditCode?: string; // 统一社会信用代码
  regAddress?: string; // 企业注册地址
  legalRepName?: string; // 法定代表人姓名
  legalRepId?: string; // 法定代表人身份证号
  establishDate?: string; // 成立日期 (YYYY-MM-DD)
  registeredCapital?: string; // 注册资本
  businessScope?: string; // 经营范围

  // 企业联系信息
  bankName?: string; // 对公账户开户行
  bankAccount?: string; // 对公账户号
  companyEmail?: string; // 企业常用邮箱
  companyPhone?: string; // 企业联系电话

  // 经营信息（初步风控）
  annualRevenueRange?: string; // 年营业额范围
  mainBusiness?: string; // 主营业务范围
  partners?: string; // 常用物流/仓储合作方（逗号分隔）

  // 账号管理员（操作员）
  adminName?: string;
  adminDept?: string;
  adminTitle?: string;
  adminPhone?: string;
  contact: string;
  phone: string;
  address: string;
  // 资质上传（文件名占位）
  license?: string; // 营业执照扫描件
  licenseDataUrl?: string; // 营业执照图像数据
  legalIdFront?: string; // 法人身份证正面
  legalIdFrontDataUrl?: string;
  legalIdBack?: string; // 法人身份证反面
  legalIdBackDataUrl?: string;
  bankPermit?: string; // 开户许可证
  bankPermitDataUrl?: string;
  authLetter?: string; // 授权委托书
  authLetterDataUrl?: string;
  seal?: string; // 法人公章（保留原字段，可选）
  sealDataUrl?: string;
}

export interface OwnerListQuery {
  keyword?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OwnerListResult {
  list: InventoryOwner[];
  total: number;
  page: number;
  pageSize: number;
}

