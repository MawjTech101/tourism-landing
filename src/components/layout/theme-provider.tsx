import { getTenantConfig } from "@/lib/tenant/config";
import type { CSSProperties, ReactNode } from "react";

export async function ThemeProvider({ children }: { children: ReactNode }) {
  const config = await getTenantConfig();

  const cssVariables: CSSProperties & Record<string, string> = {
    "--tenant-primary": config.color_primary,
    "--tenant-secondary": config.color_secondary,
    "--tenant-accent": config.color_accent,
  };

  return <div style={cssVariables}>{children}</div>;
}
