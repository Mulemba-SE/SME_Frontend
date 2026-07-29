import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export function useInvoiceStats(options?: { enabled?: boolean; mine?: boolean }) {
  return useQuery({
    queryKey: [INVOICES_KEY, "stats", options?.mine ?? false],
    queryFn: () => invoicesApi.stats({ mine: options?.mine }),
    enabled: options?.enabled ?? true,
  });
}

export function useMyDashboardStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [INVOICES_KEY, "mine", "dashboard"],
    queryFn: () => invoicesApi.myStats(),
    enabled: options?.enabled ?? true,
  });
}

export function useSendInvoiceConfirmation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invoiceNo: number) => invoicesApi.sendInvoiceConfirmation(invoiceNo),
    onSuccess: async (_, invoiceNo) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["invoice-detail", invoiceNo] }),
        queryClient.invalidateQueries({ queryKey: [INVOICES_KEY] }),
      ]);
    },
  });
}