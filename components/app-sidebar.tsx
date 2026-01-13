"use client";

import { ControlsPanel } from "@/components/dither/controls-panel";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import type { DitherParameters } from "@/lib/dither/types";

interface AppSidebarProps {
  uploadedImage: File | null;
  parameters: DitherParameters;
  originalDimensions?: { width: number; height: number } | null;
  onParametersChange: (params: Partial<DitherParameters>) => void;
}

export function AppSidebar({
  uploadedImage,
  parameters,
  originalDimensions,
  onParametersChange,
}: AppSidebarProps) {
  return (
    <Sidebar variant="inset">
      <SidebarHeader className="border-b px-3 py-3">
        <h1 className="font-bold text-xl tracking-tight">Blue noise dither</h1>
        <p className="text-muted-foreground text-sm">
          Apply high-quality blue noise dithering to your images
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="py-3">
            <ControlsPanel
              disabled={!uploadedImage}
              onParametersChange={onParametersChange}
              originalDimensions={originalDimensions}
              parameters={parameters}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
