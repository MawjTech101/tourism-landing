"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Trash2,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react";

export interface Inquiry {
  id: string;
  tenant_id: string;
  trip_id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  message: string | null;
  source: "whatsapp_click" | "call_click" | "form";
  status: "new" | "contacted" | "closed";
  created_at: string;
  trip_title?: string | null;
}

interface InquiriesTableProps {
  inquiries: Inquiry[];
  tenantId: string;
}

const SOURCE_CONFIG = {
  whatsapp_click: {
    label: "WhatsApp",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    icon: MessageSquare,
  },
  call_click: {
    label: "Call",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: Phone,
  },
  form: {
    label: "Form",
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    icon: Send,
  },
} as const;

const STATUS_CONFIG = {
  new: {
    label: "New",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    dot: "bg-red-500",
  },
  contacted: {
    label: "Contacted",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    dot: "bg-yellow-500",
  },
  closed: {
    label: "Closed",
    className:
      "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400",
    dot: "bg-gray-400",
  },
} as const;

const STATUS_ORDER: Array<"new" | "contacted" | "closed"> = [
  "new",
  "contacted",
  "closed",
];

export function InquiriesTable({ inquiries: initial, tenantId }: InquiriesTableProps) {
  const [inquiries, setInquiries] = useState(initial);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleStatusChange(
    id: string,
    newStatus: "new" | "contacted" | "closed"
  ) {
    setUpdatingId(id);

    const supabase = createClient();
    const { error } = await supabase
      .from("inquiries")
      .update({ status: newStatus })
      .eq("id", id)
      .eq("tenant_id", tenantId);

    setUpdatingId(null);

    if (error) {
      toast.error("Failed to update status: " + error.message);
      return;
    }

    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
    );
    toast.success(`Status updated to "${newStatus}".`);
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this inquiry? This action cannot be undone."
    );
    if (!confirmed) return;

    setDeletingId(id);

    const supabase = createClient();
    const { error } = await supabase
      .from("inquiries")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId);

    setDeletingId(null);

    if (error) {
      toast.error("Failed to delete inquiry: " + error.message);
      return;
    }

    setInquiries((prev) => prev.filter((inq) => inq.id !== id));
    toast.success("Inquiry deleted.");
  }

  if (inquiries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border py-16">
        <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <p className="mb-1 text-lg font-medium text-muted-foreground">
          No inquiries yet
        </p>
        <p className="text-sm text-muted-foreground/70">
          Inquiries from your website visitors will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">
                Contact
              </th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">
                Message
              </th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">
                Source
              </th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">
                Trip
              </th>
              <th className="px-4 py-3 text-start font-medium text-muted-foreground">
                Date
              </th>
              <th className="px-4 py-3 text-end font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => {
              const source = SOURCE_CONFIG[inquiry.source];
              const status = STATUS_CONFIG[inquiry.status];
              const isUpdating = updatingId === inquiry.id;
              const isDeleting = deletingId === inquiry.id;

              return (
                <tr
                  key={inquiry.id}
                  className={`border-b last:border-b-0 hover:bg-muted/30 ${
                    isDeleting ? "opacity-50" : ""
                  }`}
                >
                  {/* Name */}
                  <td className="px-4 py-3 font-medium">{inquiry.name}</td>

                  {/* Contact */}
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      {inquiry.phone && (
                        <div className="text-xs text-muted-foreground">
                          {inquiry.phone}
                        </div>
                      )}
                      {inquiry.email && (
                        <div className="text-xs text-muted-foreground">
                          {inquiry.email}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Message */}
                  <td className="max-w-[200px] px-4 py-3">
                    {inquiry.message ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {inquiry.message}
                      </p>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">
                        --
                      </span>
                    )}
                  </td>

                  {/* Source badge */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${source.className}`}
                    >
                      <source.icon className="h-3 w-3" />
                      {source.label}
                    </span>
                  </td>

                  {/* Status badge */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                      />
                      {status.label}
                    </span>
                  </td>

                  {/* Trip */}
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {inquiry.trip_title || (
                      <span className="text-muted-foreground/50">--</span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(inquiry.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            disabled={isUpdating || isDeleting}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          {STATUS_ORDER.map((s) => (
                            <DropdownMenuItem
                              key={s}
                              disabled={inquiry.status === s}
                              onClick={() => handleStatusChange(inquiry.id, s)}
                            >
                              <span
                                className={`me-2 h-2 w-2 rounded-full ${STATUS_CONFIG[s].dot}`}
                              />
                              {STATUS_CONFIG[s].label}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(inquiry.id)}
                          >
                            <Trash2 className="me-2 h-3.5 w-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
