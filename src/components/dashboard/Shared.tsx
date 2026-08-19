import React from "react";

// ─── Shared input class ──────────────────────────────────
export const inputCls =
  "w-full rounded-xl border border-white/8 bg-white/[0.03] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-white/[0.05]";

// ─── Field ───────────────────────────────────────────────
export function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
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
    <h2 className="mb-4 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-primary">
      <Icon className="size-4" />
      {label}
    </h2>
  );
}

// ─── StatusBadge ─────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    waiting: "badge-warning",
    with_doctor: "badge-info",
    lab_pending: "badge-primary",
    pharmacy_pending: "badge-primary",
    completed: "badge-success",
    discharged: "badge-neutral",
    ordered: "badge-warning",
    sample_collected: "badge-info",
    in_progress: "badge-info",
    approved: "badge-success",
    dispensed: "badge-success",
    rejected: "badge-danger",
    pending: "badge-warning",
    cancelled: "badge-danger",
    active: "badge-success",
    inactive: "badge-neutral",
  };
  return (
    <span className={`badge ${colors[status] || "badge-neutral"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ─── Empty State ─────────────────────────────────────────
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-white/[0.04] mb-4">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── Loading State ───────────────────────────────────────
export function LoadingState({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative size-8">
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{text}</p>
    </div>
  );
}

// ─── Page Header ─────────────────────────────────────────
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────
export function StatCard({
  label,
  value,
  icon: Icon,
  color = "text-primary",
  bgColor = "bg-primary/10",
}: {
  label: string;
  value: string | number | undefined;
  icon: React.FC<{ className?: string }>;
  color?: string;
  bgColor?: string;
}) {
  return (
    <div className="glass-card stat-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className={`flex size-8 items-center justify-center rounded-lg ${bgColor}`}>
          <Icon className={`size-4 ${color}`} />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
        {value !== undefined ? value : "—"}
      </p>
    </div>
  );
}
