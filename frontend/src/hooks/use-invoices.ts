import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import type {
  Invoice,
  InvoiceInput,
  InvoiceStatus,
  PaginatedResponse,
} from "@/types";

interface InvoiceFilters {
  status?: InvoiceStatus;
  client?: number;
  search?: string;
}

export function useInvoices(filters?: InvoiceFilters) {
  return useQuery({
    queryKey: ["invoices", filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters?.status) params.status = filters.status;
      if (filters?.client) params.client = String(filters.client);
      if (filters?.search) params.search = filters.search;
      const { data } = await api.get<PaginatedResponse<Invoice>>(
        "/invoices/",
        { params }
      );
      return data;
    },
  });
}

export function useInvoice(id: number) {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: async () => {
      const { data } = await api.get<Invoice>(`/invoices/${id}/`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: InvoiceInput) => {
      const { data } = await api.post<Invoice>("/invoices/", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["workorders"] });
      toast.success("Invoice created");
    },
    onError: () => {
      toast.error("Failed to create invoice");
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: InvoiceInput & { id: number }) => {
      const { data } = await api.put<Invoice>(`/invoices/${id}/`, input);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.setQueryData(["invoices", data.id], data);
      toast.success("Invoice updated");
    },
    onError: () => {
      toast.error("Failed to update invoice");
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/invoices/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice deleted");
    },
    onError: () => {
      toast.error("Failed to delete invoice");
    },
  });
}

export function useAdvanceInvoiceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post(`/invoices/${id}/advance_status/`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice status advanced");
    },
    onError: () => {
      toast.error("Failed to advance invoice status");
    },
  });
}

export function useChangeInvoiceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: InvoiceStatus;
    }) => {
      const { data } = await api.post(`/invoices/${id}/change_status/`, {
        status,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice status changed");
    },
    onError: () => {
      toast.error("Failed to change invoice status");
    },
  });
}
