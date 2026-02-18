import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { CalendarEvent } from "@/types";

export function useCalendarEvents() {
  return useQuery({
    queryKey: ["calendar"],
    queryFn: async () => {
      const { data } = await api.get<CalendarEvent[]>("/calendar/events/");
      return data;
    },
  });
}
