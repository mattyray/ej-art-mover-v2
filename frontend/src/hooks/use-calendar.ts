import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { CalendarEvent } from "@/types";

export function useCalendarEvents(start?: string, end?: string) {
  return useQuery({
    queryKey: ["calendar", start, end],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (start) params.start = start;
      if (end) params.end = end;
      const { data } = await api.get<CalendarEvent[]>("/calendar/events/", { params });
      return data;
    },
  });
}
