"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Building2, ChevronDown, Check } from "lucide-react";

interface TenantInfo {
  id: string;
  slug: string;
  name: string;
}

interface TenantSwitcherProps {
  currentSlug: string;
  tenants: TenantInfo[];
}

export function TenantSwitcher({ currentSlug, tenants }: TenantSwitcherProps) {
  const currentTenant = tenants.find((t) => t.slug === currentSlug);

  function switchTenant(slug: string) {
    if (slug === currentSlug) return;

    const isLocalhost =
      window.location.hostname.includes("localhost") ||
      window.location.hostname.includes("127.0.0.1");

    if (isLocalhost) {
      // Local dev: set cookie and reload
      document.cookie = `dev-tenant-slug=${slug};path=/;max-age=86400`;
      window.location.href = "/admin/dashboard";
    } else {
      // Production: navigate to subdomain
      const baseDomain =
        process.env.NEXT_PUBLIC_BASE_DOMAIN || "safarcms.com";
      window.location.href = `https://${slug}.${baseDomain}/admin/dashboard`;
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Building2 className="h-4 w-4" />
          <span className="max-w-[150px] truncate">
            {currentTenant?.name || currentSlug}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Switch Tenant</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {tenants.map((tenant) => (
          <DropdownMenuItem
            key={tenant.id}
            onClick={() => switchTenant(tenant.slug)}
          >
            {tenant.slug === currentSlug && (
              <Check className="me-2 h-3.5 w-3.5" />
            )}
            <span className={tenant.slug !== currentSlug ? "ms-5.5" : ""}>
              {tenant.name}
            </span>
            <span className="ms-auto text-xs text-muted-foreground">
              {tenant.slug}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
