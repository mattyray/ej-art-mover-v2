"use client";

import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { CalendarView } from "@/components/calendar/calendar-view";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, ClipboardList, FileText } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Button variant="outline" className="h-auto py-3 flex-col gap-1" asChild>
          <Link href="/work-orders/new">
            <ClipboardList className="h-5 w-5" />
            <span className="text-xs">New Work Order</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-3 flex-col gap-1" asChild>
          <Link href="/clients/new">
            <Users className="h-5 w-5" />
            <span className="text-xs">New Client</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-3 flex-col gap-1" asChild>
          <Link href="/invoices/new">
            <FileText className="h-5 w-5" />
            <span className="text-xs">New Invoice</span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-3 flex-col gap-1" asChild>
          <Link href="/work-orders">
            <Plus className="h-5 w-5" />
            <span className="text-xs">All Jobs</span>
          </Link>
        </Button>
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="p-2 sm:p-4">
          <CalendarView height="auto" />
        </CardContent>
      </Card>
    </div>
  );
}
