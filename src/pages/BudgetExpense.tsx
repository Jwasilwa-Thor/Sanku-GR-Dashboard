import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Plus, Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const initialItems = [
  { id: 1, category: "Stakeholder Meetings", budget: 250000, spent: 87000 },
  { id: 2, category: "Policy Research & Analysis", budget: 150000, spent: 62000 },
  { id: 3, category: "Events & Forums", budget: 200000, spent: 45000 },
  { id: 4, category: "Travel & Accommodation", budget: 300000, spent: 134000 },
  { id: 5, category: "Communications & Materials", budget: 80000, spent: 31000 },
  { id: 6, category: "Consultants & Advisors", budget: 400000, spent: 220000 },
  { id: 7, category: "Partnerships & MOUs", budget: 100000, spent: 20000 },
  { id: 8, category: "Internal Operations", budget: 120000, spent: 55000 },
];

const fmt = (n) => `KES ${n.toLocaleString()}`;

export default function BudgetExpense() {
  const [items, setItems] = useState(initialItems);
  const [modal, setModal] = useState(null);
  const [expanded, setExpanded] = useState({});
  const toggleRow = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalBudget = items.reduce((s, i) => s + i.budget, 0);
  const totalSpent = items.reduce((s, i) => s + i.spent, 0);
  const remaining = totalBudget - totalSpent;
  const pct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  function save(data) {
    const parsed = { ...data, budget: Number(data.budget), spent: Number(data.spent) };
    if (modal.mode === "add") {
      setItems((prev) => [...prev, { ...parsed, id: Date.now() }]);
    } else {
      setItems((prev) => prev.map((i) => i.id === parsed.id ? parsed : i));
    }
    setModal(null);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budget &amp; Expense</h1>
          <p className="text-muted-foreground mt-1 text-sm">GR budget allocations, spend to date, and category breakdown</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setModal({ mode: "add", data: { category: "", budget: "", spent: "" } })}>
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Budget", value: fmt(totalBudget), color: "text-primary", bg: "bg-primary/10" },
          { label: "Total Spent", value: fmt(totalSpent), color: "text-chart-3", bg: "bg-chart-3/10" },
          { label: "Remaining", value: fmt(remaining), color: "text-chart-2", bg: "bg-chart-2/10" },
        ].map(({ label, value, color, bg }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                <DollarSign className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-lg font-bold ${color}`}>{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overall utilisation bar */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="p-5">
          <div className="flex justify-between mb-2 text-sm">
            <span className="font-medium">Overall Budget Utilisation</span>
            <span className="text-muted-foreground">{pct}% spent</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div className={`h-full rounded-full ${pct > 80 ? "bg-destructive" : pct > 60 ? "bg-chart-3" : "bg-chart-2"}`} style={{ width: `${pct}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-xs min-w-[600px]">
          <thead>
            <tr className="border-b bg-muted/60">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground min-w-[200px]">Category</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground w-36">Budget (KES)</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground w-36">Spent (KES)</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground w-32">Remaining</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground w-24">Utilisation</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground min-w-[120px]">Progress</th>
              <th className="w-16 px-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => {
            const p = item.budget > 0 ? Math.round((item.spent / item.budget) * 100) : 0;
            const remaining = item.budget - item.spent;
              return (
                <>
                <tr key={item.id} className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => toggleRow(item.id)}>
                  <td className="px-4 py-3 font-medium text-foreground">
                    <div className="flex items-center gap-1.5">
                      {expanded[item.id] ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                      {item.category}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{item.budget.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{item.spent.toLocaleString()}</td>
                  <td className={`px-4 py-3 text-right font-medium ${(item.budget - item.spent) < 0 ? "text-destructive" : "text-chart-2"}`}>
                    {(item.budget - item.spent).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[11px] font-semibold ${p > 80 ? "text-destructive" : p > 60 ? "text-chart-3" : "text-chart-2"}`}>{p}%</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-2 rounded-full bg-muted overflow-hidden w-full">
                      <div className={`h-full rounded-full ${p > 80 ? "bg-destructive" : p > 60 ? "bg-chart-3" : "bg-primary"}`} style={{ width: `${Math.min(100, p)}%` }} />
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setModal({ mode: "edit", data: { ...item } })}
                        className="p-1 rounded hover:bg-accent/10 hover:text-accent text-muted-foreground transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setItems((prev) => prev.filter((x) => x.id !== item.id))}
                        className="p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
                {expanded[item.id] && (
                  <tr key={item.id + "-exp"} className="bg-muted/30">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="grid grid-cols-3 gap-6 text-xs">
                        <div>
                          <p className="font-semibold text-foreground mb-1">Budget Allocated</p>
                          <p className="text-lg font-bold text-primary">{fmt(item.budget)}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground mb-1">Amount Spent</p>
                          <p className="text-lg font-bold text-chart-3">{fmt(item.spent)}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground mb-1">Remaining Balance</p>
                          <p className={`text-lg font-bold ${remaining < 0 ? "text-destructive" : "text-chart-2"}`}>{fmt(remaining)}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                          <span>Utilisation</span><span>{p}%</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${p > 80 ? "bg-destructive" : p > 60 ? "bg-chart-3" : "bg-primary"}`} style={{ width: `${Math.min(100, p)}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                </>
                );
                })}
                {/* Totals row */}
            <tr className="bg-muted/40 font-semibold">
              <td className="px-4 py-3 text-foreground">Total</td>
              <td className="px-4 py-3 text-right text-foreground">{totalBudget.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-foreground">{totalSpent.toLocaleString()}</td>
              <td className={`px-4 py-3 text-right ${remaining < 0 ? "text-destructive" : "text-chart-2"}`}>{remaining.toLocaleString()}</td>
              <td className="px-4 py-3 text-center text-foreground">{pct}%</td>
              <td className="px-4 py-3"></td>
              <td className="px-2 py-3"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {modal && (
        <Dialog open onOpenChange={() => setModal(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>{modal.mode === "add" ? "Add Category" : "Edit Category"}</DialogTitle></DialogHeader>
            <BudgetForm initial={modal.data} onSave={save} onClose={() => setModal(null)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function BudgetForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState({ ...initial });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-3 mt-2">
      <div><Label className="text-xs mb-1 block">Category Name</Label><Input value={form.category} onChange={(e) => set("category", e.target.value)} /></div>
      <div><Label className="text-xs mb-1 block">Budget (KES)</Label><Input type="number" value={form.budget} onChange={(e) => set("budget", e.target.value)} /></div>
      <div><Label className="text-xs mb-1 block">Spent (KES)</Label><Input type="number" value={form.spent} onChange={(e) => set("spent", e.target.value)} /></div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" onClick={() => onSave(form)}>Save</Button>
      </div>
    </div>
  );
}