import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./Router.tsx";
import { AuthProvider } from "./context/authContext.tsx";
import { Toaster } from "sonner";
import 'leaflet/dist/leaflet.css';


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
    <Toaster richColors position="top-center" />
  </StrictMode>
);
