"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { formatPhone } from "@/lib/phone";

type PhoneInputProps = Omit<React.ComponentProps<"input">, "onChange" | "type"> & {
  onChange?: (value: string) => void;
  value?: string;
};

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ onChange, value, ...props }, ref) => {
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const formatted = formatPhone(e.target.value);
      onChange?.(formatted);
    }

    return (
      <Input
        ref={ref}
        type="tel"
        inputMode="tel"
        value={value ?? ""}
        onChange={handleChange}
        placeholder="(555) 555-5555"
        {...props}
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
