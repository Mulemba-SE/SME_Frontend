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
  CustomerDashboardStats,
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
  const quantity = raw.quantity;
  const taxRate = raw.tax; // backend sends this as a percentage rate, e.g. 10 = 10%

  const parsedUnitPrice = unitPrice != null ? Number(unitPrice) : 0;
  const parsedQuantity = quantity != null ? Number(quantity) : 0;
  const parsedTaxRate = taxRate != null ? Number(taxRate) : 0;

  // Backend field names: subTotal / taxSubtotal. Older/alt shapes: total / sub_total, tax_total / total_tax.
  const rawSubTotal = raw.subTotal ?? raw.sub_total ?? raw.total;
  const rawTaxSubtotal = raw.taxSubtotal ?? raw.tax_total ?? raw.total_tax;

  // Backend sometimes sends these as null instead of computing them — fall back to computing client-side.
  const computedSubTotal = parsedUnitPrice * parsedQuantity;
  const subTotal = rawSubTotal != null ? Number(rawSubTotal) : computedSubTotal;

  const computedTaxSubtotal = subTotal * (parsedTaxRate / 100);
  const taxSubtotal = rawTaxSubtotal != null ? Number(rawTaxSubtotal) : computedTaxSubtotal;

  return {
    itemName: typeof itemName === "string" ? itemName : "",
    unitPrice: parsedUnitPrice,
    quantity: parsedQuantity,
    tax: parsedTaxRate,
    tax_total: taxSubtotal,
    total: subTotal + taxSubtotal,
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
    const endpoint = params.mine ? API.INVOICES.MINE : API.INVOICES.LIST;

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

    const res = await api.get<Partial<InvoiceListItem>[]>(endpoint, { params: queryParams });
    return (res.data ?? []).map(normalizeInvoice);
  },

  create: async (input: CreateInvoiceRequest): Promise<InvoiceCreateResponse> => {
    const res = await api.post<InvoiceCreateResponse>(API.INVOICES.CREATE, input);
    return res.data;
  },

  detail: async (params: { invoiceNo: number; customerNo?: number; mine?: boolean }): Promise<InvoiceDetail> => {
    if (params.mine) {
      const res = await api.get<Partial<InvoiceDetail> & Record<string, unknown>>(
        `${API.INVOICES.MINE}/${params.invoiceNo}`
      );
      return normalizeInvoiceDetail(res.data ?? {});
    }

    const res = await api.get<Partial<InvoiceDetail> & Record<string, unknown>>(API.INVOICES.DETAIL, {
      params: { invoiceNo: params.invoiceNo, customerNo: params.customerNo },
    });
    return normalizeInvoiceDetail(res.data ?? {});
  },

  
  stats: async (params?: { mine?: boolean }): Promise<InvoiceStats> => {
    const res = await api.get<InvoiceStats>(API.INVOICES.STATS, {
      params: { mine: params?.mine || undefined },
    });
    return res.data;
  },

  // Customer-scoped dashboard stats — hits its own route (not the
  // staff-only STATS endpoint), so there's no `mine` param to pass.
  myStats: async (): Promise<CustomerDashboardStats> => {
    const res = await api.get<CustomerDashboardStats>(API.INVOICES.MINE_STATS);
    return res.data;
  },

  sendInvoiceConfirmation: async (invoiceNo: number): Promise<void> => {
  await api.patch(`${API.INVOICES.SEND_CONFIRMATION}/${invoiceNo}/send-invoice-confirmation`);
  },

};