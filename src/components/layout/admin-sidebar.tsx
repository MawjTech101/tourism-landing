"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Plane,
  Tag,
  FileText,
  Settings,
  MessageSquare,
  Building2,
  Compass,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Trips",
    href: "/admin/trips",
    icon: Plane,
  },
  {
    title: "Deals",
    href: "/admin/deals",
    icon: Tag,
  },
  {
    title: "Pages",
    href: "/admin/pages",
    icon: FileText,
  },
  {
    title: "Inquiries",
    href: "/admin/inquiries",
    icon: MessageSquare,
  },
];

const superAdminItems = [
  {
    title: "Tenants",
    href: "/admin/tenants",
    icon: Building2,
  },
];

export function AdminSidebar({ isSuperAdmin }: { isSuperAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="p-5">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#51487E] to-[#AB4E83] shadow-sm">
            <Compass className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight">SafarCMS</span>
            <span className="block text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              Admin Panel
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent className="px-2 pt-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/60">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/admin/settings"}
                >
                  <Link href="/admin/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/60">
              Platform
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {superAdminItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(item.href)}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="rounded-xl bg-gradient-to-r from-[#51487E]/5 to-[#AB4E83]/5 px-4 py-3">
          <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/60">
            Powered by
          </p>
          <p className="text-xs font-bold text-foreground/80">SafarCMS</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
