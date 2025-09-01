// src/context/useAuth.ts
import { useContext } from "react";
import authContext from "./authContext";
import { AuthContextValue } from "./authTypes";

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(authContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
