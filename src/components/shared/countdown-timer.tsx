"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface CountdownTimerProps {
  expiryDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(expiryDate: string): TimeLeft | null {
  const difference = new Date(expiryDate).getTime() - Date.now();
  if (difference <= 0) return null;

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export function CountdownTimer({ expiryDate }: CountdownTimerProps) {
  const t = useTranslations("deal");
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
    calculateTimeLeft(expiryDate)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(expiryDate);
      setTimeLeft(newTimeLeft);
      if (!newTimeLeft) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryDate]);

  if (!timeLeft) {
    return (
      <span className="inline-flex items-center rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive">
        {t("expired")}
      </span>
    );
  }

  const segments = [
    { value: timeLeft.days, label: t("days") },
    { value: timeLeft.hours, label: t("hours") },
    { value: timeLeft.minutes, label: t("minutes") },
    { value: timeLeft.seconds, label: t("seconds") },
  ];

  return (
    <div className="flex items-center gap-2">
      {segments.map((segment, i) => (
        <div key={segment.label} className="flex items-center gap-2">
          <div className="flex flex-col items-center rounded-xl bg-gradient-to-b from-brand-primary/10 to-brand-primary/5 px-3 py-2">
            <span className="text-base font-bold tabular-nums text-brand-primary">
              {String(segment.value).padStart(2, "0")}
            </span>
            <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
              {segment.label}
            </span>
          </div>
          {i < segments.length - 1 && (
            <span className="text-xs font-bold text-brand-primary/40">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
