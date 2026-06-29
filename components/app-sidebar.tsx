"use client";

import { ControlsPanel } from "@/components/dither/controls-panel";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
    <Sidebar mobileVariant="none" variant="inset">
      <SidebarHeader className="hidden px-2 md:flex">
        <p
          className="font-bold text-xl tracking-tight md:text-2xl"
          style={{ textWrap: "balance" }}
        >
          Blue noise
        </p>
        <p className="text-sm leading-[1.6]" style={{ textWrap: "pretty" }}>
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
      <SidebarFooter className="hidden px-2 md:flex">
        <nav aria-label="Related projects">
          <ul className="flex flex-col gap-1 text-muted-foreground text-sm">
            <li>
              <a
                className="transition-colors hover:text-foreground"
                href="https://www.npmjs.com/package/blue-noise"
                rel="noopener noreferrer"
                target="_blank"
              >
                Blue noise npm package
              </a>
            </li>
            <li>
              <a
                className="transition-colors hover:text-foreground"
                href="https://github.com/mblode/blue-noise-typescript"
                rel="noopener noreferrer"
                target="_blank"
              >
                Source on GitHub
              </a>
            </li>
            <li>
              <a
                className="transition-colors hover:text-foreground"
                href="https://dither.blode.co"
                rel="noopener noreferrer"
                target="_blank"
              >
                More dithering tools
              </a>
            </li>
          </ul>
        </nav>
      </SidebarFooter>
    </Sidebar>
  );
}
