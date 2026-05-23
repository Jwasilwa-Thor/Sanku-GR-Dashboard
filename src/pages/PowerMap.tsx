import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, ChevronRight, HelpCircle } from 'lucide-react';
import { useStakeholders } from '../hooks/useStakeholders';
import { InfluenceLevel, SupportLevel } from '../types';
import { STAKEHOLDER_CATEGORY_OPTIONS } from '@/constants/stakeholders';

const SUPPORT_LEVELS: SupportLevel[] = ["Strong Opponent", "Opponent", "Neutral", "Supporter", "Champion"];
const INFLUENCE_LEVELS: InfluenceLevel[] = ["Very High", "High", "Medium", "Low"];

const supportColorMap: Record<string, string> = {
  "Strong Opponent": "border-l-red-500 bg-red-50",
  "Opponent": "border-l-orange-400 bg-orange-50",
  "Neutral": "border-l-slate-400 bg-slate-50",
  "Supporter": "border-l-emerald-400 bg-emerald-50",
  "Champion": "border-l-emerald-600 bg-emerald-50",
};

const dotColorClass: Record<string, string> = {
  "Strong Opponent": "bg-red-500",
  "Opponent": "bg-orange-400",
  "Neutral": "bg-slate-400",
  "Supporter": "bg-emerald-400",
  "Champion": "bg-emerald-600",
};

const PowerMap: React.FC = () => {
  const navigate = useNavigate();
  const { stakeholders } = useStakeholders();
  const [filterCategory, setFilterCategory] = useState("All");

  const categories = ["All", ...STAKEHOLDER_CATEGORY_OPTIONS];

  const filtered = useMemo(() => 
    filterCategory === "All"
      ? stakeholders
      : stakeholders.filter((s) => s.category === filterCategory)
  , [stakeholders, filterCategory]);

  const getCell = (influence: InfluenceLevel, support: SupportLevel) =>
    filtered.filter((s) => s.influence_level === influence && s.support_level === support);

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="pr-4 border-r border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 whitespace-nowrap">Power Mapping</h2>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-0.5 whitespace-nowrap">Influence & Support Matrix</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
              <Filter size={16} />
              Filter:
            </div>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-field py-1.5 w-40 lg:w-48 text-sm"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="p-2 text-slate-400 hover:text-slate-600">
              <HelpCircle size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
        {SUPPORT_LEVELS.map((sl) => (
          <div key={sl} className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className={`w-3 h-3 rounded-full ${dotColorClass[sl]}`} />
            {sl}
          </div>
        ))}
      </div>

      {/* Grid Container */}
      <div className="card border-0 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px] xl:min-w-0">
            {/* Header row */}
            <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50">
              <div className="p-4 flex items-center justify-center border-r border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  INFLUENCE ↓<br/>SUPPORT →
                </span>
              </div>
              {SUPPORT_LEVELS.map((sl) => (
                <div key={sl} className="p-4 text-center border-r border-slate-200 last:border-r-0">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{sl}</span>
                </div>
              ))}
            </div>

            {/* Rows */}
            {INFLUENCE_LEVELS.map((il, ri) => (
              <div key={il} className={`grid grid-cols-6 ${ri < INFLUENCE_LEVELS.length - 1 ? "border-b border-slate-100" : ""}`}>
                <div className="p-4 flex items-center justify-center bg-slate-50/50 border-r border-slate-200">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{il}</span>
                </div>
                {SUPPORT_LEVELS.map((sl) => {
                  const cell = getCell(il, sl);
                  return (
                    <div key={sl} className="p-2 border-r border-slate-100 last:border-r-0 min-h-[140px] bg-white/50">
                      {cell.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                          <span className="text-slate-200 font-bold text-xl">—</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2">
                          {cell.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => navigate(`/stakeholders/${s.id}`)}
                              className={`w-full text-left border-l-4 rounded-r-lg px-3 py-2 hover:shadow-md transition-all group ${supportColorMap[sl]}`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <p className="text-xs font-bold truncate text-slate-900 group-hover:text-sanku-orange transition-colors">
                                  {s.full_name}
                                </p>
                                <ChevronRight size={12} className="text-slate-300 group-hover:text-sanku-orange" />
                              </div>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">{s.organization}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
        {SUPPORT_LEVELS.map((sl) => {
          const count = filtered.filter((s) => s.support_level === sl).length;
          return (
            <div key={sl} className="card p-4 text-center hover:shadow-md transition-shadow">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${dotColorClass[sl]}`} />
              <p className="text-2xl font-bold text-slate-900">{count}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{sl}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PowerMap;
