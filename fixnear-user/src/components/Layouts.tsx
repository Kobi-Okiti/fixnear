import { Link, Outlet, useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { useAuth } from "@/context/useAuth";

export default function Layout() {

  const { logout, user  } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="h-screen w-screen flex flex-col items-start justify-between">
      <header className="bg-gray-100 p-4 shadow h-max w-full">
        <nav className="flex gap-4 items-center">
          <p>Welcome, {user?.fullName ?? "User"} </p>
          <Link to="/">Home</Link>
          <Link to="/artisans">Artisans</Link>
          <Link to="/profile">Profile</Link>
          <Button onClick={handleLogout} className="!bg-red-600">Logout</Button>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-100 p-4 text-center mt-8 h-max w-full">
        © 2025 FixNear
      </footer>
    </div>
  )
}
