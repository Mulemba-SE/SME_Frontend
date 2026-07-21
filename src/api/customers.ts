import { api } from "./client";
import { API } from "./endpoints";
import type {
  Customer,
  CustomerListParams,
  CustomerListResponse,
  CustomerStats,
} from "../types/customer";

function normalizeCustomer(raw: Partial<Customer> & Record<string, unknown>): Customer {
  return {
    userNo: typeof raw.userNo === "string" || typeof raw.userNo === "number"
      ? String(raw.userNo)
      : "",
    firstName: typeof raw.firstName === "string" ? raw.firstName : undefined,
    lastName: typeof raw.lastName === "string" ? raw.lastName : undefined,
    email: typeof raw.email === "string" ? raw.email : undefined,
    phoneNumber: typeof raw.phoneNumber === "string" ? raw.phoneNumber : undefined,
  };
}

export const customersApi = {
  list: async (params: CustomerListParams): Promise<CustomerListResponse> => {
    const apiPage = Math.max(0, (params.page ?? 1) - 1);

    const queryParams = {
      email: params.searchBy === "email" ? params.search?.trim() || undefined : undefined,
      customerNo: params.searchBy === "userNo" ? params.search?.trim() || undefined : undefined,
      phoneNumber: params.searchBy === "phoneNumber" ? params.search?.trim() || undefined : undefined,
      page: apiPage,
      size: params.limit,
    };

    const res = await api.get<Partial<Customer>[]>(API.CUSTOMERS.LIST, {
      params: queryParams,
    });

    const currentPage = params.page ?? 1;

    return {
      data: (res.data ?? []).map(normalizeCustomer),
      page: currentPage,
      limit: params.limit ?? 10,
    };
  },

  getByUserNo: async (userNo: string | number): Promise<Customer> => {
    const res = await api.get<Partial<Customer>>(`${API.CUSTOMERS.DETAIL}/${userNo}`);
    return normalizeCustomer(res.data);
  },

  stats: async (): Promise<CustomerStats> => {
    const res = await api.get<CustomerStats>(API.CUSTOMERS.STATS);
    return res.data;
  },
};