import { api } from "./client";
import { API } from "./endpoints";
import type {
  InvoiceListItem,
  CreateInvoiceRequest,
  InvoiceCreateResponse,
  InvoiceDetail,
  InvoiceItemResult,
  InvoicesFilterParams,
  InvoiceStats,
} from "../types/invoice";

function normalizeInvoice(raw: Partial<InvoiceListItem> & Record<string, unknown>): InvoiceListItem {
  return {
    firstName: typeof raw.firstName === "string" ? raw.firstName : undefined,
    lastName: typeof raw.lastName === "string" ? raw.lastName : undefined,
    customerNo: raw.customerNo != null ? Number(raw.customerNo) : undefined,
    invoiceNo: raw.invoiceNo != null ? Number(raw.invoiceNo) : undefined,
    status: typeof raw.status === "string" ? raw.status : "draft",
    dueDate: typeof raw.dueDate === "string" ? raw.dueDate : undefined,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    amountPaid: raw.amountPaid != null ? Number(raw.amountPaid) : 0,
    invoiceTotal: raw.invoiceTotal != null ? Number(raw.invoiceTotal) : 0,
  };
}

function normalizeInvoiceItem(raw: Partial<InvoiceItemResult> & Record<string, unknown>): InvoiceItemResult {
  const itemName = raw.itemName ?? raw.item_name;
  const unitPrice = raw.unitPrice ?? raw.unit_price;
  const taxTotal = raw.tax_total ?? raw.total_tax;
  const total = raw.total ?? raw.sub_total;

  return {
    itemName: typeof itemName === "string" ? itemName : "",
    unitPrice: unitPrice != null ? Number(unitPrice) : 0,
    quantity: raw.quantity != null ? Number(raw.quantity) : 0,
    tax: raw.tax != null ? Number(raw.tax) : 0,
    tax_total: taxTotal != null ? Number(taxTotal) : 0,
    total: total != null ? Number(total) : 0,
  };
}

function normalizeInvoiceDetail(raw: Partial<InvoiceDetail> & Record<string, unknown>): InvoiceDetail {
  return {
    invoiceNo: raw.invoiceNo != null ? Number(raw.invoiceNo) : 0,
    status: typeof raw.status === "string" ? raw.status : "draft",
    dueDate: typeof raw.dueDate === "string" ? raw.dueDate : undefined,
    total_tax: raw.total_tax != null ? Number(raw.total_tax) : 0,
    total: raw.total != null ? Number(raw.total) : 0,
    amount_paid: raw.amount_paid != null ? Number(raw.amount_paid) : 0,
    balance: raw.balance != null ? Number(raw.balance) : 0,
    items: Array.isArray(raw.items)
      ? raw.items.map((item) => normalizeInvoiceItem(item as Partial<InvoiceItemResult> & Record<string, unknown>))
      : [],
  };
}

export const invoicesApi = {

  list: async (params: InvoicesFilterParams): Promise<InvoiceListItem[]> => {
    const apiPage = Math.max(0, (params.page ?? 1) - 1);

    const queryParams = {
      firstName: params.firstName,
      lastName: params.lastName,
      customerNo: params.customerNo,
      invoiceNo: params.invoiceNo,
      status: params.status === "all" ? undefined : params.status,
      dueDateFrom: params.dueDateFrom,
      dueDateTo: params.dueDateTo,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
      page: apiPage,
      size: params.limit,
    };

    const res = await api.get<Partial<InvoiceListItem>[]>(API.INVOICES.LIST, { params: queryParams });
    return (res.data ?? []).map(normalizeInvoice);
  },

  create: async (input: CreateInvoiceRequest): Promise<InvoiceCreateResponse> => {
    const res = await api.post<InvoiceCreateResponse>(API.INVOICES.CREATE, input);
    return res.data;
  },

  detail: async (params: { invoiceNo: number; customerNo: number }): Promise<InvoiceDetail> => {
    const res = await api.get<Partial<InvoiceDetail> & Record<string, unknown>>(API.INVOICES.DETAIL, { params });
    return normalizeInvoiceDetail(res.data ?? {});
  },

  
  stats: async (): Promise<InvoiceStats> => {
    const res = await api.get<InvoiceStats>(API.INVOICES.STATS);
    return res.data;
  },

};
