"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ExternalLink, LogOut, User } from "lucide-react";
import { TenantSwitcher } from "@/components/admin/tenant-switcher";

interface AdminTopbarProps {
  isSuperAdmin?: boolean;
  currentSlug?: string;
  tenants?: Array<{ id: string; slug: string; name: string }>;
}

export function AdminTopbar({
  isSuperAdmin,
  currentSlug,
  tenants,
}: AdminTopbarProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border/50 bg-background/80 px-4 backdrop-blur-sm">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <div className="h-5 w-px bg-border/60" />

      {isSuperAdmin && currentSlug && tenants && tenants.length > 0 && (
        <TenantSwitcher currentSlug={currentSlug} tenants={tenants} />
      )}

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="sm"
        asChild
        className="h-8 gap-2 rounded-lg text-xs text-muted-foreground hover:text-foreground"
      >
        <a href="/" target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-3.5 w-3.5" />
          View Site
        </a>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gradient-to-br from-[#51487E]/10 to-[#AB4E83]/10 text-xs font-semibold text-[#51487E]">
                <User className="h-3.5 w-3.5" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="me-2 h-3.5 w-3.5" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
