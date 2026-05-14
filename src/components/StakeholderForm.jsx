import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { STAKEHOLDER_CATEGORY_OPTIONS } from "@/constants/stakeholders";

const FIELDS = {
  influence: ["Low", "Medium", "High", "Very High"],
  support: ["Strong Opponent", "Opponent", "Neutral", "Supporter", "Champion"],
  category: [...STAKEHOLDER_CATEGORY_OPTIONS],
  priority: ["Low", "Medium", "High", "Critical"],
  status: ["Active", "Inactive", "Archived"],
};

export default function StakeholderForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    full_name: "",
    title: "",
    organization: "",
    email: "",
    phone: "",
    influence_level: "Medium",
    support_level: "Neutral",
    category: "Other",
    district: "",
    party_affiliation: "",
    priority: "Medium",
    notes: "",
    status: "Active",
    ...initial,
  });

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Full Name *</Label>
          <Input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Title / Position</Label>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Organization *</Label>
          <Input value={form.organization} onChange={(e) => set("organization", e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{FIELDS.category.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>District / Region</Label>
          <Input value={form.district} onChange={(e) => set("district", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Party Affiliation</Label>
          <Input value={form.party_affiliation} onChange={(e) => set("party_affiliation", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Influence Level *</Label>
          <Select value={form.influence_level} onValueChange={(v) => set("influence_level", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{FIELDS.influence.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Support Level *</Label>
          <Select value={form.support_level} onValueChange={(v) => set("support_level", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{FIELDS.support.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Priority</Label>
          <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{FIELDS.priority.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{FIELDS.status.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Stakeholder"}</Button>
      </div>
    </form>
  );
}