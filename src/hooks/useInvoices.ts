import { useQuery } from "@tanstack/react-query";
import { invoicesApi } from "../api/invoices";
import type { InvoiceListParams } from "../types/invoice";

const INVOICES_KEY = "invoices";

export function useInvoices(params: InvoiceListParams) {
  return useQuery({
    queryKey: [INVOICES_KEY, params],
    queryFn: () => invoicesApi.list(params),
    placeholderData: (previous) => previous, // keep old rows visible while refetching
  });
}

export function useInvoiceStats() {
  return useQuery({
    queryKey: [INVOICES_KEY, "stats"],
    queryFn: () => invoicesApi.stats(),
  });
}
