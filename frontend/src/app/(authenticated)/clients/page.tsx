"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Clients" />
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Clients coming in Phase 4</p>
          <p className="text-sm text-muted-foreground mt-1">
            Client list, detail, and CRUD forms will be built here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
