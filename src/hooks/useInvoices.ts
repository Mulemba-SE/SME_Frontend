import { useQuery } from "@tanstack/react-query";
import { invoicesApi } from "../api/invoices";
import type { InvoicesFilterParams } from "../types/invoice";

const INVOICES_KEY = "invoices";

export function useInvoices(params: InvoicesFilterParams) {
  return useQuery({
    queryKey: [INVOICES_KEY, params],
    queryFn: () => invoicesApi.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useInvoiceStats() {
  return useQuery({
    queryKey: [INVOICES_KEY, "stats"],
    queryFn: () => invoicesApi.stats(),
  });
}
