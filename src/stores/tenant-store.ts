import { create } from "zustand";
import type { SiteConfig } from "@/lib/tenant/types";

interface TenantStore {
  config: SiteConfig | null;
  setConfig: (config: SiteConfig) => void;
  updateConfig: (partial: Partial<SiteConfig>) => void;
}

export const useTenantStore = create<TenantStore>((set) => ({
  config: null,
  setConfig: (config) => set({ config }),
  updateConfig: (partial) =>
    set((state) => ({
      config: state.config ? { ...state.config, ...partial } : null,
    })),
}));
