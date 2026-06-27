import axios from "axios";
import { API } from "./endpoints";
import type {
  Customer,
  CreateCustomerRequest,
  CustomerListParams,
  CustomerListResponse,
  CustomerStats,
} from "../types/customer";

const api = axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Global error interceptor (already good)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    const errorCode = data?.errorCode;
    const fieldErrors = data?.errors as Record<string, string> | undefined;

    if (errorCode === "VALIDATION_ERROR" && fieldErrors) {
      const firstMessage = Object.values(fieldErrors)[0] ?? "Please check the form for errors.";
      const apiError = Object.assign(new Error(firstMessage), {
        errorCode,
        isApiError: true,
        fieldErrors,
      });
      return Promise.reject(apiError);
    }

    const serverMessage = data?.message;
    if (serverMessage) {
      const apiError = Object.assign(new Error(serverMessage), {
        errorCode,
        isApiError: true,
      });
      return Promise.reject(apiError);
    }

    return Promise.reject(error);
  }
);

export const customersApi = {
  list: async (params: CustomerListParams): Promise<CustomerListResponse> => {
    const apiPage = Math.max(0, (params.page ?? 1) - 1);

    const queryParams = {
      email: params.searchBy === "email" ? params.search?.trim() || undefined : undefined,
      customerNo: params.searchBy === "userNo" ? params.search?.trim() || undefined : undefined,
      phoneNumber: params.searchBy === "phoneNumber" ? params.search?.trim() || undefined : undefined,
      dueDateFrom: params.searchBy === "dueDate" ? params.search || undefined : undefined,
      dueDateTo: params.searchBy === "dueDate" ? params.search || undefined : undefined,
      status: params.status === "all" ? undefined : params.status,
      page: apiPage,
      size: params.limit,
    };

    const res = await api.get<Customer[]>(API.CUSTOMERS.LIST, {
      params: queryParams,
    });

    const currentPage = params.page ?? 1;

    return {
      data: res.data,
      page: currentPage,
      limit: params.limit ?? 10,
    };
  },

  create: async (input: CreateCustomerRequest): Promise<Customer> => {
    const payload = {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phoneNumber: input.phone 
        ? `${input.phoneCountryCode || "+254"}${input.phone}`.trim()
        : undefined,
      password: crypto.randomUUID(), // temporary — manager-created customers
    };

    const res = await api.post<Customer>(API.CUSTOMERS.CREATE, payload);
    return res.data;
  },

  stats: async (): Promise<CustomerStats> => {
    const res = await api.get<CustomerStats>(API.CUSTOMERS.STATS);
    return res.data;
  },
};