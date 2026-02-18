"use client";

import { useToggleEventComplete } from "@/hooks/use-events";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { EVENT_TYPE_LABELS } from "@/lib/constants";
import type { Event } from "@/types";

interface EventItemProps {
  event: Event;
}

export function EventItem({ event }: EventItemProps) {
  const toggleComplete = useToggleEventComplete();

  function handleToggle() {
    toggleComplete.mutate(event.id);
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-md border p-3",
        event.completed && "bg-muted/50"
      )}
    >
      <Checkbox
        checked={event.completed}
        onCheckedChange={handleToggle}
        disabled={toggleComplete.isPending}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            {EVENT_TYPE_LABELS[event.event_type] || event.event_type_display}
          </Badge>
          {event.date && (
            <span className="text-xs text-muted-foreground">
              {format(new Date(event.date + "T00:00:00"), "MMM d, yyyy")}
            </span>
          )}
          {event.scheduled_time && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {event.scheduled_time.slice(0, 5)}
            </span>
          )}
        </div>
        {event.address && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className={cn(event.completed && "line-through")}>
              {event.address}
            </span>
          </div>
        )}
        {event.completed && event.completed_by && (
          <p className="text-xs text-muted-foreground mt-1">
            Completed by {event.completed_by}
            {event.completed_at &&
              ` on ${format(new Date(event.completed_at), "MMM d, yyyy 'at' h:mm a")}`}
          </p>
        )}
      </div>
    </div>
  );
}
