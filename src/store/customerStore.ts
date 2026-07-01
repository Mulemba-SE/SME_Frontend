import { create } from 'zustand';
import type { Customer } from '../types/customer';

interface CustomerStore {
    customers: Customer[];
    total: number | undefined;
    page: number;
    limit: number;
    isLoading: boolean;
    error: string | null;

    setCustomers: (customers: Customer[]) => void;
    setTotal: (total: number | undefined) => void;
    setPage: (page: number) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    clearStore: () => void;
    addCustomer: (customer: Customer) => void;
}

export const useCustomerStore = create<CustomerStore>((set) => ({
    customers: [],
    total: undefined,
    page: 1,
    limit: 8,
    isLoading: false,
    error: null,

    setCustomers: (customers) => set({ customers }),
    setTotal: (total) => set({ total }),
    setPage: (page) => set({ page }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
    clearStore: () => set({ customers: [], total: undefined, error: null }),
    addCustomer: (customer) =>
      set((state) => ({
        customers: [customer, ...state.customers],
        total: state.total != null ? state.total + 1 : 1,
      })),
}));