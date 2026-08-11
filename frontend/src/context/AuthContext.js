import React, { createContext, useContext, useEffect, useState } from "react";
import { adminLogin, adminMe } from "@/lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // NOTE: The API is a stateless JWT bearer API (Vercel serverless friendly).
    // The token is kept in localStorage to attach as an Authorization header.
    // Migrating to httpOnly cookies would require server-side session/CSRF handling;
    // tracked as a separate hardening task. XSS risk is mitigated by React's default
    // escaping and by not rendering untrusted HTML.
    const token = localStorage.getItem("hg_token");
    if (!token) {
      setLoading(false);
      return;
    }
    adminMe()
      .then((d) => setEmail(d.email))
      .catch((e) => {
        console.warn("AuthContext: session invalid, clearing token", e);
        localStorage.removeItem("hg_token");
      })
      .finally(() => setLoading(false));
    // Runs once on mount to restore an existing session; adminMe is a stable import.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
