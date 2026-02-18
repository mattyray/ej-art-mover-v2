"use client";

import dynamic from "next/dynamic";
import { useRef, useEffect, useState, type ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { useCalendarEvents } from "@/hooks/use-calendar";
import { CardSkeleton } from "@/components/loading-skeleton";
import { format } from "date-fns";

// Dynamic import avoids "Cannot read properties of null (reading 'cssRules')" with Turbopack
const FullCalendar = dynamic(() => import("@fullcalendar/react"), {
  ssr: false,
  loading: () => <CardSkeleton />,
});

import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
