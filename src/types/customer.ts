//CustomerInvoiceResDTO
export interface Customer {
  userNo: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string | null;
}

export interface CustomerListParams {
  search?: string;
  searchBy?: "email" | "userNo" | "phoneNumber";
  page?: number;
  limit?: number;
}

export interface CustomerListResponse {
  data: Customer[];
  total?: number;
  page: number;
  limit: number;
}

export interface CustomerStats {
  totalCustomers: number;
  newCustomers: number;
  totalReceivables: number;
  totalOverdue: number;
}

