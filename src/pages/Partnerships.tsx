import { useState } from "react";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialPartners = [
  { id: 1, name: "World Food Programme (WFP)", type: "UN Agency", status: "Active", focus: "Joint advocacy on fortification standards and school feeding programmes.", mou: "Yes", contact: "Country Representative" },
  { id: 2, name: "Global Alliance for Improved Nutrition (GAIN)", type: "NGO", status: "Active", focus: "Technical support on fortification quality assurance and regulatory alignment.", mou: "Yes", contact: "Kenya Country Manager" },
  { id: 3, name: "Ministry of Agriculture (MoA)", type: "Government", status: "Active", focus: "Policy alignment and county government sensitization on fortification.", mou: "In Progress", contact: "Director of Crop Nutrition" },
  { id: 4, name: "Kenya Bureau of Standards (KEBS)", type: "Regulatory Body", status: "Active", focus: "Standards alignment for KS 2062 and DosiFlo technology certification.", mou: "No", contact: "Standards Manager, Food" },
  { id: 5, name: "University of Nairobi — Nutrition Dept.", type: "Academic", status: "Exploratory", focus: "Research collaboration on nutritional impact of fortified maize flour.", mou: "No", contact: "Head of Nutrition Dept." },
  { id: 6, name: "USAID Kenya", type: "Donor", status: "Active", focus: "Donor engagement for GR and fortification scale-up financing.", mou: "No", contact: "Nutrition Specialist" },
];

const statusColors = {
  Active: "bg-chart-2/10 text-chart-2",
  "In Progress": "bg-chart-3/10 text-chart-3",
  Exploratory: "bg-muted text-muted-foreground",
  Inactive: "bg-destructive/10 text-destructive",
};

const typeColors = {
  "UN Agency": "bg-chart-1/10 text-chart-1",
  NGO: "bg-chart-2/10 text-chart-2",
  Government: "bg-primary/10 text-primary",
  "Regulatory Body": "bg-chart-4/10 text-chart-4",
  Academic: "bg-chart-5/10 text-chart-5",
  Donor: "bg-chart-3/10 text-chart-3",
};

const STATUSES = ["Active", "Exploratory", "In Progress", "Inactive"];
const emptyPartner = { name: "", type: "NGO", status: "Active", focus: "", mou: "No", contact: "" };

export default function Partnerships() {
  const [partners, setPartners] = useState(initialPartners);
  const [modal, setModal] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [expanded, setExpanded] = useState({});
  const toggleRow = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const filtered = filterStatus === "All" ? partners : partners.filter((p) => p.status === filterStatus);

  function savePartner(data) {
    if (modal.mode === "add") {
      setPartners((prev) => [...prev, { ...data, id: Date.now() }]);
    } else {
      setPartners((prev) => prev.map((p) => p.id === data.id ? data : p));
    }
    setModal(null);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Partnerships</h1>
          <p className="text-muted-foreground mt-1 text-sm">Strategic partners, MOUs, and relationship status</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setModal({ mode: "add", data: { ...emptyPartner } })}>
          <Plus className="w-4 h-4" /> Add Partner
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {["All", ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-xs min-w-[700px]">
          <thead>
            <tr className="border-b bg-muted/60">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground min-w-[200px]">Partner</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-32">Type</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-28">Status</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground w-24">MOU</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground min-w-[160px]">Key Contact</th>
              <th className="w-16 px-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((p) => (
              <>
                <tr key={p.id} className="hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => toggleRow(p.id)}>
                  <td className="px-4 py-3 font-medium text-foreground">
                    <div className="flex items-center gap-1.5">
                      {expanded[p.id] ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                      {p.name}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${typeColors[p.type] || "bg-muted text-muted-foreground"}`}>{p.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusColors[p.status] || "bg-muted text-muted-foreground"}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${p.mou === "Yes" ? "bg-chart-2/10 text-chart-2" : p.mou === "In Progress" ? "bg-chart-3/10 text-chart-3" : "bg-muted text-muted-foreground"}`}>{p.mou}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.contact}</td>
                  <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setModal({ mode: "edit", data: { ...p } })}
                        className="p-1 rounded hover:bg-accent/10 hover:text-accent text-muted-foreground transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setPartners((prev) => prev.filter((x) => x.id !== p.id))}
                        className="p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
                {expanded[p.id] && (
                  <tr key={p.id + "-exp"} className="bg-muted/30">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="font-semibold text-foreground mb-1">Focus / Collaboration Area</p>
                          <p className="text-muted-foreground leading-relaxed">{p.focus}</p>
                        </div>
                        <div className="flex gap-8">
                          <div>
                            <p className="font-semibold text-foreground mb-1">MOU Status</p>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${p.mou === "Yes" ? "bg-chart-2/10 text-chart-2" : p.mou === "In Progress" ? "bg-chart-3/10 text-chart-3" : "bg-muted text-muted-foreground"}`}>{p.mou}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground mb-1">Key Contact</p>
                            <p className="text-muted-foreground">{p.contact}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No partners found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <PartnerModal
          title={modal.mode === "add" ? "Add Partner" : "Edit Partner"}
          initial={modal.data}
          onSave={savePartner}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function PartnerModal({ title, initial, onSave, onClose }) {
  const [form, setForm] = useState({ ...initial });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <div><Label className="text-xs mb-1 block">Partner Name</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Type</Label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                {["UN Agency","NGO","Government","Regulatory Body","Academic","Donor","Other"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Status</Label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                {["Active","Exploratory","In Progress","Inactive"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Focus / Collaboration Area</Label>
            <textarea value={form.focus} onChange={(e) => set("focus", e.target.value)} rows={2} className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">MOU Status</Label>
              <select value={form.mou} onChange={(e) => set("mou", e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                {["Yes","No","In Progress"].map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div><Label className="text-xs mb-1 block">Key Contact</Label><Input value={form.contact} onChange={(e) => set("contact", e.target.value)} /></div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={() => onSave(form)}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}