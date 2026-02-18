"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { CalendarView } from "@/components/calendar/calendar-view";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { format, parseISO, startOfWeek, endOfWeek } from "date-fns";

export default function WeekViewPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = use(params);
  const router = useRouter();
  const parsedDate = parseISO(date);
  const weekStart = startOfWeek(parsedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(parsedDate, { weekStartsOn: 1 });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Week View"
        subtitle={`${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.push("/calendar")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Calendar
          </Button>
        }
      />
      <Card>
        <CardContent className="p-2 sm:p-4">
          <CalendarView
            initialView="dayGridWeek"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "",
            }}
            height="auto"
          />
        </CardContent>
      </Card>
    </div>
  );
}
