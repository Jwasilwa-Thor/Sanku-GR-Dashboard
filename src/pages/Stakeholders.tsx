import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import StakeholderTable from "../components/StakeholderTable";
import StakeholderForm from "../components/StakeholderForm";
import { Stakeholder } from "../types";
import { useStakeholders } from "../hooks/useStakeholders";
import { STAKEHOLDER_CATEGORY_OPTIONS } from "@/constants/stakeholders";
import { useCallback, useMemo, useState } from "react";

export default function Stakeholders() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";

  const setSearch = useCallback(
    (value: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value.trim()) next.set("q", value.trim());
          else next.delete("q");
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const {
    stakeholders,
    loading,
    error,
    createStakeholder,
    updateStakeholder,
  } = useStakeholders();

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterInfluence, setFilterInfluence] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkField, setBulkField] = useState("");
  const [bulkValue, setBulkValue] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);

  async function handleCreate(form: Partial<Stakeholder>) {
    setSaving(true);
    try {
      await createStakeholder(form);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  function toggleId(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return stakeholders.filter((s) => {
      const matchSearch =
        !q ||
        s.full_name?.toLowerCase().includes(q) ||
        s.organization?.toLowerCase().includes(q) ||
        s.title?.toLowerCase().includes(q);
      const matchCategory = filterCategory === "all" || s.category === filterCategory;
      const matchInfluence = filterInfluence === "all" || s.influence_level === filterInfluence;
      return matchSearch && matchCategory && matchInfluence;
    });
  }, [stakeholders, search, filterCategory, filterInfluence]);

  function toggleAll() {
    const allFilteredSelected = filtered.every((s) => selectedIds.includes(s.id));
    if (allFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filtered.some((s) => s.id === id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...filtered.map((s) => s.id)])]);
    }
  }

  async function applyBulkEdit() {
    if (!bulkField || !bulkValue || selectedIds.length === 0) return;
    setBulkSaving(true);
    try {
      await Promise.all(selectedIds.map((id) => updateStakeholder(id, { [bulkField]: bulkValue })));
      setSelectedIds([]);
      setBulkField("");
      setBulkValue("");
    } finally {
      setBulkSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Redesigned Single-Line Header & Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm transition-all">
        <div className="flex items-center gap-3 pr-4 border-r border-slate-100 h-9">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">Stakeholders</h1>
          <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
            {stakeholders.length}
          </span>
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search stakeholders..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-9 h-10 border-slate-200 bg-slate-50/50 focus:bg-white transition-all rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filterCategory} onValueChange={(v: string) => setFilterCategory(v)}>
            <SelectTrigger className="h-10 w-40 rounded-xl border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter className="w-3.5 h-3.5 mr-2 text-slate-400" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {STAKEHOLDER_CATEGORY_OPTIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterInfluence} onValueChange={(v: string) => setFilterInfluence(v)}>
            <SelectTrigger className="h-10 w-36 rounded-xl border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <SelectValue placeholder="Influence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Influence</SelectItem>
              {["Low", "Medium", "High", "Very High"].map((i) => (
                <SelectItem key={i} value={i}>
                  {i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={() => setShowForm(true)} 
          className="h-10 px-5 gap-2 rounded-xl bg-sanku-orange hover:bg-sanku-orange/90 text-white font-bold shadow-lg shadow-sanku-orange/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> 
          <span className="hidden sm:inline">Add Stakeholder</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {selectedIds.length > 0 && (
        <div className="mb-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-primary">{selectedIds.length} selected</span>
          <Select
            value={bulkField}
            onValueChange={(v: string) => {
              setBulkField(v);
              setBulkValue("");
            }}
          >
            <SelectTrigger className="w-44 h-8 text-xs">
              <SelectValue placeholder="Field to update" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="influence_level">Influence Level</SelectItem>
              <SelectItem value="support_level">Support Level</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
          {bulkField && (
            <Select value={bulkValue} onValueChange={(v: string) => setBulkValue(v)}>
              <SelectTrigger className="w-44 h-8 text-xs">
                <SelectValue placeholder="New value" />
              </SelectTrigger>
              <SelectContent>
                {bulkField === "category" &&
                  [...STAKEHOLDER_CATEGORY_OPTIONS].map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                {bulkField === "influence_level" &&
                  ["Low", "Medium", "High", "Very High"].map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                {bulkField === "support_level" &&
                  ["Strong Opponent", "Opponent", "Neutral", "Supporter", "Champion"].map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                {bulkField === "priority" &&
                  ["Low", "Medium", "High", "Critical"].map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                {bulkField === "status" &&
                  ["Active", "Inactive", "Archived"].map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
          <Button size="sm" className="h-8 text-xs" disabled={!bulkField || !bulkValue || bulkSaving} onClick={applyBulkEdit}>
            {bulkSaving ? "Saving…" : "Apply"}
          </Button>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <Card className="border-0 shadow-sm">
        <StakeholderTable
          stakeholders={filtered}
          selectedIds={selectedIds}
          onToggle={toggleId}
          onToggleAll={toggleAll}
          onSelect={(id) => navigate(`/stakeholders/${id}`)}
        />
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Add Stakeholder</DialogTitle>
          </DialogHeader>
          <StakeholderForm initial={{}} onSubmit={handleCreate} onCancel={() => setShowForm(false)} loading={saving} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
