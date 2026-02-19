"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

interface CalendarInnerProps {
  events: object[];
  initialView: string;
  headerToolbar: object;
  height: string | number;
  onEventClick: (workOrderId: number) => void;
  onDateClick: (dateStr: string) => void;
  onDayClick: (date: Date) => void;
}

export default function CalendarInner({
  events,
  initialView,
  headerToolbar,
  height,
  onEventClick,
  onDateClick,
  onDayClick,
}: CalendarInnerProps) {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
      initialView={initialView}
      headerToolbar={headerToolbar}
      views={{
        listDay: { buttonText: "Day" },
        dayGridMonth: { buttonText: "Month" },
        dayGridWeek: { buttonText: "Week" },
      }}
      events={events}
      height={height}
      eventClick={(info) => {
        const woId = info.event.extendedProps.workOrderId;
        onEventClick(woId);
      }}
      dateClick={(info) => {
        onDateClick(info.dateStr);
      }}
      navLinks={true}
      navLinkDayClick={(date) => {
        onDayClick(date);
      }}
      dayMaxEvents={3}
      nowIndicator={true}
    />
  );
}
