import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authSession, authMe, authLogout } from "@/lib/api";

const UserAuthContext = createContext(null);
export const useUser = () => useContext(UserAuthContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    try { setUser(await authMe()); } catch { setUser(null); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    // Handle the Emergent Google sign-in redirect: the session_id arrives in the
    // URL fragment. Exchange it once, then clean the hash.
    const hash = window.location.hash || "";
    if (hash.includes("session_id=")) {
      const sid = hash.split("session_id=")[1].split("&")[0];
      authSession(sid)
        .then((d) => { setUser(d.user); })
        .catch(() => {})
        .finally(() => {
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
          setLoading(false);
        });
      return;
    }
    check();
  }, [check]);

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const login = () => {
    const redirectUrl = window.location.origin + "/";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };
  const logout = async () => { try { await authLogout(); } catch { /* ignore */ } setUser(null); };

  return (
    <UserAuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export default UserProvider;
