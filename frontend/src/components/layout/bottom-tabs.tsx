"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Receipt,
  Menu,
  CalendarDays,
  LogOut,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const tabs = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/work-orders", label: "Jobs", icon: ClipboardList },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/invoices", label: "Invoices", icon: Receipt },
];

export function BottomTabs() {
  const pathname = usePathname();
  const { logout } = useAuth();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      <nav className="flex h-16 items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}

        <Drawer>
          <DrawerTrigger asChild>
            <button
              className="flex flex-col items-center gap-1 px-3 py-2 text-xs text-muted-foreground"
            >
              <Menu className="h-5 w-5" />
              <span>More</span>
            </button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Menu</DrawerTitle>
            </DrawerHeader>
            <div className="space-y-1 px-4 pb-8">
              <Link
                href="/calendar"
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors",
                  pathname.startsWith("/calendar")
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-accent"
                )}
              >
                <CalendarDays className="h-5 w-5" />
                Calendar
              </Link>
              <Separator className="my-2" />
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 py-3 text-destructive hover:text-destructive"
                onClick={logout}
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      </nav>
    </div>
  );
}
