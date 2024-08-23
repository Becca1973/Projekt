import { createContext, useContext, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  // Memoized login function
  const login = useCallback(
    async (data) => {
      // You would typically handle authentication here
      // e.g., send data to an API, handle errors, etc.
      navigate("/");
    },
    [navigate]
  );

  // Memoized logout function
  const logout = useCallback(() => {
    navigate("/", { replace: true });
  }, [navigate]);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [login, logout, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
