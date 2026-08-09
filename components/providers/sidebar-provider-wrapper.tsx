"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";

import { SidebarProvider } from "@/components/ui/sidebar";

export function SidebarProviderWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <NuqsAdapter>
      <SidebarProvider className={className}>{children}</SidebarProvider>
    </NuqsAdapter>
  );
}
