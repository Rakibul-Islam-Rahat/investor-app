import { useMemo, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Bell, LogOut, Menu, Moon, Sprout, Sun, X } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { ThemeContext } from "@/context";
import { useContext } from "react";
import { useDb } from "@/services/mock/store";
import { Button } from "@/components/ui/button";
import { NAV } from "../nav";

const ROLE_LABEL = { INVESTOR: "Investor", FIELD_MGR: "Field Manager", FINANCE: "Finance", ADMIN: "Admin" };

function SidebarContent({ items, onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} onClick={onNavigate}
          className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
          <Icon className="h-4 w-4" /> {label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const [open, setOpen] = useState(false);
  const notes = useDb((s) => s.notifications);
  const unread = useMemo(() => notes.filter((n) => n.userId === user.id && !n.read).length, [notes, user.id]);
  const items = NAV[user.role];
  const brand = (
    <Link to="/" className="flex h-16 items-center gap-2 border-b px-5 text-lg font-bold text-primary">
      <Sprout className="h-6 w-6" /> AgroFund
    </Link>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r bg-background lg:flex">{brand}<SidebarContent items={items} /></aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-background">
            {brand}<SidebarContent items={items} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
          <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</Button>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle theme">{darkMode ? <Sun /> : <Moon />}</Button>
            <Button variant="outline" size="icon" asChild className="relative">
              <Link to="/notifications" aria-label={`Notifications, ${unread} unread`}>
                <Bell />{unread > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] text-white">{unread}</span>}
              </Link>
            </Button>
            <div className="hidden px-2 text-right sm:block">
              <p className="text-sm font-medium leading-tight">{user.name}</p>
              <p className="text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</p>
            </div>
            <Button variant="outline" size="icon" onClick={logout} aria-label="Log out"><LogOut /></Button>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-4 md:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
