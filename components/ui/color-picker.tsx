"use client";

import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ColorPickerProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ColorPicker({
  id,
  label,
  value,
  onChange,
  disabled = false,
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (/^#[0-9A-Fa-f]{0,6}$/.test(newValue)) {
      onChange(newValue.toUpperCase());
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild>
            <button
              aria-label={`Pick ${label.toLowerCase()}`}
              className="h-10 w-10 shrink-0 rounded-md border border-input disabled:cursor-not-allowed disabled:opacity-50"
              disabled={disabled}
              style={{ backgroundColor: value }}
              type="button"
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <HexColorPicker color={value} onChange={onChange} />
          </PopoverContent>
        </Popover>
        <Input
          className="font-mono"
          disabled={disabled}
          id={id}
          maxLength={7}
          onChange={handleInputChange}
          placeholder="#000000"
          type="text"
          value={value}
        />
      </div>
    </div>
  );
}
