"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Clock, MapPin } from "lucide-react";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import type { Event } from "@/types";
import Link from "next/link";

interface DayEventCardProps {
  event: Event;
  onToggleComplete: (id: number) => void;
}

export function DayEventCard({ event, onToggleComplete }: DayEventCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="touch-none">
      <CardContent className="flex items-start gap-3 p-3">
        <button
          className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <Checkbox
          checked={event.completed}
          onCheckedChange={() => onToggleComplete(event.id)}
          className="mt-1"
        />

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {EVENT_TYPE_LABELS[event.event_type]}
            </Badge>
            <Link
              href={`/work-orders/${event.work_order}`}
              className="text-sm font-medium hover:underline truncate"
            >
              WO #{event.work_order}
            </Link>
          </div>

          {event.address && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{event.address}</span>
            </p>
          )}

          {event.scheduled_time && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {event.scheduled_time.slice(0, 5)}
            </p>
          )}

          {event.completed && event.completed_by && (
            <p className="text-xs text-muted-foreground">
              Completed by {event.completed_by}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
