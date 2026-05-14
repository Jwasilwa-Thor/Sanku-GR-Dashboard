import React, { useEffect, useState } from "react";
import { Link, useLocation, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronDown, LogOut, Bell, Search, Menu, LayoutDashboard, Settings } from "lucide-react";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "@/assets/logo.png";
import { mainNavItems, appModules } from "@/config/modules";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const [headerQuery, setHeaderQuery] = useState("");

  const activeModule = appModules.find((m) => location.pathname === m.path);

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
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link to="/" className="flex items-center shrink-0">
              <img
                src={logo}
                alt="Sanku Logo"
                className="h-8 w-auto transition-opacity hover:opacity-90"
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-1 flex-1 px-8">
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
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-sanku-orange/10 text-sanku-orange"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-2 ${activeModule ? "bg-slate-100 text-slate-900" : "text-slate-600"}`}
                  >
                    {activeModule ? (
                      <activeModule.icon className="w-4 h-4" />
                    ) : (
                      <LayoutDashboard className="w-4 h-4" />
                    )}
                    <span>{activeModule ? activeModule.label : "Modules"}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Modules</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {appModules.map((item) => (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link to={item.path} className="flex items-center gap-2 w-full">
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            <div className="flex items-center gap-2 sm:gap-4">
              <form
                onSubmit={submitHeaderSearch}
                className="hidden md:flex items-center relative w-64"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <Input
                  placeholder="Search stakeholders…"
                  value={headerQuery}
                  onChange={(e) => setHeaderQuery(e.target.value)}
                  className="pl-9 bg-slate-100 border-none h-9 focus-visible:ring-sanku-orange/20"
                  aria-label="Search stakeholders"
                />
              </form>

              <Button variant="ghost" size="icon" className="text-slate-500 hover:text-sanku-orange relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-sanku-orange rounded-full border-2 border-white" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="" alt={user?.name} />
                      <AvatarFallback className="bg-sanku-navy text-white text-xs">
                        {(user?.name || "?").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <nav className="flex flex-col gap-4 mt-8">
                    {mainNavItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-semibold hover:bg-slate-100"
                      >
                        <item.icon className="w-6 h-6 text-sanku-orange" />
                        {item.label}
                      </Link>
                    ))}
                    <div className="h-px bg-slate-100 my-4" />
                    <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Modules</p>
                    <div className="grid grid-cols-1 gap-1">
                      {appModules.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50"
                        >
                          <item.icon className="w-4 h-4 text-slate-400" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>

      <footer className="border-t bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-400 font-medium">
            © 2026 Sanku Kenya Government Relations CRM
          </p>
        </div>
      </footer>
    </div>
  );
}
