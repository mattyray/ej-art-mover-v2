import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Client, ClientInput, PaginatedResponse } from "@/types";

export function useClients(search?: string) {
  return useQuery({
    queryKey: ["clients", { search }],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const { data } = await api.get<PaginatedResponse<Client>>("/clients/", {
        params,
      });
      return data;
    },
  });
}

export function useClient(id: number) {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: async () => {
      const { data } = await api.get<Client>(`/clients/${id}/`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ClientInput) => {
      const { data } = await api.post<Client>("/clients/", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client created");
    },
    onError: () => {
      toast.error("Failed to create client");
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: ClientInput & { id: number }) => {
      const { data } = await api.put<Client>(`/clients/${id}/`, input);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.setQueryData(["clients", data.id], data);
      toast.success("Client updated");
    },
    onError: () => {
      toast.error("Failed to update client");
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/clients/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client deleted");
    },
    onError: () => {
      toast.error("Failed to delete client");
    },
  });
}
