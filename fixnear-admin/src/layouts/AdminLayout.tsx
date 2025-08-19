import { ReactNode } from "react";
import { Button } from "../components/ui/button";
import { SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";
import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };
  return (
    <SidebarProvider className="w-screen h-full flex flex-row">
      <AppSidebar />
      <div className="flex-1 h-full flex flex-col">
        <nav className="bg-gray-800 shadow p-4 flex justify-between items-center">
          <span className="text-white">Welcome, {admin?.fullName ?? "Admin"}</span>
          <Button onClick={handleLogout} className="!bg-red-600">Logout</Button>
        </nav>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </SidebarProvider>
  );
}
