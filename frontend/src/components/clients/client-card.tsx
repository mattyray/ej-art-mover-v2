"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, ClipboardList } from "lucide-react";
import type { Client } from "@/types";

interface ClientCardProps {
  client: Client;
}

export function ClientCard({ client }: ClientCardProps) {
  return (
    <Link href={`/clients/${client.id}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold">{client.name}</h3>
              {client.email && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {client.email}
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  {client.phone}
                </div>
              )}
            </div>
            <Badge variant="secondary" className="gap-1">
              <ClipboardList className="h-3 w-3" />
              {client.work_order_count}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
