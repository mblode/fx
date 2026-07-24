"use client";

import { AsciiControlsPanel } from "@/components/ascii/controls-panel";
import { CraftedBy } from "@/components/crafted-by";
import { ControlsPanel } from "@/components/dither/controls-panel";
import { ModeSwitcher } from "@/components/mode-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import type { AsciiParameters } from "@/hooks/use-ascii";
import type { DitherParameters } from "@/lib/dither/types";
import type { RenderMode } from "@/lib/mode";

interface AppSidebarProps {
  mode: RenderMode;
  onModeChange: (mode: RenderMode) => void;
  disabled: boolean;
  originalDimensions?: { width: number; height: number } | null;
  ditherParameters: DitherParameters;
  onDitherParametersChange: (params: Partial<DitherParameters>) => void;
  asciiParameters: AsciiParameters;
  onAsciiParametersChange: (params: Partial<AsciiParameters>) => void;
}

const MODE_DESCRIPTIONS: Record<RenderMode, string> = {
  "blue-noise": "Apply high-quality blue noise dithering to your images",
  ascii: "Turn your images into glyph-based ASCII art",
  led: "Render your images as a red-to-white LED dot matrix",
};

export function AppSidebar({
  mode,
  onModeChange,
  disabled,
  originalDimensions,
  ditherParameters,
  onDitherParametersChange,
  asciiParameters,
  onAsciiParametersChange,
}: AppSidebarProps) {
  return (
    <Sidebar mobileVariant="none" variant="inset">
      <SidebarHeader className="hidden gap-3 px-2 md:flex">
        <ModeSwitcher mode={mode} onModeChange={onModeChange} />
        <p className="text-sm leading-[1.6]" style={{ textWrap: "pretty" }}>
          {MODE_DESCRIPTIONS[mode]}
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="py-3">
            {mode === "blue-noise" ? (
              <ControlsPanel
                disabled={disabled}
                onParametersChange={onDitherParametersChange}
                originalDimensions={originalDimensions}
                parameters={ditherParameters}
              />
            ) : (
              <AsciiControlsPanel
                disabled={disabled}
                ledMode={mode === "led"}
                onParametersChange={onAsciiParametersChange}
                parameters={asciiParameters}
                renderDimensions={originalDimensions}
              />
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="hidden gap-2 px-2 md:flex">
        <nav aria-label="Related projects">
          <ul className="flex flex-col gap-1 text-muted-foreground text-sm">
            <li>
              <a
                className="transition-colors hover:text-foreground"
                href="https://github.com/mblode/fx"
                rel="noopener noreferrer"
                target="_blank"
              >
                GitHub
              </a>
            </li>
          </ul>
        </nav>
        <CraftedBy />
      </SidebarFooter>
    </Sidebar>
  );
}
