import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  HelpCircle,
  BarChart3,
  BookOpen,
  Map,
  Briefcase,
  LogOut,
  Target,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resume", label: "Resume Analysis", icon: FileText },
  { to: "/questions", label: "AI Questions", icon: HelpCircle },
  { to: "/interview", label: "Mock Interview", icon: MessageSquare },
  { to: "/analytics", label: "Performance", icon: BarChart3 },
  { to: "/learning", label: "Learning Center", icon: BookOpen },
  { to: "/roadmap", label: "AI Roadmap", icon: Map },
  { to: "/career", label: "Career Guide", icon: Briefcase },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-950">
      <aside className="w-64 shrink-0 border-r border-gray-800 bg-gray-900 flex flex-col">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2 text-lg font-bold">
            <Target className="text-blue-500" size={22} />
            <span>
              Smart <span className="text-blue-500">Interview</span>
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">AI Preparation Assistant</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <p className="text-sm font-medium truncate">{user?.name}</p>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-3 flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
