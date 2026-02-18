"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

type CurrencyInputProps = Omit<React.ComponentProps<"input">, "onChange" | "type"> & {
  onChange?: (value: string) => void;
  value?: string;
};

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ onChange, value, ...props }, ref) => {
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      let raw = e.target.value;
      // Allow empty, or digits with optional single decimal + up to 2 places
      raw = raw.replace(/[^0-9.]/g, "");
      // Only keep first decimal point
      const parts = raw.split(".");
      if (parts.length > 2) {
        raw = parts[0] + "." + parts.slice(1).join("");
      }
      // Limit to 2 decimal places
      if (parts.length === 2 && parts[1].length > 2) {
        raw = parts[0] + "." + parts[1].slice(0, 2);
      }
      onChange?.(raw);
    }

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          $
        </span>
        <Input
          ref={ref}
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          className="pl-7"
          value={value ?? ""}
          onChange={handleChange}
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
