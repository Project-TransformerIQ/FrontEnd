import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Shield } from "lucide-react";
import logo from "@/assets/logo.png";
import heroImage from "@/assets/hero-transformer.jpg";

interface LoginPageProps {
  onLogin: (user: { name: string; email: string; role: 'Admin' | 'Engineer'; avatar: string }) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Mock users for demonstration
  const mockUsers = [
    {
      email: "admin@company.com",
      password: "admin123",
      name: "Dr. Emily Davis",
      role: "Admin" as const,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616c6523006?w=150"
    },
    {
      email: "engineer@company.com",
      password: "engineer123",
      name: "John Smith",
      role: "Engineer" as const,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
    }
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (user) {
      onLogin({
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      });
    } else {
      alert("Invalid credentials. Try admin@company.com / admin123 or engineer@company.com / engineer123");
    }
  };

  const handleGoogleLogin = () => {
    // Mock Google login - in a real app this would integrate with Google OAuth
    onLogin({
      name: "John Smith",
      email: "john.smith@company.com",
      role: "Engineer",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
    });
  };

  const handleDemoLogin = (role: 'Admin' | 'Engineer') => {
    const demoUser = mockUsers.find(u => u.role === role);
    if (demoUser) {
      onLogin({
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
        avatar: demoUser.avatar
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-cool flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="space-y-6 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-4">
            <img src={logo} alt="Logo" className="h-16 w-16" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Transformer Thermal Inspection
              </h1>
              <p className="text-xl text-muted-foreground">Automation System</p>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <img 
              src={heroImage} 
              alt="Industrial facility" 
              className="w-full rounded-2xl shadow-elegant"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Advanced AI-Powered Thermal Analysis
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Secure Access</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-primary" />
                <span>Role-Based Control</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-primary" />
                <span>Data Protection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-elegant">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <p className="text-muted-foreground">
                Sign in to access the thermal inspection system
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Google Login Button */}
              <Button 
                onClick={handleGoogleLogin}
                variant="outline" 
                className="w-full"
                size="lg"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-card px-3 text-muted-foreground text-sm">
                    or continue with email
                  </span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" variant="thermal">
                  <Lock className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </form>

              <Separator />

              {/* Demo Accounts */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  Demo Accounts (for testing):
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDemoLogin('Admin')}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Demo
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDemoLogin('Engineer')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Engineer Demo
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground text-center space-y-1">
                  <p>Admin: admin@company.com / admin123</p>
                  <p>Engineer: engineer@company.com / engineer123</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}