//CustomerInvoiceResDTO
export interface Customer {
  userNo: bigint;
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber: string;
  invoiceNo: number;
  status: string;
  total?: number;
  totalTax?: number;
  amountPaid?: number;
  dueDate: string;
}

export interface CreateCustomerRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phoneCountryCode?: string;
  phone?: string;
}

export interface CustomerListParams {
  search?: string;
  searchBy?: "email" | "userNo" | "phoneNumber" | "dueDate";
  status?: "paid" | "pending" | "overdue" | "draft" | "all";
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

export interface CustomerStats {
  totalCustomers: number;
  newCustomers: number;
  totalReceivables: number;
  totalOverdue: number;
}
