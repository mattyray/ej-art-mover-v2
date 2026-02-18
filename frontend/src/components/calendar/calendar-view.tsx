"use client";

import { useRef, useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { useRouter } from "next/navigation";
import { useCalendarEvents } from "@/hooks/use-calendar";
import { CardSkeleton } from "@/components/loading-skeleton";
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
  const { data: events, isLoading } = useCalendarEvents();
  const calendarRef = useRef<FullCalendar>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    if (isMobile) {
      api.changeView("listWeek");
    } else {
      api.changeView(initialView || "dayGridMonth");
    }
  }, [isMobile, initialView]);

  if (isLoading) return <CardSkeleton />;

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

  return (
    <FullCalendar
      ref={calendarRef}
      plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
      initialView={isMobile ? "listWeek" : initialView || "dayGridMonth"}
      headerToolbar={
        headerToolbar || {
          left: "prev,next today",
          center: "title",
          right: isMobile
            ? "listWeek,listMonth"
            : "dayGridMonth,dayGridWeek,listWeek",
        }
      }
      events={calendarEvents}
      height={height}
      eventClick={(info) => {
        const woId = info.event.extendedProps.workOrderId;
        if (woId) {
          router.push(`/work-orders/${woId}`);
        }
      }}
      dateClick={(info) => {
        router.push(`/calendar/day/${info.dateStr}`);
      }}
      navLinks={true}
      navLinkDayClick={(date) => {
        router.push(`/calendar/day/${format(date, "yyyy-MM-dd")}`);
      }}
      dayMaxEvents={3}
      nowIndicator={true}
    />
  );
}
