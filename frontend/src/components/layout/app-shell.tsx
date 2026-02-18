"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { BottomTabs } from "./bottom-tabs";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="mx-auto max-w-5xl p-4 md:p-6">{children}</div>
      </main>
      <BottomTabs />
    </div>
  );
}
