import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search, X, Users } from "lucide-react";
import { PageHeader, EmptyState, LoadingState } from "@/components/dashboard/Shared";

export default function PatientListView() {
  const [searchQuery, setSearchQuery] = useState("");
  const patients = useQuery(api.patients.list, { search: searchQuery || undefined, activeOnly: true });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <PageHeader
        title="Patient Records"
        description="Search and view registered patients"
      />

      {/* ─── Search Bar ──────────────────────────────── */}
      <div className="glass mt-6 flex items-center gap-3 rounded-xl px-4 py-3">
        <Search className="size-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Search by name, medical ID, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* ─── Patient Table / Cards ───────────────────── */}
      <div className="glass-card mt-4 overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Medical ID</th>
                <th>Blood Type</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {patients === undefined ? (
                <tr><td colSpan={4}><LoadingState /></td></tr>
              ) : patients.length === 0 ? (
                <tr><td colSpan={4}>
                  <EmptyState
                    icon={Users}
                    title="No patients found"
                    description={searchQuery ? "Try a different search term." : "Register your first patient to get started."}
                  />
                </td></tr>
              ) : patients.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{p.firstName} {p.lastName}</p>
                        <p className="text-xs text-muted-foreground truncate">{p.email || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-xs text-primary bg-primary/10 rounded-md px-2 py-0.5">{p.medicalId}</span>
                  </td>
                  <td>
                    <span className="badge badge-danger">{p.bloodType}</span>
                  </td>
                  <td className="text-sm text-muted-foreground">{p.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden">
          {patients === undefined ? (
            <LoadingState />
          ) : patients.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No patients found"
              description={searchQuery ? "Try a different search term." : "Register your first patient to get started."}
            />
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {patients.map((p) => (
                <div key={p._id} className="flex items-center gap-3 p-4">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                    {p.firstName[0]}{p.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-muted-foreground">{p.medicalId} · {p.phone}</p>
                  </div>
                  <span className="badge badge-danger shrink-0">{p.bloodType}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
