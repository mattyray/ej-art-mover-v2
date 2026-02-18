"use client";

import { EventItem } from "./event-item";
import { EmptyState } from "@/components/empty-state";
import { CalendarDays } from "lucide-react";
import type { Event } from "@/types";

interface EventListProps {
  events: Event[];
}

export function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No events"
        description="This work order doesn't have any scheduled events yet."
      />
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <EventItem key={event.id} event={event} />
      ))}
    </div>
  );
}
