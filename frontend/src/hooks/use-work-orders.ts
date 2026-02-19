import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import type {
  WorkOrderListItem,
  WorkOrderDetail,
  WorkOrderInput,
  WorkOrderStatus,
  PaginatedResponse,
} from "@/types";

interface WorkOrderFilters {
  status?: WorkOrderStatus;
  invoiced?: string;
  client?: number;
  search?: string;
  page?: number;
  ordering?: string;
}

export function useWorkOrders(
  filters?: WorkOrderFilters,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["workorders", filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters?.status) params.status = filters.status;
      if (filters?.invoiced !== undefined) params.invoiced = filters.invoiced;
      if (filters?.client) params.client = String(filters.client);
      if (filters?.search) params.search = filters.search;
      if (filters?.page) params.page = String(filters.page);
      if (filters?.ordering) params.ordering = filters.ordering;
      const { data } = await api.get<PaginatedResponse<WorkOrderListItem>>(
        "/workorders/",
        { params }
      );
      return data;
    },
    enabled: options?.enabled ?? true,
  });
}

export function useWorkOrder(id: number) {
  return useQuery({
    queryKey: ["workorders", id],
    queryFn: async () => {
      const { data } = await api.get<WorkOrderDetail>(`/workorders/${id}/`);
      return data;
    },
    enabled: !!id,
  });
}

function cleanWorkOrderInput(input: WorkOrderInput) {
  return {
    ...input,
    estimated_cost: input.estimated_cost || null,
    job_description: input.job_description || null,
  };
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: WorkOrderInput) => {
      const { data } = await api.post<WorkOrderDetail>("/workorders/", cleanWorkOrderInput(input));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workorders"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      toast.success("Work order created");
    },
    onError: () => {
      toast.error("Failed to create work order");
    },
  });
}

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: WorkOrderInput & { id: number }) => {
      const { data } = await api.put<WorkOrderDetail>(
        `/workorders/${id}/`,
        cleanWorkOrderInput(input)
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["workorders"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      queryClient.setQueryData(["workorders", data.id], data);
      toast.success("Work order updated");
    },
    onError: () => {
      toast.error("Failed to update work order");
    },
  });
}

export function useDeleteWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/workorders/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workorders"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      toast.success("Work order deleted");
    },
    onError: () => {
      toast.error("Failed to delete work order");
    },
  });
}

export function useMarkCompleted() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post(`/workorders/${id}/mark_completed/`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workorders"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      toast.success("Work order marked as completed");
    },
    onError: () => {
      toast.error("Failed to mark work order as completed");
    },
  });
}

export function useMarkPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post(`/workorders/${id}/mark_paid/`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workorders"] });
      toast.success("Work order marked as invoiced");
    },
    onError: () => {
      toast.error("Failed to mark work order as invoiced");
    },
  });
}

export function useCompleteAndInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post(
        `/workorders/${id}/complete_and_invoice/`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workorders"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      toast.success("Work order completed and invoiced");
    },
    onError: () => {
      toast.error("Failed to complete and invoice work order");
    },
  });
}

export function useChangeWorkOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: number;
      status: WorkOrderStatus;
    }) => {
      const { data } = await api.post(`/workorders/${id}/change_status/`, {
        status,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workorders"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      toast.success("Status updated");
    },
    onError: () => {
      toast.error("Failed to change status");
    },
  });
}

export function useResetInvoiced() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post(`/workorders/${id}/reset_invoiced/`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workorders"] });
      toast.success("Invoiced status reset");
    },
    onError: () => {
      toast.error("Failed to reset invoiced status");
    },
  });
}
