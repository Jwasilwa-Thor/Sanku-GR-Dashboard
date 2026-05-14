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
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                onCheckedChange={() => onToggleAll && onToggleAll()}
                className={someSelected ? "data-[state=unchecked]:bg-sanku-orange/20" : ""}
              />
            </TableHead>
            <TableHead className="font-bold text-slate-900">Name</TableHead>
            <TableHead className="font-bold text-slate-900">Organization</TableHead>
            <TableHead className="font-bold text-slate-900 hidden md:table-cell">Category</TableHead>
            <TableHead className="font-bold text-slate-900">Influence</TableHead>
            <TableHead className="font-bold text-slate-900">Support</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stakeholders.map((s) => {
            const checked = selectedIds.includes(s.id);
            return (
              <TableRow 
                key={s.id} 
                className={`cursor-pointer group ${checked ? "bg-sanku-orange/5" : "hover:bg-slate-50/50"}`}
                onClick={() => onSelect && onSelect(s.id)}
              >
                <TableCell className="w-10">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => onToggle && onToggle(s.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sanku-navy/5 flex items-center justify-center text-xs font-bold text-sanku-navy shrink-0 border border-sanku-navy/10">
                      {s.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 group-hover:text-sanku-orange transition-colors">{s.full_name}</p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{s.title || "—"}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium text-slate-600">{s.organization}</TableCell>
                <TableCell className="text-sm hidden md:table-cell">
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-slate-50">
                    {s.category || "Other"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${influenceColor[s.influence_level] || ""}`}>
                    {s.influence_level}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${supportColor[s.support_level] || ""}`}>
                    {s.support_level}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}