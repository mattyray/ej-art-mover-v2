"use client";

import { PageHeader } from "@/components/layout/page-header";
import { CalendarView } from "@/components/calendar/calendar-view";
import { Card, CardContent } from "@/components/ui/card";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Calendar" />
      <Card>
        <CardContent className="p-2 sm:p-4">
          <CalendarView height="auto" />
        </CardContent>
      </Card>
    </div>
  );
}
