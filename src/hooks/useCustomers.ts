import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customersApi } from "../api/customers";
import type { CreateCustomerRequest, CustomerListParams } from "../types/customer";

const CUSTOMERS_KEY = "customers";

export function useCustomers(params: CustomerListParams) {
  return useQuery({
    queryKey: [CUSTOMERS_KEY, params],
    queryFn: () => customersApi.list(params),
    placeholderData: (previous) => previous, 
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCustomerRequest) => customersApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
    },
  });
}

export function useCustomerStats() {
  return useQuery({
    queryKey: [CUSTOMERS_KEY, "stats"],
    queryFn: () => customersApi.stats(),
  });
}
