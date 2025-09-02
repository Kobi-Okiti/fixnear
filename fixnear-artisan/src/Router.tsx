import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layouts";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import SignUp from "./pages/SignUp";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/register" element={<SignUp />} />
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
