import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Thermometer, 
  Upload, 
  Users, 
  Shield, 
  LogOut, 
  Menu,
  X
} from "lucide-react";
import logo from "@/assets/logo.png";

interface LayoutProps {
  children: React.ReactNode;
  currentUser: {
    name: string;
    email: string;
    role: 'Admin' | 'Engineer';
    avatar: string;
  };
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

export function Layout({ children, currentUser, currentPage, onPageChange, onLogout }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', key: 'dashboard', icon: Thermometer },
    { name: 'Upload New', key: 'upload', icon: Upload },
    { name: 'Team', key: 'team', icon: Users },
    ...(currentUser.role === 'Admin' ? [{ name: 'Admin Panel', key: 'admin', icon: Shield }] : [])
  ];

  return (
    <div className="min-h-screen bg-gradient-cool">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border shadow-elegant sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <img src={logo} alt="Logo" className="h-10 w-10" />
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Transformer Thermal Inspection
                </h1>
                <p className="text-sm text-muted-foreground">Automation System</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => onPageChange(item.key)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === item.key
                        ? 'bg-primary text-primary-foreground shadow-elegant'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Profile */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant={currentUser.role === 'Admin' ? 'default' : 'secondary'}>
                      {currentUser.role}
                    </Badge>
                  </div>
                </div>
                <Avatar>
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>{currentUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
              </div>
              
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4" />
              </Button>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-border">
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      onPageChange(item.key);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === item.key
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}