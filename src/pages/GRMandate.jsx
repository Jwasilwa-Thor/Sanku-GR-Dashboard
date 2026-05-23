import { useState } from "react";
import { Target, Eye, Compass, Star, Flag, Plus, Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ICONS = { Flag, Target, Compass, Star, Eye };
const COLORS = [
  { label: "Primary", color: "text-primary", bg: "bg-primary/10" },
  { label: "Green", color: "text-chart-2", bg: "bg-chart-2/10" },
  { label: "Blue", color: "text-accent", bg: "bg-accent/10" },
  { label: "Orange", color: "text-chart-3", bg: "bg-chart-3/10" },
  { label: "Purple", color: "text-chart-4", bg: "bg-chart-4/10" },
];

const initialSections = [
  { id: 1, icon: "Flag", title: "Mandate", color: "text-primary", bg: "bg-primary/10", content: "Sanku Kenya's Government Relations function is mandated to build and sustain strategic relationships with government actors, regulators, and policy influencers to enable the scale-up of fortification solutions across Kenya.", items: [] },
  { id: 2, icon: "Target", title: "Objectives", color: "text-chart-2", bg: "bg-chart-2/10", content: "", items: [
    "Secure enabling policy and regulatory environment for food fortification.",
    "Build champions within government who advocate for Sanku's mission.",
    "Monitor and influence legislation relevant to nutrition and fortification.",
    "Coordinate with county and national government on fortification rollout.",
    "Represent Sanku Kenya in multi-stakeholder nutrition forums.",
  ]},
  { id: 3, icon: "Compass", title: "Purpose", color: "text-accent", bg: "bg-accent/10", content: "To ensure that government policy, regulation, and investment decisions are aligned with and supportive of sustainable, large-scale food fortification in Kenya — directly enabling Sanku Kenya to reach millions of smallholder farmers.", items: [] },
  { id: 4, icon: "Star", title: "Mission", color: "text-chart-3", bg: "bg-chart-3/10", content: "Eradicate hidden hunger by building government systems and political will that prioritize nutrition-sensitive food production and fortification at scale.", items: [] },
  { id: 5, icon: "Eye", title: "Vision", color: "text-chart-4", bg: "bg-chart-4/10", content: "A Kenya where every person, regardless of geography or income, benefits from nutritious food — supported by a government that champions food fortification as a public health priority.", items: [] },
];

const emptySection = { title: "", icon: "Flag", color: "text-primary", bg: "bg-primary/10", content: "", items: [] };

export default function GRMandate() {
  const [sections, setSections] = useState(initialSections);
  const [modal, setModal] = useState(null);
  const [expanded, setExpanded] = useState({});
  const toggleRow = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  function save(data) {
    if (modal.mode === "add") {
      setSections((prev) => [...prev, { ...data, id: Date.now() }]);
    } else {
      setSections((prev) => prev.map((s) => s.id === data.id ? data : s));
    }
    setModal(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="pr-4 border-r border-slate-100">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">GR Mandate &amp; Mission</h1>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-0.5 whitespace-nowrap">Strategic Framework</p>
          </div>
        </div>
        <Button size="sm" className="gap-1.5 h-9 rounded-xl bg-sanku-orange hover:bg-sanku-orange/90 text-white font-bold" onClick={() => setModal({ mode: "add", data: { ...emptySection } })}>
          <Plus className="w-4 h-4" /> Add Section
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-xs min-w-[600px]">
          <thead>
            <tr className="border-b bg-muted/60">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-40">Section</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Content / Objectives</th>
              <th className="w-16 px-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sections.map((s) => {
              const Icon = ICONS[s.icon] || Flag;
              return (
                <>
                <tr key={s.id} className="hover:bg-muted/20 transition-colors align-top cursor-pointer" onClick={() => toggleRow(s.id)}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {expanded[s.id] ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${s.bg}`}>
                        <Icon className={`w-4 h-4 ${s.color}`} />
                      </div>
                      <span className="font-semibold text-foreground text-sm">{s.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground leading-relaxed">
                    {s.content && <p className="text-sm line-clamp-2">{s.content}</p>}
                    {(!s.content && s.items?.length > 0) && <p className="text-sm text-muted-foreground italic">{s.items.length} objective{s.items.length !== 1 ? 's' : ''}</p>}
                    {s.items && s.items.length > 0 && (
                      <ul className="space-y-1.5 mt-1">
                        {s.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-chart-2/60" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-2 py-4">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setModal({ mode: "edit", data: { ...s, itemsText: (s.items || []).join("\n") } })}
                        className="p-1 rounded hover:bg-accent/10 hover:text-accent text-muted-foreground transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setSections((prev) => prev.filter((x) => x.id !== s.id))}
                        className="p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
                {expanded[s.id] && (
                  <tr key={s.id + "-exp"} className="bg-muted/30">
                    <td colSpan={3} className="px-6 py-4">
                      {s.content && <p className="text-sm text-muted-foreground leading-relaxed mb-2">{s.content}</p>}
                      {s.items && s.items.length > 0 && (
                        <ul className="space-y-1.5">
                          {s.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-chart-2/60" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <SectionModal
          title={modal.mode === "add" ? "Add Section" : "Edit Section"}
          initial={modal.data}
          onSave={save}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function SectionModal({ title, initial, onSave, onClose }) {
  const [form, setForm] = useState({ ...initial, itemsText: (initial.items || []).join("\n") });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function handleSave() {
    const items = form.itemsText ? form.itemsText.split("\n").map((s) => s.trim()).filter(Boolean) : [];
    const colorObj = COLORS.find((c) => c.color === form.color) || COLORS[0];
    onSave({ ...form, items, bg: colorObj.bg });
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl" aria-describedby={undefined}>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs mb-1 block">Section Title</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
            <div>
              <Label className="text-xs mb-1 block">Icon</Label>
              <select value={form.icon} onChange={(e) => set("icon", e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                {Object.keys(ICONS).map((k) => <option key={k}>{k}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Colour</Label>
            <select value={form.color} onChange={(e) => { const c = COLORS.find((x) => x.color === e.target.value); set("color", e.target.value); if(c) set("bg", c.bg); }} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
              {COLORS.map((c) => <option key={c.color} value={c.color}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Content (paragraph)</Label>
            <textarea value={form.content} onChange={(e) => set("content", e.target.value)} rows={3} className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Bullet Points (one per line)</Label>
            <textarea value={form.itemsText} onChange={(e) => set("itemsText", e.target.value)} rows={4} className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring" placeholder="One bullet point per line..." />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}