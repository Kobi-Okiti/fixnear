import { Link, Outlet, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@/context/useAuth";

export default function Layout() {
  const { logout, artisan } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-start justify-between">
      <header className="bg-gray-100 p-4 shadow h-max w-full">
        <nav className="flex gap-4 items-center">
          <p>Welcome, {artisan?.fullName ?? "User"} </p>
          <Link to="/profile">Profile</Link>
          <Link to="/review">Reviews</Link>
          <Button onClick={handleLogout} className="!bg-red-600">
            Logout
          </Button>
        </nav>
      </header>

      <main className="flex-1 p-6">
        <Outlet />
      </main>

      <footer className="bg-gray-100 p-4 text-center mt-8 h-max w-full">
        © 2025 FixNear
      </footer>
    </div>
  );
}
