import React, { createContext, useContext, useEffect, useState } from "react";
import { adminLogin, adminMe } from "@/lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("hg_token");
    if (!token) {
      setLoading(false);
      return;
    }
    adminMe()
      .then((d) => setEmail(d.email))
      .catch(() => localStorage.removeItem("hg_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (payload) => {
    const data = await adminLogin(payload);
    localStorage.setItem("hg_token", data.access_token);
    setEmail(data.email);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("hg_token");
    setEmail(null);
  };

  return (
    <AuthContext.Provider value={{ email, isAuthenticated: !!email, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
