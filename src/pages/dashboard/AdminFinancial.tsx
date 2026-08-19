import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BarChart3, CreditCard, TrendingUp } from "lucide-react";
import { PageHeader, StatCard, LoadingState } from "@/components/dashboard/Shared";

export default function AdminFinancial() {
  const todayRevenue = useQuery(api.billing.getTodayRevenue);
  const totalRevenue = useQuery(api.billing.getTotalRevenue);
  const dailyChart = useQuery(api.billing.getDailyRevenueChart);
  const recentPayments = useQuery(api.billing.getRecentPayments, { limit: 20 });
  const [range, setRange] = useState<"today" | "week" | "month">("today");
  const now = Date.now();
  const rangeStart = range === "today" ? new Date().setHours(0, 0, 0, 0) : range === "week" ? now - 7 * 86400000 : now - 30 * 86400000;
  const rangeData = useQuery(api.billing.getRevenueByRange, { startDate: rangeStart, endDate: now });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Financial Reports"
        description="Revenue, transactions, and payment analytics"
      />

      {/* ─── Stats Row ───────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 mt-6">
        <StatCard
          label="Today's Revenue"
          value={todayRevenue !== undefined ? `$${todayRevenue.toLocaleString()}` : undefined}
          icon={CreditCard}
          color="text-emerald-400"
          bgColor="bg-emerald-400/10"
        />
        <StatCard
          label="Total Revenue"
          value={totalRevenue !== undefined ? `$${totalRevenue.toLocaleString()}` : undefined}
          icon={TrendingUp}
          color="text-blue-400"
          bgColor="bg-blue-400/10"
        />
      </div>

      {/* ─── Range Selector & Total ──────────────────── */}
      <div className="glass-card mt-6 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Revenue by Period</h3>
          <div className="flex gap-1 bg-white/[0.04] rounded-lg p-0.5">
            {(["today", "week", "month"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  range === r ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === "today" ? "Today" : r === "week" ? "7 Days" : "30 Days"}
              </button>
            ))}
          </div>
        </div>
        <p className="text-3xl font-bold tracking-tight text-foreground">
          ${rangeData?.totalRevenue?.toLocaleString() || "0"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {rangeData?.transactionCount || 0} transactions in this period
        </p>
      </div>

      {/* ─── Payment Method Breakdown ────────────────── */}
      {rangeData && Object.keys(rangeData.byMethod).length > 0 && (
        <div className="glass-card mt-6 p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Revenue by Payment Method</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(rangeData.byMethod).map(([method, amount]) => (
              <div key={method} className="glass rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground capitalize font-medium">{method}</p>
                <p className="text-lg font-bold text-foreground mt-1">${(amount as number).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Daily Chart ─────────────────────────────── */}
      {dailyChart && (
        <div className="glass-card mt-6 p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Daily Revenue — Last 7 Days</h3>
          <div className="space-y-2.5">
            {dailyChart.map((day) => {
              const maxRev = Math.max(...dailyChart.map((d) => d.revenue), 1);
              const pct = (day.revenue / maxRev) * 100;
              return (
                <div key={day.date} className="flex items-center gap-3">
                  <span className="w-20 text-[11px] text-muted-foreground shrink-0">{day.date}</span>
                  <div className="flex-1 h-7 rounded-lg bg-white/[0.03] overflow-hidden">
                    <div
                      className="h-full rounded-lg bg-primary/25 transition-all flex items-center justify-end pr-2"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    >
                      {pct > 15 && (
                        <span className="text-[10px] font-medium text-primary">${day.revenue.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  {pct <= 15 && (
                    <span className="w-16 text-right text-[11px] font-medium text-foreground shrink-0">
                      ${day.revenue.toLocaleString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Recent Transactions ─────────────────────── */}
      {recentPayments && recentPayments.length > 0 && (
        <div className="glass-card mt-6 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h3 className="text-sm font-semibold text-foreground">Recent Transactions</h3>
          </div>
          {/* Desktop */}
          <div className="hidden md:block">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payment #</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Description</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p._id}>
                    <td className="font-mono text-xs text-primary">{p.paymentNumber}</td>
                    <td className="font-medium text-foreground">${p.amount.toLocaleString()}</td>
                    <td><span className="badge badge-neutral capitalize">{p.method}</span></td>
                    <td className="text-xs text-muted-foreground max-w-xs truncate">{p.description}</td>
                    <td className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile */}
          <div className="md:hidden divide-y divide-white/[0.04]">
            {recentPayments.slice(0, 10).map((p) => (
              <div key={p._id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">${p.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </div>
                <div className="text-right">
                  <span className="badge badge-neutral capitalize text-[10px]">{p.method}</span>
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(p.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
