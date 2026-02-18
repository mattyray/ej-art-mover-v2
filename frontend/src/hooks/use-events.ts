import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import type { Event, EventInput, PaginatedResponse } from "@/types";

interface EventFilters {
  work_order?: number;
  date?: string;
}

export function useEvents(filters?: EventFilters) {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters?.work_order)
        params.work_order = String(filters.work_order);
      if (filters?.date) params.date = filters.date;
      const { data } = await api.get<PaginatedResponse<Event>>(
        "/workorders/events/",
        { params }
      );
      return data;
    },
    enabled:
      !!filters?.work_order || !!filters?.date,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: EventInput & { work_order: number }) => {
      const { data } = await api.post<Event>("/workorders/events/", input);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({
        queryKey: ["workorders", data.work_order],
      });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      toast.success("Event created");
    },
    onError: () => {
      toast.error("Failed to create event");
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: EventInput & { id: number }) => {
      const { data } = await api.patch<Event>(
        `/workorders/events/${id}/`,
        input
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({
        queryKey: ["workorders", data.work_order],
      });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
    onError: () => {
      toast.error("Failed to update event");
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/workorders/events/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["workorders"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      toast.success("Event deleted");
    },
    onError: () => {
      toast.error("Failed to delete event");
    },
  });
}

export function useToggleEventComplete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.post<{
        completed: boolean;
        completed_at: string | null;
        completed_by: string;
      }>(`/workorders/events/${id}/toggle_complete/`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["workorders"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
    onError: () => {
      toast.error("Failed to toggle event completion");
    },
  });
}

export function useUpdateDailyOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      events: { id: number; daily_order: number; scheduled_time?: string | null }[]
    ) => {
      const { data } = await api.post("/workorders/events/update_daily_order/", {
        events,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
    onError: () => {
      toast.error("Failed to update event order");
    },
  });
}
