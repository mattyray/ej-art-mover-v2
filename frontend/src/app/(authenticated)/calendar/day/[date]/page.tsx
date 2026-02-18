"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { DayEventList } from "@/components/calendar/day-event-list";
import { CardSkeleton } from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useEvents } from "@/hooks/use-events";
import { format, parseISO, addDays, subDays } from "date-fns";

export default function DayViewPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = use(params);
  const router = useRouter();
  const parsedDate = parseISO(date);
  const { data, isLoading } = useEvents({ date });

  const events = data?.results ?? [];
  const sorted = [...events].sort(
    (a, b) => (a.daily_order ?? 999) - (b.daily_order ?? 999)
  );

  const prevDate = format(subDays(parsedDate, 1), "yyyy-MM-dd");
  const nextDate = format(addDays(parsedDate, 1), "yyyy-MM-dd");

  return (
    <div className="space-y-6">
      <PageHeader
        title={format(parsedDate, "EEEE, MMMM d, yyyy")}
        subtitle={`${events.length} event${events.length !== 1 ? "s" : ""}`}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/calendar")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Calendar
          </Button>
        }
      />

      {/* Day navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/calendar/day/${prevDate}`)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {format(subDays(parsedDate, 1), "MMM d")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            router.push(
              `/calendar/day/${format(new Date(), "yyyy-MM-dd")}`
            )
          }
        >
          Today
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/calendar/day/${nextDate}`)}
        >
          {format(addDays(parsedDate, 1), "MMM d")}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {isLoading ? <CardSkeleton /> : <DayEventList events={sorted} />}
    </div>
  );
}
