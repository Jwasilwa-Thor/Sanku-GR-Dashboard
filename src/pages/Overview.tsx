import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { appModules } from "@/config/modules";

export default function Overview() {
  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
        <img src={logo} alt="Sanku Logo" className="h-12 w-auto mb-4" />
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 whitespace-nowrap">About</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl leading-relaxed">
          The Government Relations (GR) Command Centre for Sanku Kenya. 
          A specialized platform designed to track, manage, and optimize our institutional relationships 
          and advocacy impact.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 border-b pb-2">The Mission</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            To provide the GR team with a real-time, data-driven environment for monitoring legislative 
            and regulatory shifts, ensuring that Sanku remains at the forefront of fortification 
            standards and nutritional policy in East Africa.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            By centralizing stakeholder interactions, policy tracking, and partnership development, 
            we enable a more coordinated and effective advocacy strategy that translates directly 
            into improved health outcomes for millions.
          </p>
        </div>
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 border-b pb-2">Core Capabilities</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">1</div>
              <div>
                <p className="text-sm font-bold">Pipeline-Driven Advocacy</p>
                <p className="text-xs text-muted-foreground">End-to-end tracking of policy matters from monitoring to final decision.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-chart-2/10 text-chart-2 flex items-center justify-center shrink-0 text-xs font-bold">2</div>
              <div>
                <p className="text-sm font-bold">Stakeholder Stance Mapping</p>
                <p className="text-xs text-muted-foreground">Deep analysis of stakeholder support and influence levels per matter.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-chart-3/10 text-chart-3 flex items-center justify-center shrink-0 text-xs font-bold">3</div>
              <div>
                <p className="text-sm font-bold">Financial Oversight</p>
                <p className="text-xs text-muted-foreground">Direct links between GR activities and budget utilization rates.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">System Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {appModules.filter(m => m.path !== '/dashboard').map(({ icon: Icon, label, description, path, iconBg }) => (
            <Link key={path} to={path} className="group bg-card border rounded-xl p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm group-hover:text-primary transition-colors">{label}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
