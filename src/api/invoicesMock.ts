// Mock invoices "backend" — same pattern as api/customersMock.ts: an
// in-memory array standing in for Kelvin's not-yet-built /api/invoices
// endpoints. Seeded with a handful of demo rows (matching the design
// reference) purely so the page has something to render during dev —
// swap seedInvoices for [] once real data exists, or once invoice
// creation is wired up to actually persist new rows here.

import type {
  Invoice,
  CreateInvoiceRequest,
  InvoiceListParams,
  InvoiceListResponse,
  InvoiceStats,
} from "../types/invoice";

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function isoNow(): string {
  return new Date().toISOString();
}


let invoices: Invoice[] = [];

function delay<T>(value: T, ms = 450): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function nextInvoiceNumber(): string {
  const max = invoices.reduce((acc, inv) => {
    const n = parseInt(inv.invoiceNumber.replace("INV-", ""), 10);
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
  return `INV-${String(max + 1).padStart(4, "0")}`;
}

export const invoicesMockApi = {
  list: async (params: InvoiceListParams): Promise<InvoiceListResponse> => {
    const { search = "", status = "all", page = 1, limit = 10 } = params;

    let filtered = invoices;

    if (status !== "all") {
      filtered = filtered.filter((inv) => inv.status === status);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.customerName.toLowerCase().includes(q)
      );
    }

    filtered = [...filtered].sort(
      (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
    );

    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return delay({ data, total, page, limit });
  },

  create: async (input: CreateInvoiceRequest): Promise<Invoice> => {
    const newInvoice: Invoice = {
      id: uid(),
      invoiceNumber: nextInvoiceNumber(),
      customerId: input.customerId,
      customerName: input.customerName.trim(),
      issueDate: input.issueDate,
      dueDate: input.dueDate,
      amount: input.amount,
      status: input.status ?? "draft",
      createdAt: isoNow(),
    };

    invoices = [newInvoice, ...invoices];
    return delay(newInvoice, 500);
  },

  stats: async (): Promise<InvoiceStats> => {
    const nonDraft = invoices.filter((inv) => inv.status !== "draft");
    const paid = invoices.filter((inv) => inv.status === "paid");
    const outstanding = invoices.filter(
      (inv) => inv.status === "pending" || inv.status === "overdue"
    );

    return delay({
      totalInvoiced: nonDraft.reduce((sum, inv) => sum + inv.amount, 0),
      totalInvoicedCount: nonDraft.length,
      paidAmount: paid.reduce((sum, inv) => sum + inv.amount, 0),
      paidCount: paid.length,
      outstandingAmount: outstanding.reduce((sum, inv) => sum + inv.amount, 0),
      overdueCount: invoices.filter((inv) => inv.status === "overdue").length,
      draftCount: invoices.filter((inv) => inv.status === "draft").length,
    });
  },
};
