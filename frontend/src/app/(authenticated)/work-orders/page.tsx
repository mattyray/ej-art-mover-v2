"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export default function WorkOrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Work Orders" />
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Work Orders coming in Phase 5</p>
          <p className="text-sm text-muted-foreground mt-1">
            List, detail, create, and edit views will be built here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
