// Invoice contract — share this shape with Kelvin before he builds the
// backend, same as types/customer.ts. Mocked for now in api/invoicesMock.ts.

export type InvoiceStatus = "paid" | "pending" | "overdue" | "draft";

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-0001"
  customerId?: string; // present once linked to a real Customer record
  customerName: string;
  issueDate: string; // ISO date
  dueDate: string; // ISO date
  amount: number; // KES, major units (e.g. 25000 = KES 25,000.00)
  status: InvoiceStatus;
  createdAt: string; // ISO timestamp
}

export interface CreateInvoiceRequest {
  customerId?: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status?: InvoiceStatus;
}

export interface InvoiceListParams {
  search?: string;
  status?: InvoiceStatus | "all";
  page?: number;
  limit?: number;
}

export interface InvoiceListResponse {
  data: Invoice[];
  total: number;
  page: number;
  limit: number;
}

// Aggregate figures for the stat cards — computed across *all* invoices,
// independent of the current page/search/filter, the same way a real
// backend summary endpoint would work.
export interface InvoiceStats {
  totalInvoiced: number;
  totalInvoicedCount: number;
  paidAmount: number;
  paidCount: number;
  outstandingAmount: number;
  overdueCount: number;
  draftCount: number;
}
