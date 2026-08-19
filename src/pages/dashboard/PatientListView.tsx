import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";

export default function PatientListView() {
  const [searchQuery, setSearchQuery] = useState("");
  const patients = useQuery(api.patients.list, { search: searchQuery || undefined, activeOnly: true });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold text-foreground">Patient Records</h1>
      <div className="glass mt-6 flex items-center gap-3 rounded-xl px-4 py-3">
        <Search className="size-4.5 text-muted-foreground" />
        <input type="text" placeholder="Search by name, medical ID, or phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
        {searchQuery && <button onClick={() => setSearchQuery("")}><X className="size-4 text-muted-foreground hover:text-foreground" /></button>}
      </div>
      <div className="glass glass-strong mt-4 overflow-hidden rounded-xl">
        <table className="w-full">
          <thead><tr className="border-b border-white/30 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <th className="px-6 py-4">Patient</th><th className="px-6 py-4">Medical ID</th><th className="px-6 py-4">Blood</th><th className="px-6 py-4">Phone</th>
          </tr></thead>
          <tbody>
            {patients === undefined ? <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin inline mr-2" />Loading...</td></tr>
            : patients.length === 0 ? <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">No patients found.</td></tr>
            : patients.map((p) => (
              <tr key={p._id} className="border-b border-white/20 last:border-0 hover:bg-white/40">
                <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{p.firstName[0]}{p.lastName[0]}</div><div><p className="text-sm font-medium text-foreground">{p.firstName} {p.lastName}</p><p className="text-xs text-muted-foreground">{p.email || "\u2014"}</p></div></div></td>
                <td className="px-6 py-4"><span className="glass rounded-full px-2 py-0.5 text-xs font-mono text-primary">{p.medicalId}</span></td>
                <td className="px-6 py-4"><span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">{p.bloodType}</span></td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{p.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
