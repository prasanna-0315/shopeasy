import { useCallback, useMemo, useState } from "react";
import { authApi } from "../services/api";
import { AuthContext } from "./auth-context";

function readStoredUser() {
  const storedUser = localStorage.getItem("user");
  if (!storedUser || !localStorage.getItem("token")) return null;
  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const login = useCallback(async (credentials) => {
    const response = await authApi.login(credentials);
    if (!response?.token || !response.email) {
      throw new Error("The server returned an invalid login response.");
    }
    const authenticatedUser = {
      name: response.name,
      email: response.email,
      role: response.role,
    };
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(authenticatedUser));
    localStorage.setItem("userName", authenticatedUser.name || "");
    localStorage.setItem("userEmail", authenticatedUser.email);
    localStorage.setItem("userRole", authenticatedUser.role || "USER");
    setUser(authenticatedUser);
    return response;
  }, []);

  const register = useCallback((details) => authApi.register(details), []);

  const logout = useCallback(() => {
    ["token", "user", "userName", "userEmail", "userRole"].forEach((key) => localStorage.removeItem(key));
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user && localStorage.getItem("token")),
    login,
    register,
    logout,
  }), [user, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
