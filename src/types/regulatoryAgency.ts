export interface RegulatoryAgency {
  id: number;
  name: string;
  contact: string;
  phone: string;
  address: string;
}

export interface RegAgencyListQuery {
  keyword?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RegAgencyListResult {
  list: RegulatoryAgency[];
  total: number;
  page: number;
  pageSize: number;
}








