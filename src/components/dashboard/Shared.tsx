import React from "react";

// ─── Shared input class ──────────────────────────────────
export const inputCls =
  "w-full rounded-xl border border-white/8 bg-white/4 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-white/6";

// ─── Field ───────────────────────────────────────────────
export function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

// ─── SectionTitle ────────────────────────────────────────
export function SectionTitle({
  icon: Icon,
  label,
}: {
  icon: React.FC<{ className?: string }>;
  label: string;
}) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
      <Icon className="size-4" />
      {label}
    </h2>
  );
}

// ─── StatusBadge ─────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    waiting: "bg-amber-500/15 text-amber-400",
    with_doctor: "bg-blue-500/15 text-blue-400",
    lab_pending: "bg-violet-500/15 text-violet-400",
    pharmacy_pending: "bg-violet-500/15 text-violet-400",
    completed: "bg-emerald-500/15 text-emerald-400",
    discharged: "bg-gray-500/15 text-gray-400",
    ordered: "bg-amber-500/15 text-amber-400",
    sample_collected: "bg-blue-500/15 text-blue-400",
    in_progress: "bg-blue-500/15 text-blue-400",
    approved: "bg-emerald-500/15 text-emerald-400",
    dispensed: "bg-emerald-500/15 text-emerald-400",
    rejected: "bg-red-500/15 text-red-400",
    pending: "bg-amber-500/15 text-amber-400",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || "bg-gray-500/15 text-gray-400"}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
