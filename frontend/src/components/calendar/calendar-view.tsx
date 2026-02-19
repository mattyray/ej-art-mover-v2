"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCalendarEvents } from "@/hooks/use-calendar";
import { CardSkeleton } from "@/components/loading-skeleton";
import CalendarInner from "./calendar-inner";
import { format } from "date-fns";

interface CalendarViewProps {
  initialView?: string;
  headerToolbar?: object;
  height?: string | number;
}

export function CalendarView({
  initialView,
  headerToolbar,
  height = "auto",
}: CalendarViewProps) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});
  const { data: events, isLoading } = useCalendarEvents(dateRange.start, dateRange.end);

  const handleDatesSet = useCallback((start: string, end: string) => {
    setDateRange({ start, end });
  }, []);

  if (isLoading && !events) return <CardSkeleton />;

  const calendarEvents = (events || []).map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    color: e.color,
    extendedProps: {
      workOrderId: e.workOrderId,
      dailyOrder: e.dailyOrder,
      isCompleted: e.isCompleted,
    },
  }));

  const toolbar = headerToolbar || {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,dayGridWeek,listDay",
  };

  return (
    <CalendarInner
      events={calendarEvents}
      initialView={initialView || "dayGridMonth"}
      headerToolbar={toolbar}
      height={height}
      onEventClick={(woId) => {
        if (woId) router.push(`/work-orders/${woId}`);
      }}
      onDateClick={(dateStr) => {
        router.push(`/calendar/day/${dateStr}`);
      }}
      onDayClick={(date) => {
        router.push(`/calendar/day/${format(date, "yyyy-MM-dd")}`);
      }}
      onDatesSet={handleDatesSet}
    />
  );
}
