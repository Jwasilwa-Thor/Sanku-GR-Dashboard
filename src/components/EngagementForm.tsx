import React, { useState } from 'react';
import { Engagement, EngagementType, EngagementOutcome } from '../types';

interface EngagementFormProps {
  stakeholderId: string;
  initial?: Partial<Engagement>;
  onSubmit: (data: Partial<Engagement>) => void;
  onCancel?: () => void;
  loading?: boolean;
}

const TYPES: EngagementType[] = ["Meeting", "In Person", "Call", "Email"];
const OUTCOMES: EngagementOutcome[] = ["Positive", "Neutral", "Needs Follow-up", "Negative"];

const EngagementForm: React.FC<EngagementFormProps> = ({ 
  stakeholderId, 
  initial, 
  onSubmit, 
  onCancel, 
  loading 
}) => {
  const [form, setForm] = useState({
    stakeholderId: stakeholderId,
    type: (initial?.type || "Meeting") as EngagementType,
    date: initial?.date || new Date().toISOString().split("T")[0],
    subject: initial?.subject || "",
    summary: initial?.summary || "",
    outcome: (initial?.outcome || "Neutral") as EngagementOutcome,
    followUpDate: initial?.followUpDate || "",
    attendees: initial?.attendees || "",
    notes: initial?.notes || "",
    ...initial,
  });

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <form
      onSubmit={(e) => { 
        e.preventDefault(); 
        onSubmit(form); 
      }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="label">Type *</label>
          <select 
            value={form.type} 
            onChange={(v) => set("type", v.target.value)}
            className="input-field"
            required
          >
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Date *</label>
          <input 
            type="date" 
            value={form.date} 
            onChange={(e) => set("date", e.target.value)} 
            className="input-field"
            required 
          />
        </div>
      </div>

      <div>
        <label className="label">Subject *</label>
        <input 
          value={form.subject} 
          onChange={(e) => set("subject", e.target.value)} 
          className="input-field"
          placeholder="Brief subject of the engagement"
          required 
        />
      </div>

      <div>
        <label className="label">Summary / Notes</label>
        <textarea 
          rows={4} 
          value={form.summary} 
          onChange={(e) => set("summary", e.target.value)} 
          className="input-field"
          placeholder="Summary of the interaction..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="label">Outcome</label>
          <select 
            value={form.outcome} 
            onChange={(v) => set("outcome", v.target.value)}
            className="input-field"
          >
            {OUTCOMES.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Follow-up Date</label>
          <input 
            type="date" 
            value={form.followUpDate} 
            onChange={(e) => set("followUpDate", e.target.value)} 
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label className="label">Attendees</label>
        <input 
          value={form.attendees} 
          onChange={(e) => set("attendees", e.target.value)} 
          className="input-field"
          placeholder="Comma-separated names"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        {onCancel && (
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
        <button 
          type="submit" 
          className="btn-primary" 
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Engagement"}
        </button>
      </div>
    </form>
  );
};

export default EngagementForm;
