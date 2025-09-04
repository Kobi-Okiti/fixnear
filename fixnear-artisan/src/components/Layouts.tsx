"use client";

import { Link, Outlet, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@/context/useAuth";
import { useState } from "react";
import api from "@/service/api";
import { toast } from "sonner";

export default function Layout() {
  const { logout, artisan, token } = useAuth();
  const navigate = useNavigate();
  const [isAvailable, setIsAvailable] = useState(artisan?.isAvailable || false);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const toggleAvailability = async () => {
    if (!token) return;
    setLoading(true);

    try {
      const res = await api.patch(`/artisan/me`, {
        isAvailable: !isAvailable,
      });
      setIsAvailable(res.data.isAvailable);
      toast.success(
        `You are now ${isAvailable ? "Available" : "Unavailable"} for work`
      );
    } catch {
      toast.error("Failed to update availability");
      setIsAvailable((prev) => !prev);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-start justify-between">
      <header className="bg-gray-100 p-4 shadow h-max w-full">
        <nav className="flex gap-4 items-center">
          <p>Welcome, {artisan?.fullName ?? "User"} </p>
          <Link to="/profile">Profile</Link>
          <Link to="/review">Reviews</Link>
          {artisan && (
            <div className="flex items-center gap-2">
              <button
                onClick={toggleAvailability}
                disabled={loading}
                className={`px-3 py-1 rounded-md text-white font-medium transition-colors ${
                  isAvailable
                    ? "!bg-green-600 hover:!bg-green-700"
                    : "!bg-red-600 hover:!bg-red-700"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loading
                  ? "Updating..."
                  : isAvailable
                  ? "Available"
                  : "Unavailable"}
              </button>
            </div>
          )}

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
