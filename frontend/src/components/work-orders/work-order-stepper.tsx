"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkOrderStatus } from "@/types";

const STEPS = [
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "Scheduled" },
  { key: "completed", label: "Completed" },
  { key: "invoiced", label: "Invoiced" },
] as const;

function getActiveIndex(status: WorkOrderStatus, invoiced: boolean): number {
  if (status === "completed" && invoiced) return 3;
  if (status === "completed") return 2;
  if (status === "in_progress") return 1;
  return 0;
}

interface WorkOrderStepperProps {
  status: WorkOrderStatus;
  invoiced: boolean;
  className?: string;
}

export function WorkOrderStepper({
  status,
  invoiced,
  className,
}: WorkOrderStepperProps) {
  const activeIndex = getActiveIndex(status, invoiced);

  return (
    <div className={cn("flex items-center w-full", className)}>
      {STEPS.map((step, i) => {
        const isCompleted = i < activeIndex;
        const isCurrent = i === activeIndex;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                  isCompleted &&
                    "border-green-600 bg-green-600 text-white",
                  isCurrent &&
                    "border-blue-600 bg-blue-600 text-white",
                  !isCompleted &&
                    !isCurrent &&
                    "border-muted-foreground/30 bg-background text-muted-foreground/50"
                )}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium leading-tight text-center whitespace-nowrap",
                  isCompleted && "text-green-700",
                  isCurrent && "text-blue-700",
                  !isCompleted && !isCurrent && "text-muted-foreground/50"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line (not after last step) */}
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-1.5 mt-[-16px]",
                  i < activeIndex ? "bg-green-600" : "bg-muted-foreground/20"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
