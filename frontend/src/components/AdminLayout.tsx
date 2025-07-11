import { ReactNode, useState, useEffect } from "react";
import { useAuth } from "../App";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  LogOut, 
  Menu,
  User,
  Bell,
  Settings,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: ReactNode;
}

//import image
import logo from "@/assets/logo512.png";

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { isAuthenticated, setIsAuthenticated, user, setUser, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if viewport is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/login", { replace: true });
    }
  };

  const navigationItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/dashboard",
      active: location.pathname === "/" || location.pathname === "/dashboard"
    },
    {
      icon: PlusCircle,
      label: "Add Article",
      path: "/add-article",
      active: location.pathname === "/add-article"
    },
    {
      icon: FileText,
      label: "Manage Articles",
      path: "/manage-articles",
      active: false
    }
  ];

  const NavigationList = ({ mobile = false, onItemClick = () => {} }) => (
    <ul className="space-y-2">
      {navigationItems.map((item, index) => (
        <li key={index}>
          <Button
            variant={item.active ? "default" : "ghost"}
            className={`w-full justify-start gap-3 h-11 ${
              sidebarCollapsed && !mobile ? 'px-2' : 'px-4'
            }`}
            onClick={() => {
              navigate(item.path);
              onItemClick();
            }}
          >
            <item.icon className="w-5 h-5" />
            {(!sidebarCollapsed || mobile) && <span>{item.label}</span>}
          </Button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop Sidebar - hidden on mobile */}
      <aside className={`bg-card border-r border-border transition-all duration-300 hidden md:flex md:flex-col ${
        sidebarCollapsed ? 'md:w-16' : 'md:w-64'
      }`}>
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <img src={logo} alt="Logo" className="w-6 h-6" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-bold text-lg text-foreground">SensGrid</h1>
                <p className="text-xs text-muted-foreground">Content Management</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <NavigationList />
        </nav>

        {/* Collapse Button */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full"
          >
            <Menu className="w-4 h-4" />
            {!sidebarCollapsed && <span className="ml-2">Collapse</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[240px] p-0">
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <img src={logo} alt="Logo" className="w-6 h-6" />
                      </div>
                      <div>
                        <h1 className="font-bold text-lg text-foreground">SensGrid</h1>
                        <p className="text-xs text-muted-foreground">Content Management</p>
                      </div>
                    </div>
                  </div>
                  <nav className="p-4">
                    <NavigationList mobile={true} onItemClick={() => document.body.click()} />
                  </nav>
                </SheetContent>
              </Sheet>

              <h2 className="text-xl font-semibold text-foreground truncate">
                {location.pathname === "/" || location.pathname === "/dashboard" 
                  ? "Dashboard" 
                  : location.pathname === "/add-article" 
                  ? "Add New Article"
                  : "Manage Content"
                }
              </h2>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <Bell className="w-4 h-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.name?.[0] || 'A'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.username || 'Admin User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || 'admin@example.com'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
