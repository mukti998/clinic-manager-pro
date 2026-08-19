import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Heart } from "lucide-react";
import { StatusBadge, PageHeader, EmptyState, LoadingState } from "@/components/dashboard/Shared";

export default function NurseAssignments() {
  const activeVisits = useQuery(api.visits.getActiveVisits);
  const patients = activeVisits?.filter(
    (v) => v.status === "with_doctor" || v.status === "lab_pending" || v.status === "pharmacy_pending"
  ) || [];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Assigned Patients"
        description="Patients requiring nursing attention today"
      />

      <div className="glass-card mt-6 overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="data-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Visit #</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {!activeVisits ? (
                <tr><td colSpan={3}><LoadingState /></td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan={3}>
                  <EmptyState
                    icon={Heart}
                    title="No patients requiring nursing care"
                    description="Assigned patients will appear here during active consultations."
                  />
                </td></tr>
              ) : patients.map((v) => (
                <tr key={v._id}>
                  <td className="font-mono text-base font-bold text-primary">#{v.tokenNumber}</td>
                  <td className="font-mono text-sm text-muted-foreground">{v.visitNumber}</td>
                  <td><StatusBadge status={v.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden">
          {!activeVisits ? (
            <LoadingState />
          ) : patients.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="No patients requiring nursing care"
              description="Assigned patients will appear here during active consultations."
            />
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {patients.map((v) => (
                <div key={v._id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 font-mono text-sm font-bold text-primary">
                      #{v.tokenNumber}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{v.visitNumber}</p>
                    </div>
                  </div>
                  <StatusBadge status={v.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
