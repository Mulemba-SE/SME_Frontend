//CustomerInvoiceResDTO
export interface Customer {
  userNo: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string | null;
  invoiceNo?: number | null;
  status?: string | null;
  total?: number | null;
  totalTax?: number | null;
  amountPaid?: number | null;
  dueDate?: string | null;
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

