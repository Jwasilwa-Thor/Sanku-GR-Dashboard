import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import logo from "../assets/logo.png";
import { appModules } from "@/config/modules";

export default function Overview() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-end gap-4">
        <img src={logo} alt="Sanku Logo" className="h-10 w-auto" />
        <div className="pb-0.5">
          <h1 className="text-2xl font-bold tracking-tight">GR Overview</h1>
          <p className="text-muted-foreground mt-0.5 text-sm font-medium uppercase tracking-wide">
            Sanku Kenya Government Relations
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-10">
                #
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Module
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Description
              </th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {appModules.map(({ icon: Icon, overviewTitle, description, path, iconBg }, i) => (
              <tr key={path} className="group hover:bg-muted/30 transition-colors">
                <td className="px-5 py-4 text-xs text-muted-foreground">{i + 1}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <Link to={path} className="font-semibold text-sm hover:text-primary transition-colors">
                      {overviewTitle}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-4 text-xs text-muted-foreground leading-relaxed max-w-xs">{description}</td>
                <td className="px-4 py-4">
                  <Link
                    to={path}
                    className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
