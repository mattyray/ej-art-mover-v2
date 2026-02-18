"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FabProps {
  href?: string;
  onClick?: () => void;
  className?: string;
  label?: string;
}

export function Fab({ href, onClick, className, label = "Create" }: FabProps) {
  const buttonContent = (
    <Button
      size="icon"
      className={cn(
        "fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg md:hidden",
        className
      )}
      onClick={onClick}
      aria-label={label}
    >
      <Plus className="h-6 w-6" />
    </Button>
  );

  if (href) {
    return <Link href={href}>{buttonContent}</Link>;
  }

  return buttonContent;
}
