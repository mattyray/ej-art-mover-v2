"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt } from "lucide-react";

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" />
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Invoices coming in Phase 8</p>
          <p className="text-sm text-muted-foreground mt-1">
            Invoice list, detail, and status management will be built here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
