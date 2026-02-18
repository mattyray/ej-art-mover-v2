"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { DayEventCard } from "./day-event-card";
import { useToggleEventComplete, useUpdateDailyOrder } from "@/hooks/use-events";
import { EmptyState } from "@/components/empty-state";
import { CalendarDays } from "lucide-react";
import type { Event } from "@/types";

interface DayEventListProps {
  events: Event[];
}

export function DayEventList({ events: initialEvents }: DayEventListProps) {
  const [events, setEvents] = useState(initialEvents);
  const toggleComplete = useToggleEventComplete();
  const updateDailyOrder = useUpdateDailyOrder();

  // Keep local state in sync when data refreshes
  if (
    initialEvents.length !== events.length ||
    initialEvents.some((e, i) => e.id !== events[i]?.id)
  ) {
    setEvents(initialEvents);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const oldIndex = events.findIndex((ev) => ev.id === active.id);
    const newIndex = events.findIndex((ev) => ev.id === over.id);
    const reordered = arrayMove(events, oldIndex, newIndex);
    setEvents(reordered);

    // Persist new order to backend
    const payload = reordered.map((ev, idx) => ({
      id: ev.id,
      daily_order: idx + 1,
      scheduled_time: ev.scheduled_time,
    }));
    updateDailyOrder.mutate(payload);
  }

  if (events.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No events"
        description="No events scheduled for this day."
      />
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={events.map((e) => e.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {events.map((event) => (
            <DayEventCard
              key={event.id}
              event={event}
              onToggleComplete={(id) => toggleComplete.mutate(id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
