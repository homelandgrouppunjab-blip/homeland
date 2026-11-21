import React, { createContext, useContext, useEffect, useState } from "react";
import { adminLogin, adminLogout, adminMe } from "@/lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Session is carried in a secure httpOnly cookie (set by /admin/login).
    // On mount we ask the server who we are; no token is read from JS storage.
    adminMe()
      .then((d) => setEmail(d.email))
      .catch(() => setEmail(null))
      .finally(() => setLoading(false));
    // Runs once on mount; adminMe is a stable import.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (payload) => {
    const data = await adminLogin(payload); // server sets the httpOnly cookie
    setEmail(data.email);
    return data;
  };

  const logout = async () => {
    try {
      await adminLogout();
    } catch (error) {
      // Non-fatal: the server session clears on its own; log and clear locally.
      console.warn("AuthContext: logout request failed, clearing session locally", error);
    }
    setEmail(null);
  };

  return (
    <AuthContext.Provider value={{ email, isAuthenticated: !!email, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
