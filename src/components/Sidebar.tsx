
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ScanLine, 
  Users, 
  Mail, 
  Settings, 
  LogOut,
  PlusCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active }) => {
  return (
    <Link 
      to={to} 
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
        active 
          ? "bg-primary text-white" 
          : "hover:bg-primary/10 text-gray-700"
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  // Get user's name from metadata if available
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
  const userEmail = user?.email || "user@example.com";

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
  <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
    <ScanLine className="w-6 h-6" />
    ConnectMatic
  </h2>
  <p className="text-sm text-gray-500 mt-1 ml-7">By A.khafar Solutions</p>
</div>


      <div className="p-2">
        <Link to="/add-contact">
          <Button className="w-full gap-2">
            <PlusCircle className="w-4 h-4" />
            Add Contact
          </Button>
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        <NavItem 
          to="/dashboard" 
          icon={<LayoutDashboard size={20} />} 
          label="Dashboard" 
          active={location.pathname === "/dashboard"} 
        />
        <NavItem 
          to="/scan" 
          icon={<ScanLine size={20} />} 
          label="Scan Card" 
          active={location.pathname === "/scan"} 
        />
        <NavItem 
          to="/contacts" 
          icon={<Users size={20} />} 
          label="Contacts" 
          active={location.pathname === "/contacts"} 
        />
        <NavItem 
          to="/follow-ups" 
          icon={<Mail size={20} />} 
          label="Follow-ups" 
          active={location.pathname === "/follow-ups"} 
        />
        <NavItem 
          to="/settings" 
          icon={<Settings size={20} />} 
          label="Settings" 
          active={location.pathname === "/settings"} 
        />
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className="font-medium">{userName}</p>
            <p className="text-sm text-gray-500 truncate">{userEmail}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2 justify-center"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
