import { useState } from "react";
import { LoginPage } from "@/components/LoginPage";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/components/Dashboard";
import { UploadNew } from "@/components/UploadNew";
import { AdminPanel } from "@/components/AdminPanel";
import { Team } from "@/components/Team";

const Index = () => {
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    role: 'Admin' | 'Engineer';
    avatar: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogin = (user: { name: string; email: string; role: 'Admin' | 'Engineer'; avatar: string }) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('dashboard');
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard userRole={currentUser.role} />;
      case 'upload':
        return <UploadNew userRole={currentUser.role} />;
      case 'team':
        return <Team />;
      case 'admin':
        return currentUser.role === 'Admin' ? <AdminPanel /> : <Dashboard userRole={currentUser.role} />;
      default:
        return <Dashboard userRole={currentUser.role} />;
    }
  };

  return (
    <Layout
      currentUser={currentUser}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      onLogout={handleLogout}
    >
      {renderPage()}
    </Layout>
  );
};

export default Index;
