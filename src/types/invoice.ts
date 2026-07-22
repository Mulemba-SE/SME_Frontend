export type InvoiceSortBy = "DUE_DATE" | "CREATE_DATE" | "INVOICE_NO" | "FIRST_NAME" | "LAST_NAME" | "TOTAL" | "STATUS";
export type SortDirection = "ASC" | "DESC";

export type InvoiceStatus = string;


export interface InvoiceListItem {
  firstName?: string | null;
  lastName?: string | null;
  customerNo?: number | null;
  invoiceNo?: number | null;
  status: InvoiceStatus;
  dueDate?: string | null;
  createdAt?: string | null;
  amountPaid?: number | null;
  invoiceTotal?: number | null;
}

export interface CreateInvoiceRequest {
  customerNo: number;
  dueDate: string; 
  items: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  itemName: string;
  unitPrice: number;
  quantity: number;
  tax: number;
}

export interface InvoiceItemResult {
  itemName: string;
  unitPrice: number;
  quantity: number;
  tax: number;
  tax_total: number;
  total: number;
}

export interface InvoiceDetail {
  invoiceNo: number;
  status: InvoiceStatus;
  dueDate?: string | null;
  total_tax: number;
  total: number;
  amount_paid: number;
  balance: number;
  items: InvoiceItemResult[];
}

export interface InvoiceCreateResponse {
  invoiceNo: number;
  status: InvoiceStatus;
  customerNo: number;
  createdAt: string;
  dueDate: string;
  items: InvoiceItemResult[];
  totalTax: number;
  total: number;
}

export interface InvoicesFilterParams {
  firstName?: string;
  lastName?: string;
  customerNo?: number;
  invoiceNo?: number;
  status?: InvoiceStatus | "all";
  dueDateFrom?: string;
  dueDateTo?: string;
  sortBy?: InvoiceSortBy;
  sortDirection?: SortDirection;
  page?: number; 
  limit?: number;
  mine?: boolean;
}

export interface InvoiceStats {
  draft: number;
  pending: number;
  overdue: number;
  amount_overdue: number;
  amount_receivables: number;
}

// Customer-scoped dashboard stats (GET /invoices/mine/dashboard) — the
// backend counterpart to CustomerDashboardStatsDTO. Used by the four
// summary cards on the customer dashboard.
export interface CustomerDashboardStats {
  totalInvoices: number;
  totalPaid: number;
  outstandingBalance: number;
  overdueInvoices: number;
}