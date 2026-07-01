export type InvoiceStatus = string;


export interface InvoiceListItem {
  firstName: string;
  lastName: string;
  customerNo: number;
  invoiceNo: number;
  status: InvoiceStatus;
  dueDate: string; 
  createdAt: string; 
  amountPaid: number;
  invoiceTotal: number;
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
  page?: number; 
  limit?: number;
}

export interface InvoiceStats {
  totalInvoiced: number;
  paidAmount: number;
  outstandingAmount: number;
  draftCount: number;
}