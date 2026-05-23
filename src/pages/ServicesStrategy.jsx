import { useState } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CLIENT_TYPES = ["Country", "Both", "Global", "Regional"];

const initialData = [
  {
    id: 1, service: "Stakeholder Management & Network Development",
    rows: [
      { id: 101, deliverable: "Complete research on potential champions + contacts", clientType: "Country", clientTitle: "GR leads, National and Local GR staff", strategy: "Identify and map key decision-makers and influencers to build a targeted outreach pipeline" },
      { id: 102, deliverable: "Structure negotiation strategies and champion-building approaches", clientType: "Country", clientTitle: "GR leads, National and Local GR staff", strategy: "Develop tailored engagement frameworks to convert stakeholders into active champions" },
      { id: 103, deliverable: "Build and execute supporter journeys to transition contacts through to allies; consistently manage and leverage network to achieve strategic outcomes", clientType: "Country", clientTitle: "GR leads, National and Local GR staff", strategy: "Design staged relationship pathways with clear milestones to deepen commitment and mobilise allies" },
      { id: 104, deliverable: "Support on strategy/negotiation in meetings with national contacts + attending meetings directly", clientType: "Country", clientTitle: "GR leads, National and Local GR staff", strategy: "Provide real-time strategic counsel and direct representation to advance organisational positions" },
      { id: 105, deliverable: "Support on strategy/negotiation in meetings with local contacts", clientType: "Country", clientTitle: "GR leads, National and Local GR staff", strategy: "Equip local GR staff with context-specific negotiation tactics and messaging" },
      { id: 106, deliverable: "Establish and run external Advisory Councils with major champions and influential actors", clientType: "Country", clientTitle: "GR leads, National and Local GR staff", strategy: "Institutionalise high-value relationships to generate sustained advocacy and credibility" },
    ],
  },
  {
    id: 2, service: "Compliance & Regulatory Monitoring",
    rows: [
      { id: 201, deliverable: "Lead monthly policy and regulatory calls + draft updates for leadership", clientType: "Country", clientTitle: "GR leads, Country Directors or SteerCos, Compliance Specialists", strategy: "Ensure leadership has timely, synthesised intelligence on the regulatory landscape to inform decisions" },
      { id: 202, deliverable: "Analyze new legislation, regulations, or policies", clientType: "Country", clientTitle: "GR leads, Country Directors or SteerCos, Compliance Specialists", strategy: "Assess operational and strategic implications of regulatory changes before they take effect" },
      { id: 203, deliverable: "Manage compliance risk + provide quality assurance within country teams", clientType: "Country", clientTitle: "GR leads, Country Directors or SteerCos, Compliance Specialists", strategy: "Embed proactive risk controls and consistent standards across country operations" },
      { id: 204, deliverable: "Secure permits, licenses, and renewals", clientType: "Country", clientTitle: "GR leads, Country Directors or SteerCos, Compliance Specialists", strategy: "Maintain uninterrupted operational authorisation through structured permit management" },
    ],
  },
  {
    id: 3, service: "Derisking & Opportunity Analysis",
    rows: [
      { id: 301, deliverable: "Research high-risk situations to present to leadership", clientType: "Country", clientTitle: "GR leads, Country Directors or SteerCos", strategy: "Surface and frame emerging risks early so leadership can make informed, pre-emptive choices" },
      { id: 302, deliverable: "Execute projects to derisk situations", clientType: "Country", clientTitle: "GR leads, Country Directors or SteerCos", strategy: "Deploy targeted interventions — stakeholder engagement, advocacy, or comms — to reduce exposure" },
      { id: 303, deliverable: "Lead power mapping exercises on key issues", clientType: "Country", clientTitle: "GR leads, Country Directors or SteerCos", strategy: "Visualise the political landscape to identify leverage points and anticipate opposition" },
      { id: 304, deliverable: "Lead political economy analyses on key issues", clientType: "Country", clientTitle: "GR leads, Country Directors or SteerCos", strategy: "Provide structural context on incentives and power dynamics shaping the operating environment" },
      { id: 305, deliverable: "Lead monthly advocacy calls + complete opportunity scans", clientType: "Country", clientTitle: "GR leads, Country Directors or SteerCos", strategy: "Continuously identify and prioritise windows for policy influence across markets" },
    ],
  },
  {
    id: 4, service: "Advocacy Opportunities & Coalition-Building",
    rows: [
      { id: 401, deliverable: "Lead project management for individual advocacy projects", clientType: "Both", clientTitle: "GR leads", strategy: "Coordinate cross-functional efforts to deliver coherent, well-timed advocacy campaigns" },
      { id: 402, deliverable: "Complete legislative research + analysis", clientType: "Both", clientTitle: "GR leads", strategy: "Equip advocacy teams with evidence-based insights to strengthen policy positions" },
      { id: 403, deliverable: "Lead coalition building + meetings with potential partners", clientType: "Both", clientTitle: "GR leads", strategy: "Broaden the organisation's influence by aligning with credible external voices and allies" },
      { id: 404, deliverable: "Assess potential partnership topics, partners, and risks", clientType: "Both", clientTitle: "GR leads", strategy: "Apply a structured due-diligence lens to ensure partnerships advance strategic goals safely" },
    ],
  },
  {
    id: 5, service: "Partnerships Assessment, Negotiation & Administration",
    rows: [
      { id: 501, deliverable: "Lead on relationship management across each stage of the partnership process", clientType: "Both", clientTitle: "GR leads, Country Directors or SteerCos", strategy: "Maintain momentum and trust throughout the partnership lifecycle from scoping to delivery" },
      { id: 502, deliverable: "Lead negotiation with partners + contract signing", clientType: "Both", clientTitle: "GR leads, Country Directors or SteerCos", strategy: "Secure favourable terms that protect the organisation's interests and enable effective collaboration" },
      { id: 503, deliverable: "Support or lead in partnership administration", clientType: "Both", clientTitle: "GR leads, Country Directors or SteerCos", strategy: "Ensure operational compliance and continuity across active partnerships" },
    ],
  },
  {
    id: 6, service: "Skills Building & Team Development",
    rows: [
      { id: 601, deliverable: "Build and facilitate trainings on GR best practices to build skills", clientType: "Both", clientTitle: "All GRP Staff", strategy: "Elevate team capability through structured learning that translates directly to on-the-ground practice" },
      { id: 602, deliverable: "Lead recruitment, onboarding, and performance management", clientType: "Both", clientTitle: "All GRP Staff", strategy: "Attract and retain high-calibre GR talent and set clear expectations for growth and performance" },
      { id: 603, deliverable: "Build and execute yearly DEI goals", clientType: "Both", clientTitle: "All GRP Staff", strategy: "Embed equity and inclusion into team culture and ways of working as a strategic priority" },
      { id: 604, deliverable: "Build and execute all-department strategy retreat and team meetings", clientType: "Both", clientTitle: "All GRP Staff", strategy: "Foster alignment, cohesion, and shared direction across the GRP through intentional convenings" },
    ],
  },
];

const emptyRow = { deliverable: "", clientType: "Country", clientTitle: "", strategy: "" };

export default function ServicesStrategy() {
  const [data, setData] = useState(initialData);
  const [editModal, setEditModal] = useState(null); // { serviceId, row }
  const [addRowModal, setAddRowModal] = useState(null); // serviceId
  const [addServiceModal, setAddServiceModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");

  function saveRow(serviceId, updated) {
    setData((prev) => prev.map((s) => s.id === serviceId
      ? { ...s, rows: s.rows.map((r) => r.id === updated.id ? updated : r) }
      : s));
    setEditModal(null);
  }

  function addRow(serviceId, row) {
    setData((prev) => prev.map((s) => s.id === serviceId
      ? { ...s, rows: [...s.rows, { ...row, id: Date.now() }] }
      : s));
    setAddRowModal(null);
  }

  function deleteRow(serviceId, rowId) {
    setData((prev) => prev.map((s) => s.id === serviceId
      ? { ...s, rows: s.rows.filter((r) => r.id !== rowId) }
      : s));
  }

  function addService() {
    if (!newServiceName.trim()) return;
    setData((prev) => [...prev, { id: Date.now(), service: newServiceName.trim(), rows: [] }]);
    setNewServiceName("");
    setAddServiceModal(false);
  }

  function deleteService(serviceId) {
    setData((prev) => prev.filter((s) => s.id !== serviceId));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="pr-4 border-r border-slate-100">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">Menu of Services</h1>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-0.5 whitespace-nowrap">Service Strategy</p>
          </div>
        </div>
        <Button size="sm" className="gap-1.5 h-9 rounded-xl bg-sanku-orange hover:bg-sanku-orange/90 text-white font-bold" onClick={() => setAddServiceModal(true)}>
          <Plus className="w-4 h-4" /> Add Service
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
        <table className="w-full text-xs min-w-[900px]">
          <thead>
            <tr className="border-b bg-muted/60">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-48">Overall Service</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground min-w-[240px]">Deliverable</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground w-28">Type of Internal Client</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground min-w-[180px]">Title of Internal Clients (Departments / Countries)</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground min-w-[260px]">Strategy</th>
              <th className="w-16 px-2"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((service) => (
              <>
                {service.rows.map((row, ri) => (
                  <tr key={row.id} className="border-t hover:bg-muted/20 transition-colors">
                    {ri === 0 && (
                      <td rowSpan={service.rows.length || 1}
                        className="px-4 py-3 align-top border-r font-semibold text-foreground text-xs leading-snug bg-muted/30"
                        style={{ verticalAlign: "top" }}>
                        <div className="flex items-start justify-between gap-1">
                          <span>{service.service}</span>
                          <div className="flex flex-col gap-1 shrink-0 ml-1">
                            <button onClick={() => setAddRowModal(service.id)}
                              title="Add row" className="p-0.5 rounded hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors">
                              <Plus className="w-3 h-3" />
                            </button>
                            <button onClick={() => deleteService(service.id)}
                              title="Delete service" className="p-0.5 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-2.5 text-foreground leading-snug">{row.deliverable}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium text-[11px]">{row.clientType}</span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground leading-snug">{row.clientTitle}</td>
                    <td className="px-4 py-2.5 text-muted-foreground leading-snug">{row.strategy}</td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setEditModal({ serviceId: service.id, row: { ...row } })}
                          className="p-1 rounded hover:bg-accent/10 hover:text-accent text-muted-foreground transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteRow(service.id, row.id)}
                          className="p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {service.rows.length === 0 && (
                  <tr className="border-t">
                    <td className="px-4 py-3 align-top border-r font-semibold text-foreground text-xs bg-muted/30">
                      <div className="flex items-start justify-between gap-1">
                        <span>{service.service}</span>
                        <div className="flex flex-col gap-1 shrink-0 ml-1">
                          <button onClick={() => setAddRowModal(service.id)} className="p-0.5 rounded hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"><Plus className="w-3 h-3" /></button>
                          <button onClick={() => deleteService(service.id)} className="p-0.5 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>
                    </td>
                    <td colSpan={5} className="px-4 py-3 text-muted-foreground italic">No deliverables yet. Click + to add.</td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Row Modal */}
      {editModal && (
        <RowFormModal title="Edit Row" initial={editModal.row}
          onSave={(updated) => saveRow(editModal.serviceId, updated)}
          onClose={() => setEditModal(null)} />
      )}

      {/* Add Row Modal */}
      {addRowModal && (
        <RowFormModal title="Add Deliverable" initial={{ ...emptyRow, id: null }}
          onSave={(row) => addRow(addRowModal, row)}
          onClose={() => setAddRowModal(null)} />
      )}

      {/* Add Service Modal */}
      <Dialog open={addServiceModal} onOpenChange={setAddServiceModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Service Category</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-xs mb-1 block">Service Name</Label>
              <Input value={newServiceName} onChange={(e) => setNewServiceName(e.target.value)} placeholder="e.g. Communications & Messaging" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setAddServiceModal(false)}>Cancel</Button>
              <Button size="sm" onClick={addService}>Add</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RowFormModal({ title, initial, onSave, onClose }) {
  const [form, setForm] = useState({ ...initial });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" aria-describedby={undefined}>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <Label className="text-xs mb-1 block">Deliverable</Label>
            <textarea value={form.deliverable} onChange={(e) => set("deliverable", e.target.value)}
              rows={3} className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Type of Internal Client</Label>
              <select value={form.clientType} onChange={(e) => set("clientType", e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm bg-background">
                {CLIENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Title of Internal Clients</Label>
              <Input value={form.clientTitle} onChange={(e) => set("clientTitle", e.target.value)} placeholder="e.g. GR leads, Country Directors" />
            </div>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Strategy</Label>
            <textarea value={form.strategy} onChange={(e) => set("strategy", e.target.value)}
              rows={3} className="w-full border rounded-md px-3 py-2 text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
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