import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentsApi } from "../api/payments";
import type { CreatePaymentRequest, PaymentsFilterParams } from "../types/payment";

const PAYMENTS_KEY = "payments";

export function usePayments(params: PaymentsFilterParams) {
  return useQuery({
    queryKey: [PAYMENTS_KEY, params],
    queryFn: () => paymentsApi.list(params),
    placeholderData: (previous) => previous,
  });
}

export function usePaymentStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [PAYMENTS_KEY, "stats"],
    queryFn: () => paymentsApi.stats(),
    enabled: options?.enabled ?? true,
  });
}

export function usePaymentDetail(paymentNo: number, mine?: boolean) {
  return useQuery({
    queryKey: [PAYMENTS_KEY, "detail", paymentNo, mine],
    queryFn: () => paymentsApi.detail(paymentNo, mine),
    enabled: Number.isFinite(paymentNo) && paymentNo > 0,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePaymentRequest) => paymentsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice-detail"] });
    },
  });
}

function useUpdatePaymentStatus(mutationFn: (paymentNo: number) => ReturnType<typeof paymentsApi.confirm>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PAYMENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice-detail"] });
    },
  });
}

export function useConfirmPayment() {
  return useUpdatePaymentStatus(paymentsApi.confirm);
}

export function useFailPayment() {
  return useUpdatePaymentStatus(paymentsApi.fail);
}
