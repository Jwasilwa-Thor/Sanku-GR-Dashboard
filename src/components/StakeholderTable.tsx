import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Stakeholder } from "@/types";

const influenceColor: Record<string, string> = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-orange-100 text-orange-700",
  "Very High": "bg-red-100 text-red-700",
};

const supportColor: Record<string, string> = {
  "Strong Opponent": "bg-red-100 text-red-700",
  Opponent: "bg-orange-100 text-orange-700",
  Neutral: "bg-slate-100 text-slate-600",
  Supporter: "bg-emerald-100 text-emerald-700",
  Champion: "bg-emerald-200 text-emerald-800 font-semibold",
};

interface StakeholderTableProps {
  stakeholders: Stakeholder[];
  selectedIds?: string[];
  onToggle?: (id: string) => void;
  onToggleAll?: () => void;
  onSelect?: (id: string) => void;
}

export default function StakeholderTable({ 
  stakeholders, 
  selectedIds = [], 
  onToggle, 
  onToggleAll,
  onSelect 
}: StakeholderTableProps) {
  const allSelected = stakeholders.length > 0 && stakeholders.every((s) => selectedIds.includes(s.id));
  const someSelected = stakeholders.some((s) => selectedIds.includes(s.id)) && !allSelected;

  if (stakeholders.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-100 shadow-sm">
        <p className="text-sm">No stakeholders found. Add your first stakeholder to get started.</p>
      </div>
    );
  }

  return (
    <div className="futuristic-table-container overflow-x-auto">
      <table className="futuristic-table min-w-[800px]">
        <thead>
          <tr>
            <th className="w-10">
              <Checkbox
                checked={allSelected}
                onCheckedChange={() => onToggleAll && onToggleAll()}
                className={someSelected ? "data-[state=unchecked]:bg-sanku-orange/20 border-sanku-orange/40" : "border-slate-300"}
              />
            </th>
            <th>Stakeholder</th>
            <th className="w-48">Organization</th>
            <th className="w-36 hidden md:table-cell">Category</th>
            <th className="w-32">Influence</th>
            <th className="w-40">Support Level</th>
          </tr>
        </thead>
        <tbody>
          {stakeholders.map((s) => {
            const checked = selectedIds.includes(s.id);
            return (
              <tr 
                key={s.id} 
                className={`cursor-pointer group ${checked ? "bg-sanku-orange/5" : ""}`}
                onClick={() => onSelect && onSelect(s.id)}
              >
                <td className="w-10">
                  <div className="glow-accent" />
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => onToggle && onToggle(s.id)}
                    onClick={(e) => e.stopPropagation()}
                    className={checked ? "border-sanku-orange" : "border-slate-300"}
                  />
                </td>
                <td>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-xs font-black text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {s.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-sm text-slate-900 group-hover:text-sanku-orange transition-colors duration-300">{s.full_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{s.title || "Untitled Position"}</p>
                    </div>
                  </div>
                </td>
                <td className="text-sm font-bold text-slate-600">{s.organization}</td>
                <td className="hidden md:table-cell">
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter bg-white/50 border-slate-200 text-slate-500 py-0.5">
                    {s.category || "General"}
                  </Badge>
                </td>
                <td>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-sm border ${influenceColor[s.influence_level] || "bg-slate-50 border-slate-100"}`}>
                    {s.influence_level}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-sm border ${supportColor[s.support_level] || "bg-slate-50 border-slate-100"}`}>
                      {s.support_level}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}