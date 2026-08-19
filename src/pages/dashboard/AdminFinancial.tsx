import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground">Financial Reports</h1>
      <p className="mt-1 text-sm text-muted-foreground">Revenue, transactions, and department activity — admin only</p>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="glass glass-strong rounded-xl p-5"><p className="text-xs text-muted-foreground font-medium">Today's Revenue</p><p className="mt-2 text-2xl font-bold text-foreground">${todayRevenue?.toLocaleString() || "0"}</p></div>
        <div className="glass glass-strong rounded-xl p-5"><p className="text-xs text-muted-foreground font-medium">Total Revenue</p><p className="mt-2 text-2xl font-bold text-foreground">${totalRevenue?.toLocaleString() || "0"}</p></div>
        <div className="glass glass-strong rounded-xl p-5"><p className="text-xs text-muted-foreground font-medium">Range Total</p><p className="mt-2 text-2xl font-bold text-foreground">${rangeData?.totalRevenue?.toLocaleString() || "0"}</p>
          <div className="mt-2 flex gap-1">
            {(["today", "week", "month"] as const).map((r) => (
              <button key={r} onClick={() => setRange(r)} className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-all ${range === r ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}>{r === "today" ? "Today" : r === "week" ? "7 Days" : "30 Days"}</button>
            ))}
          </div>
        </div>
      </div>
      {rangeData && Object.keys(rangeData.byMethod).length > 0 && (
        <div className="mt-6 glass glass-strong rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Revenue by Payment Method</h3>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(rangeData.byMethod).map(([method, amount]) => (
              <div key={method} className="text-center"><p className="text-xs text-muted-foreground capitalize">{method}</p><p className="text-lg font-bold text-foreground mt-1">${(amount as number).toLocaleString()}</p></div>
            ))}
          </div>
        </div>
      )}
      {dailyChart && (
        <div className="mt-6 glass glass-strong rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Daily Revenue — Last 7 Days</h3>
          <div className="space-y-2">
            {dailyChart.map((day) => {
              const maxRev = Math.max(...dailyChart.map((d) => d.revenue), 1);
              const pct = (day.revenue / maxRev) * 100;
              return (
                <div key={day.date} className="flex items-center gap-3">
                  <span className="w-24 text-[10px] text-muted-foreground">{day.date}</span>
                  <div className="flex-1 h-6 rounded-lg bg-white/5 overflow-hidden"><div className="h-full rounded-lg bg-primary/30 transition-all" style={{ width: `${Math.max(pct, 2)}%` }} /></div>
                  <span className="w-16 text-right text-xs font-medium text-foreground">${day.revenue.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {recentPayments && recentPayments.length > 0 && (
        <div className="mt-6 glass glass-strong rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5"><h3 className="text-sm font-semibold text-foreground">Recent Transactions</h3></div>
          <table className="w-full">
            <thead><tr className="border-b border-white/5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-6 py-3">Payment #</th><th className="px-6 py-3">Amount</th><th className="px-6 py-3">Method</th><th className="px-6 py-3">Description</th><th className="px-6 py-3">Time</th>
            </tr></thead>
            <tbody>
              {recentPayments.map((p) => (
                <tr key={p._id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="px-6 py-3 font-mono text-xs text-primary">{p.paymentNumber}</td>
                  <td className="px-6 py-3 text-sm font-medium text-foreground">${p.amount.toLocaleString()}</td>
                  <td className="px-6 py-3"><span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-muted-foreground capitalize">{p.method}</span></td>
                  <td className="px-6 py-3 text-xs text-muted-foreground max-w-xs truncate">{p.description}</td>
                  <td className="px-6 py-3 text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
