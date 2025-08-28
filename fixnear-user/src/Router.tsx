import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layouts";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import ArtisanProfile from "./pages/ArtisanProfile";
import Artisans from "./pages/Artisans";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Emergency from "./pages/Emergency";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="artisans"
          element={
            <ProtectedRoute>
              <Artisans />
            </ProtectedRoute>
          }
        />
        <Route
          path="emergency"
          element={
            <ProtectedRoute>
              <Emergency />
            </ProtectedRoute>
          }
        />
        <Route
          path="artisan/:id"
          element={
            <ProtectedRoute>
              <ArtisanProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <NotFound />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
