"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { useGoogleMaps } from "@/components/providers/google-maps-provider";

type AddressAutocompleteProps = Omit<React.ComponentProps<"input">, "onChange"> & {
  onChange?: (value: string) => void;
  value?: string;
};

const AddressAutocomplete = React.forwardRef<HTMLInputElement, AddressAutocompleteProps>(
  ({ onChange, value, ...props }, ref) => {
    const { isLoaded } = useGoogleMaps();
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const autocompleteRef = React.useRef<google.maps.places.Autocomplete | null>(null);
    // Use a ref for onChange so the place_changed listener always calls the latest version
    const onChangeRef = React.useRef(onChange);
    onChangeRef.current = onChange;

    const setRefs = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    // Attach Google Places Autocomplete directly to the input element
    React.useEffect(() => {
      if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "us" },
        types: ["address"],
        fields: ["formatted_address"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place?.formatted_address) {
          onChangeRef.current?.(place.formatted_address);
        } else if (inputRef.current) {
          onChangeRef.current?.(inputRef.current.value);
        }
      });

      autocompleteRef.current = autocomplete;

      return () => {
        google.maps.event.clearInstanceListeners(autocomplete);
        autocompleteRef.current = null;
      };
    }, [isLoaded]);

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
      onChange?.(e.target.value);
    }

    return (
      <Input
        ref={setRefs}
        value={value ?? ""}
        onChange={handleInputChange}
        placeholder={isLoaded ? "Start typing an address..." : "123 Main St, City, State"}
        {...props}
      />
    );
  }
);

AddressAutocomplete.displayName = "AddressAutocomplete";

export { AddressAutocomplete };
