"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Calendar" />
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Calendar coming in Phase 7</p>
          <p className="text-sm text-muted-foreground mt-1">
            Month, week, and day views with drag-and-drop will be built here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
