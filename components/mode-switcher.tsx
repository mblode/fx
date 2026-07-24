"use client";

import { CheckIcon, ChevronDownIcon } from "blode-icons-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MODE_OPTIONS, modeLabel } from "@/lib/mode";
import type { RenderMode } from "@/lib/mode";
import { cn } from "@/lib/utils";

interface ModeSwitcherProps {
  mode: RenderMode;
  onModeChange: (mode: RenderMode) => void;
  className?: string;
}

export function ModeSwitcher({
  mode,
  onModeChange,
  className,
}: ModeSwitcherProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (next: RenderMode) => {
    onModeChange(next);
    setOpen(false);
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-label="Select render mode"
          className={cn("justify-between active:scale-100", className)}
          variant="outline"
        >
          {modeLabel(mode)}
          <ChevronDownIcon aria-hidden className="size-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-56 p-1 data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100"
      >
        <ul role="listbox">
          {MODE_OPTIONS.map((option) => {
            const isActive = option.value === mode;
            return (
              <li key={option.value}>
                <button
                  aria-selected={isActive}
                  className={cn(
                    "flex w-full cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-accent/50"
                  )}
                  onClick={() => handleSelect(option.value)}
                  role="option"
                  type="button"
                >
                  <CheckIcon
                    aria-hidden
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      isActive ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-muted-foreground text-xs leading-[1.5]">
                      {option.description}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
