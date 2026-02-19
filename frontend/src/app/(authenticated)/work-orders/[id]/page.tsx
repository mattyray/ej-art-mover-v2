"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { DetailSkeleton } from "@/components/loading-skeleton";
import { WorkOrderStepper } from "@/components/work-orders/work-order-stepper";
import { EventList } from "@/components/work-orders/event-list";
import { AttachmentGrid } from "@/components/work-orders/attachment-grid";
import { NoteList } from "@/components/work-orders/note-list";
import { WorkOrderActions } from "@/components/work-orders/work-order-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useWorkOrder } from "@/hooks/use-work-orders";
import {
  ArrowLeft,
  CalendarDays,
  Paperclip,
  MessageSquare,
  ChevronDown,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";

export default function WorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const workOrderId = Number(id);
  const { data: workOrder, isLoading } = useWorkOrder(workOrderId);

  if (isLoading) return <DetailSkeleton />;
  if (!workOrder) return null;

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="gap-1"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <PageHeader
        title={`Work Order #${workOrder.id}`}
        subtitle={
          <Link
            href={`/clients/${workOrder.client}`}
            className="hover:underline"
          >
            {workOrder.client_name}
          </Link>
        }
        actions={<WorkOrderActions workOrder={workOrder} />}
      />

      {/* Lifecycle Stepper */}
      <Card>
        <CardContent className="pt-6 pb-5">
          <WorkOrderStepper
            status={workOrder.status}
            invoiced={workOrder.invoiced}
          />
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            {workOrder.estimated_cost && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Estimated Cost</p>
                <p className="flex items-center gap-1 font-medium">
                  <DollarSign className="h-4 w-4" />
                  {parseFloat(workOrder.estimated_cost).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm">
                {format(new Date(workOrder.created_at), "MMM d, yyyy")}
              </p>
            </div>
            {workOrder.completed_at && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-sm">
                  {format(new Date(workOrder.completed_at), "MMM d, yyyy")}
                </p>
              </div>
            )}
          </div>
          {workOrder.job_description && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="text-sm whitespace-pre-wrap">
                {workOrder.job_description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Events */}
      <Collapsible defaultOpen>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4 w-4" />
                Events
                <span className="text-muted-foreground font-normal">
                  ({workOrder.events.length})
                </span>
              </CardTitle>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <EventList events={workOrder.events} />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Attachments */}
      <Collapsible defaultOpen>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Paperclip className="h-4 w-4" />
                Attachments
                <span className="text-muted-foreground font-normal">
                  ({workOrder.attachments.length})
                </span>
              </CardTitle>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <AttachmentGrid
                workOrderId={workOrder.id}
                attachments={workOrder.attachments}
              />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Notes */}
      <Collapsible defaultOpen>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4" />
                Notes
                <span className="text-muted-foreground font-normal">
                  ({workOrder.notes.length})
                </span>
              </CardTitle>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <NoteList workOrderId={workOrder.id} notes={workOrder.notes} />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
