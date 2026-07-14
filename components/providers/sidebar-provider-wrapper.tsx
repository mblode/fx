"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";

import { SidebarProvider } from "@/components/ui/sidebar";

export function SidebarProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NuqsAdapter>
      <SidebarProvider>{children}</SidebarProvider>
    </NuqsAdapter>
  );
}
