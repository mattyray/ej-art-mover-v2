"use client";

import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkOrders } from "@/hooks/use-work-orders";
import type { WorkOrderListItem } from "@/types";

interface WorkOrderSelectProps {
  clientId?: number;
  value: number | null;
  onSelect: (id: number | null) => void;
}

export function WorkOrderSelect({
  clientId,
  value,
  onSelect,
}: WorkOrderSelectProps) {
  const [open, setOpen] = useState(false);
  const { data } = useWorkOrders(
    clientId
      ? { status: "completed", invoiced: "false", client: clientId }
      : undefined
  );

  const workOrders: WorkOrderListItem[] = data?.results ?? [];
  const selected = workOrders.find((wo) => wo.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={!clientId}
        >
          {selected
            ? `WO #${selected.id} — ${selected.job_description || "No description"}`
            : clientId
              ? "Select work order (optional)"
              : "Select a client first"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search work orders..." />
          <CommandList>
            <CommandEmpty>No work orders found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onSelect(null);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === null ? "opacity-100" : "opacity-0"
                  )}
                />
                None
              </CommandItem>
              {workOrders.map((wo) => (
                <CommandItem
                  key={wo.id}
                  value={`WO #${wo.id} ${wo.job_description || ""}`}
                  onSelect={() => {
                    onSelect(wo.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === wo.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">
                    WO #{wo.id} — {wo.job_description || "No description"}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
