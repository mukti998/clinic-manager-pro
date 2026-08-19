import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Stethoscope } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { StatusBadge, PageHeader, EmptyState, LoadingState } from "@/components/dashboard/Shared";
import { useNavigate } from "react-router";

export default function DoctorQueue() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queue = useQuery(api.visits.getDoctorQueue, { doctorId: user?._id as Id<"users"> || ("" as Id<"users">) });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="My Queue"
        description="Patients assigned for consultation today"
      />

      <div className="glass-card mt-6 overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Token</th>
                <th>Fee</th>
                <th>Paid</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {!queue ? (
                <tr><td colSpan={6}><LoadingState /></td></tr>
              ) : queue.length === 0 ? (
                <tr><td colSpan={6}>
                  <EmptyState
                    icon={Stethoscope}
                    title="No patients in queue"
                    description="Patients will appear here when assigned by reception."
                  />
                </td></tr>
              ) : queue.map((v, i) => (
                <tr key={v._id} className={v.status === "with_doctor" ? "bg-primary/[0.03]" : ""}>
                  <td className="text-muted-foreground">{i + 1}</td>
                  <td className="font-mono text-base font-bold text-primary">#{v.tokenNumber}</td>
                  <td className="font-medium text-foreground">${v.consultationFee}</td>
                  <td>
                    <span className={`badge ${v.isPaid ? "badge-success" : "badge-warning"}`}>
                      {v.isPaid ? "Paid" : "Pending"}
                    </span>
                  </td>
                  <td><StatusBadge status={v.status} /></td>
                  <td className="text-right">
                    {(v.status === "with_doctor" || v.status === "waiting") && (
                      <button
                        onClick={() => navigate(`/dashboard/doctor-queue/${v._id}`)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/20"
                      >
                        <Stethoscope className="size-3.5" /> Consult
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden">
          {!queue ? (
            <LoadingState />
          ) : queue.length === 0 ? (
            <EmptyState
              icon={Stethoscope}
              title="No patients in queue"
              description="Patients will appear here when assigned by reception."
            />
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {queue.map((v, i) => (
                <div key={v._id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 font-mono text-sm font-bold text-primary">
                        #{v.tokenNumber}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-foreground">Patient #{i + 1}</p>
                        <p className="text-xs text-muted-foreground">${v.consultationFee} · {v.isPaid ? "Paid" : "Pending"}</p>
                      </div>
                    </div>
                    <StatusBadge status={v.status} />
                  </div>
                  {(v.status === "with_doctor" || v.status === "waiting") && (
                    <button
                      onClick={() => navigate(`/dashboard/doctor-queue/${v._id}`)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary"
                    >
                      <Stethoscope className="size-3.5" /> Consult Patient
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
