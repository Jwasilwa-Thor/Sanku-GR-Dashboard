import React, { useEffect, useState } from "react";
import { Link, useLocation, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { 
  ChevronDown, 
  LogOut, 
  Bell, 
  Search, 
  Menu, 
  LayoutDashboard, 
  X,
  User,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import logo from "@/assets/logo.png";
import { mainNavItems, appModules } from "@/config/modules";
import { Badge } from "@/components/ui/badge";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const [headerQuery, setHeaderQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const activeModule = appModules.find((m) => location.pathname === m.path);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith("/stakeholders")) {
      setHeaderQuery(searchParams.get("q") || "");
    } else {
      setHeaderQuery("");
    }
  }, [location.pathname, searchParams]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  function submitHeaderSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = headerQuery.trim();
    navigate(q ? `/stakeholders?q=${encodeURIComponent(q)}` : "/stakeholders");
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 selection:bg-sanku-orange/20 selection:text-sanku-orange">
      <header 
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled 
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b py-2" 
            : "bg-white border-b py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 gap-4">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center shrink-0 group">
                <img
                  src={logo}
                  alt="Sanku Logo"
                  className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
                />
              </Link>

              <nav className="hidden lg:flex items-center gap-1">
                {mainNavItems.map((item) => {
                  const isActive =
                    item.path === "/"
                      ? location.pathname === "/"
                      : item.path === "/stakeholders"
                        ? location.pathname.startsWith("/stakeholders")
                        : location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 group ${
                        isActive
                          ? "text-sanku-orange"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-sanku-orange shadow-[0_0_8px_rgba(255,107,0,0.8)]" />
                      )}
                    </Link>
                  );
                })}

                <div className="w-px h-6 bg-slate-200 mx-2" />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex items-center gap-2 px-4 h-9 font-semibold rounded-lg transition-all ${
                        activeModule 
                          ? "bg-slate-900 text-white hover:bg-slate-800" 
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      {activeModule ? (
                        <activeModule.icon className="w-4 h-4" />
                      ) : (
                        <LayoutDashboard className="w-4 h-4" />
                      )}
                      <span>{activeModule ? activeModule.label : "Explore Modules"}</span>
                      <ChevronDown className={`w-3.5 h-3.5 opacity-50 transition-transform duration-200 ${activeModule ? "rotate-0" : ""}`} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-72 p-2 rounded-xl shadow-xl border-slate-100">
                    <DropdownMenuLabel className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Platform Modules
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1" />
                    <div className="grid gap-1">
                      {appModules.map((item) => (
                        <DropdownMenuItem key={item.path} asChild className="p-0">
                          <Link 
                            to={item.path} 
                            className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                              location.pathname === item.path ? "bg-slate-50" : "hover:bg-slate-50"
                            }`}
                          >
                            <div className={`mt-0.5 p-1.5 rounded-md ${item.iconBg}`}>
                              <item.icon className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-900">{item.label}</span>
                              <span className="text-xs text-slate-500 line-clamp-1">{item.description}</span>
                            </div>
                            {location.pathname === item.path && (
                              <ChevronRight className="w-3.5 h-3.5 ml-auto text-sanku-orange" />
                            )}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <form
                onSubmit={submitHeaderSearch}
                className="hidden md:flex items-center relative group"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sanku-orange transition-colors" />
                <Input
                  placeholder="Quick search..."
                  value={headerQuery}
                  onChange={(e) => setHeaderQuery(e.target.value)}
                  className="pl-9 bg-slate-50 border-slate-200 h-9 w-48 lg:w-64 focus-visible:ring-sanku-orange/20 focus-visible:bg-white focus-visible:border-sanku-orange/50 transition-all rounded-lg"
                  aria-label="Search stakeholders"
                />
              </form>

              <Button variant="ghost" size="icon" className="text-slate-500 hover:text-sanku-orange hover:bg-sanku-orange/5 relative rounded-lg h-9 w-9">
                <Bell className="w-5 h-5" />
                <Badge className="absolute top-1 right-1 px-1 min-w-[16px] h-4 bg-sanku-orange text-[10px] flex items-center justify-center border-2 border-white pointer-events-none">
                  3
                </Badge>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative p-0 h-9 w-9 rounded-full ring-offset-2 hover:ring-2 hover:ring-sanku-orange/20 transition-all">
                    <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                      <AvatarImage src="" alt={user?.name} />
                      <AvatarFallback className="bg-sanku-navy text-white text-[10px] font-bold">
                        {(user?.name || "?").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-2 rounded-xl shadow-xl border-slate-100" align="end" forceMount>
                  <div className="flex items-center gap-3 p-3">
                    <Avatar className="h-10 w-10 border shadow-sm">
                      <AvatarFallback className="bg-sanku-navy text-white text-xs font-bold">
                        {(user?.name || "?").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-slate-900 leading-none">{user?.name}</p>
                      <p className="text-xs text-slate-500 mt-1 leading-none truncate max-w-[140px]">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem asChild className="rounded-lg p-2 cursor-pointer">
                    <Link to="/settings" className="flex items-center gap-3">
                      <div className="p-1.5 rounded-md bg-slate-100">
                        <User className="w-4 h-4 text-slate-600" />
                      </div>
                      <span className="font-medium text-slate-700">Profile Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg p-2 cursor-pointer">
                    <a href="https://sanku.org" target="_blank" rel="noreferrer" className="flex items-center gap-3">
                      <div className="p-1.5 rounded-md bg-slate-100">
                        <ExternalLink className="w-4 h-4 text-slate-600" />
                      </div>
                      <span className="font-medium text-slate-700">Official Website</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-lg p-2 cursor-pointer text-destructive focus:bg-destructive/5 focus:text-destructive">
                    <div className="p-1.5 rounded-md bg-destructive/10">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="font-bold">Log out session</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden rounded-lg h-9 w-9">
                    <Menu className="w-6 h-6 text-slate-700" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-[350px] p-0 border-r-0">
                  <div className="flex flex-col h-full bg-white">
                    <div className="p-6 border-b flex items-center justify-between">
                      <img src={logo} alt="Sanku Logo" className="h-8 w-auto" />
                      <SheetClose asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <X className="w-5 h-5 text-slate-400" />
                        </Button>
                      </SheetClose>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto py-6 px-4">
                      <nav className="space-y-1">
                        <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Navigation</p>
                        {mainNavItems.map((item) => (
                          <SheetClose asChild key={item.path}>
                            <Link
                              to={item.path}
                              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                                location.pathname === item.path 
                                  ? "bg-sanku-orange/10 text-sanku-orange" 
                                  : "text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <item.icon className="w-5 h-5" />
                              <span className="font-bold text-base">{item.label}</span>
                              {location.pathname === item.path && <ChevronRight className="w-4 h-4 ml-auto" />}
                            </Link>
                          </SheetClose>
                        ))}
                      </nav>

                      <div className="mt-8 space-y-1">
                        <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Core Modules</p>
                        <div className="grid grid-cols-1 gap-1">
                          {appModules.map((item) => (
                            <SheetClose asChild key={item.path}>
                              <Link
                                to={item.path}
                                className={`flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all ${
                                  location.pathname === item.path 
                                    ? "bg-slate-900 text-white" 
                                    : "text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                <div className={`p-1.5 rounded-lg ${location.pathname === item.path ? "bg-white/10" : item.iconBg}`}>
                                  <item.icon className="w-4 h-4" />
                                </div>
                                <span className="font-semibold text-sm">{item.label}</span>
                              </Link>
                            </SheetClose>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 border-t bg-slate-50">
                      <div className="flex items-center gap-3 mb-6">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                          <AvatarFallback className="bg-sanku-navy text-white text-xs font-bold">
                            {(user?.name || "?").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                      </div>
                      <Button 
                        onClick={handleLogout} 
                        variant="outline" 
                        className="w-full justify-start gap-3 border-slate-200 text-slate-600 hover:text-destructive hover:border-destructive/20 hover:bg-destructive/5 font-bold h-11 rounded-xl"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5">
        <Outlet />
      </main>

      <footer className="border-t bg-white/50 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Sanku Logo" className="h-6 w-auto grayscale opacity-50" />
            <div className="h-4 w-px bg-slate-200" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Kenya Government Relations
            </p>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            © 2026 Sanku Kenya Government Relations CRM • Version 1.2.4
          </p>
        </div>
      </footer>
    </div>
  );
}

