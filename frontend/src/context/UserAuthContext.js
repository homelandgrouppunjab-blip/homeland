import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { authSession, authMe, authLogout, getFavoriteSlugs, addFavorite, removeFavorite } from "@/lib/api";
import { logger } from "@/lib/logger";

const UserAuthContext = createContext(null);
export const useUser = () => useContext(UserAuthContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  const loadFavorites = useCallback(async () => {
    try { setFavorites(await getFavoriteSlugs()); } catch { setFavorites([]); }
  }, []);

  const check = useCallback(async () => {
    try {
      const me = await authMe();
      setUser(me);
      await loadFavorites();
    } catch {
      setUser(null);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [loadFavorites]);

  useEffect(() => {
    // Handle the Emergent Google sign-in redirect: the session_id arrives in the
    // URL fragment. Exchange it once, then clean the hash.
    const hash = window.location.hash || "";
    if (hash.includes("session_id=")) {
      const sid = hash.split("session_id=")[1].split("&")[0];
      authSession(sid)
        .then((d) => { setUser(d.user); return loadFavorites(); })
        .catch((e) => {
          logger.error("UserAuth: sign-in session exchange failed", e);
          toast.error("Sign-in failed", { description: "We couldn't complete your sign-in. Please try again." });
        })
        .finally(() => {
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
          setLoading(false);
        });
      return;
    }
    check();
  }, [check, loadFavorites]);

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const login = () => {
    const redirectUrl = window.location.origin + "/";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const logout = async () => {
    try { await authLogout(); } catch (e) { logger.warn("UserAuth: logout request failed; clearing local session anyway", e); }
    setUser(null);
    setFavorites([]);
  };

  const isFavorite = useCallback((slug) => favorites.includes(slug), [favorites]);

  const toggleFavorite = useCallback(async (slug) => {
    if (!user) {
      toast.info("Sign in to save projects", { description: "Create a free account to keep your favourites." });
      login();
      return;
    }
    const currentlyFav = favorites.includes(slug);
    // Optimistic update
    setFavorites((prev) => (currentlyFav ? prev.filter((s) => s !== slug) : [...prev, slug]));
    try {
      const slugs = currentlyFav ? await removeFavorite(slug) : await addFavorite(slug);
      setFavorites(slugs);
      toast.success(currentlyFav ? "Removed from saved" : "Saved to your account");
    } catch (e) {
      // Revert on failure
      setFavorites((prev) => (currentlyFav ? [...prev, slug] : prev.filter((s) => s !== slug)));
      toast.error("Could not update your saved projects. Please try again.");
    }
  }, [user, favorites]);

  return (
    <UserAuthContext.Provider value={{ user, loading, login, logout, favorites, isFavorite, toggleFavorite, refreshFavorites: loadFavorites }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export default UserProvider;
