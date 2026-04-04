"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Archive,
  Tag,
  Loader2,
} from "lucide-react";
import type { Trip, TripStatus } from "@/lib/types/trips";

interface TripListTableProps {
  trips: Trip[];
  tenantId: string;
}

const STATUS_CONFIG: Record<
  TripStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  draft: {
    label: "Draft",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  archived: {
    label: "Archived",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  },
};

type FilterStatus = TripStatus | "all";

export function TripListTable({ trips: initialTrips, tenantId }: TripListTableProps) {
  const router = useRouter();
  const [trips, setTrips] = useState(initialTrips);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredTrips = filter === "all"
    ? trips
    : trips.filter((t) => t.status === filter);

  async function handleStatusChange(tripId: string, newStatus: TripStatus) {
    setUpdatingId(tripId);
    const supabase = createClient();

    const { error } = await supabase
      .from("trips")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", tripId)
      .eq("tenant_id", tenantId);

    setUpdatingId(null);

    if (error) {
      toast.error("Failed to update status: " + error.message);
      return;
    }

    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: newStatus } : t)),
    );
    toast.success(`Trip marked as ${newStatus}`);
  }

  async function handleDelete(tripId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this trip? This will also remove all related itinerary, hotel links, and media. This action cannot be undone.",
    );
    if (!confirmed) return;

    setDeletingId(tripId);
    const supabase = createClient();

    // Delete related records first (cascade in DB should handle this,
    // but we'll be explicit for safety)
    await supabase.from("trip_media").delete().eq("trip_id", tripId);
    await supabase
      .from("itinerary_activities")
      .delete()
      .in(
        "day_id",
        (
          await supabase
            .from("itinerary_days")
            .select("id")
            .eq("trip_id", tripId)
        ).data?.map((d) => d.id) || [],
      );
    await supabase.from("itinerary_days").delete().eq("trip_id", tripId);
    await supabase.from("trip_hotels").delete().eq("trip_id", tripId);

    const { error } = await supabase
      .from("trips")
      .delete()
      .eq("id", tripId)
      .eq("tenant_id", tenantId);

    setDeletingId(null);

    if (error) {
      toast.error("Failed to delete trip: " + error.message);
      return;
    }

    setTrips((prev) => prev.filter((t) => t.id !== tripId));
    toast.success("Trip deleted");
    router.refresh();
  }

  const statusCounts = {
    all: trips.length,
    active: trips.filter((t) => t.status === "active").length,
    draft: trips.filter((t) => t.status === "draft").length,
    archived: trips.filter((t) => t.status === "archived").length,
  };

  return (
    <div>
      {/* Status filter tabs */}
      <div className="mb-4 flex gap-1 rounded-lg border bg-muted/50 p-1">
        {(["all", "active", "draft", "archived"] as FilterStatus[]).map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === status
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {status === "all" ? "All" : STATUS_CONFIG[status].label}
              <span className="ms-1.5 text-xs text-muted-foreground">
                {statusCounts[status]}
              </span>
            </button>
          ),
        )}
      </div>

      {/* Trip cards / table */}
      {filteredTrips.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No trips match the selected filter.
        </p>
      ) : (
        <div className="space-y-3">
          {filteredTrips.map((trip) => (
            <Card key={trip.id} className="py-0 overflow-hidden">
              <CardContent className="flex items-center gap-4 p-0">
                {/* Cover image */}
                <div className="relative h-24 w-32 shrink-0 overflow-hidden bg-muted">
                  {trip.cover_image_url ? (
                    <Image
                      src={trip.cover_image_url}
                      alt={trip.title_ar}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 items-center gap-6 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/trips/${trip.id}/edit`}
                        className="truncate font-semibold hover:underline"
                        dir="rtl"
                      >
                        {trip.title_ar}
                      </Link>
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CONFIG[trip.status].className}`}
                      >
                        {STATUS_CONFIG[trip.status].label}
                      </span>
                      {trip.is_deal && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                          <Tag className="h-3 w-3" />
                          Deal
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {trip.destination_en || trip.destination_ar}
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="hidden text-center sm:block">
                    <p className="text-sm font-medium">
                      {trip.duration_days}D / {trip.duration_nights}N
                    </p>
                    <p className="text-xs text-muted-foreground">Duration</p>
                  </div>

                  {/* Price */}
                  <div className="hidden text-center md:block">
                    <p className="text-sm font-medium">
                      {trip.price_from}
                      {trip.price_to > trip.price_from
                        ? ` - ${trip.price_to}`
                        : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">Price (OMR)</p>
                  </div>

                  {/* Actions */}
                  <div className="pe-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={
                            deletingId === trip.id || updatingId === trip.id
                          }
                        >
                          {deletingId === trip.id ||
                          updatingId === trip.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/trips/${trip.id}/edit`}>
                            <Pencil className="me-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {trip.status !== "active" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(trip.id, "active")
                            }
                          >
                            <Eye className="me-2 h-4 w-4" />
                            Set Active
                          </DropdownMenuItem>
                        )}
                        {trip.status !== "draft" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(trip.id, "draft")
                            }
                          >
                            <EyeOff className="me-2 h-4 w-4" />
                            Set Draft
                          </DropdownMenuItem>
                        )}
                        {trip.status !== "archived" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(trip.id, "archived")
                            }
                          >
                            <Archive className="me-2 h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDelete(trip.id)}
                        >
                          <Trash2 className="me-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
