import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ScanLine, 
  Users, 
  Mail, 
  Settings, 
  LogOut,
  PlusCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active, collapsed }) => {
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-3 rounded-md transition-colors p-3",
        active 
          ? "bg-primary text-white" 
          : "hover:bg-primary/10 text-gray-700",
        collapsed ? "justify-center px-3" : "px-4"
      )}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!collapsed && <span className="font-medium">{label}</span>}
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
  const userEmail = user?.email || "user@example.com";

  return (
    <div className={`h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-200 ${collapsed ? "w-20" : "w-64"}`}>
      {/* Header with toggle button */}
      <div className="flex items-center p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <ScanLine className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-primary">ConnectMatic</h2>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={toggleSidebar}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        <NavItem 
          to="/dashboard" 
          icon={<LayoutDashboard size={20} />} 
          label="Dashboard" 
          active={location.pathname === "/dashboard"} 
          collapsed={collapsed}
        />
        <NavItem 
          to="/scan" 
          icon={<ScanLine size={20} />} 
          label="Scan Card" 
          active={location.pathname === "/scan"} 
          collapsed={collapsed}
        />
        <NavItem 
          to="/contacts" 
          icon={<Users size={20} />} 
          label="Contacts" 
          active={location.pathname === "/contacts"} 
          collapsed={collapsed}
        />
        <NavItem 
          to="/follow-ups" 
          icon={<Mail size={20} />} 
          label="Follow-ups" 
          active={location.pathname === "/follow-ups"} 
          collapsed={collapsed}
        />
        <NavItem 
          to="/settings" 
          icon={<Settings size={20} />} 
          label="Settings" 
          active={location.pathname === "/settings"} 
          collapsed={collapsed}
        />
      </nav>

      {/* Footer with user info */}
      <div className="p-2 border-t border-gray-200">
        {!collapsed ? (
          <>
            <div className="mb-2 px-2">
              <p className="font-medium truncate">{userName}</p>
              <p className="text-sm text-gray-500 truncate">{userEmail}</p>
            </div>
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Sign Out
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleLogout}
            >
              <LogOut size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;