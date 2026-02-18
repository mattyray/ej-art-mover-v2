"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { SearchInput } from "@/components/search-input";
import { ClientCard } from "@/components/clients/client-card";
import { EmptyState } from "@/components/empty-state";
import { ListSkeleton } from "@/components/loading-skeleton";
import { Fab } from "@/components/fab";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useClients } from "@/hooks/use-clients";
import { Plus, Users, ClipboardList } from "lucide-react";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useClients(search || undefined);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const clients = data?.results || [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Clients"
        actions={
          <Link href="/clients/new" className="hidden md:block">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Client
            </Button>
          </Link>
        }
      />

      <SearchInput
        onSearch={handleSearch}
        placeholder="Search clients..."
      />

      {isLoading ? (
        <ListSkeleton count={5} />
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? "No clients found" : "No clients yet"}
          description={
            search
              ? "Try a different search term."
              : "Create your first client to get started."
          }
          action={
            !search && (
              <Link href="/clients/new">
                <Button>Create Client</Button>
              </Link>
            )
          }
        />
      ) : (
        <>
          {/* Mobile: Cards */}
          <div className="space-y-3 md:hidden">
            {clients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>

          {/* Desktop: Table */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-center">Work Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <Link
                        href={`/clients/${client.id}`}
                        className="font-medium hover:underline"
                      >
                        {client.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {client.email || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {client.phone || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="gap-1">
                        <ClipboardList className="h-3 w-3" />
                        {client.work_order_count}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <Fab href="/clients/new" label="New Client" />
    </div>
  );
}
