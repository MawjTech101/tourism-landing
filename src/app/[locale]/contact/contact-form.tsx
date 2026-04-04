"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { useActionState } from "react";
import { submitInquiry } from "./actions";

interface ContactFormProps {
  tenantId: string;
}

export function ContactForm({ tenantId }: ContactFormProps) {
  const t = useTranslations("inquiry");

  const [state, formAction, isPending] = useActionState(submitInquiry, {
    success: false,
    error: null,
  });

  if (state.success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/20">
          <CheckCircle2 className="h-9 w-9 text-green-600" />
        </div>
        <h3 className="mb-2 text-xl font-bold">{t("success")}</h3>
        <p className="text-muted-foreground">{t("successMessage")}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="tenantId" value={tenantId} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-semibold">
            {t("name")}
          </Label>
          <Input
            id="name"
            name="name"
            required
            placeholder={t("namePlaceholder")}
            className="rounded-xl border-border/50 bg-muted/30 transition-colors focus:bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-semibold">
            {t("phone")}
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            dir="ltr"
            placeholder={t("phonePlaceholder")}
            className="rounded-xl border-border/50 bg-muted/30 transition-colors focus:bg-background"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-semibold">
          {t("email")}
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder={t("emailPlaceholder")}
          className="rounded-xl border-border/50 bg-muted/30 transition-colors focus:bg-background"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-sm font-semibold">
          {t("message")}
        </Label>
        <Textarea
          id="message"
          name="message"
          rows={4}
          required
          placeholder={t("messagePlaceholder")}
          className="rounded-xl border-border/50 bg-muted/30 transition-colors focus:bg-background"
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-brand-primary py-6 text-white shadow-lg shadow-brand-primary/20 transition-all hover:bg-brand-primary/90 hover:shadow-xl"
        size="lg"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {t("send")}
      </Button>
    </form>
  );
}
