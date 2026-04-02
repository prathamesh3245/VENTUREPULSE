import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("vp_current_user");
      if (saved) setCurrentUser(JSON.parse(saved));
    } catch {}
  }, []);

  function getUsers() {
    try { return JSON.parse(localStorage.getItem("vp_users") || "[]"); } catch { return []; }
  }
  function saveUsers(users) {
    localStorage.setItem("vp_users", JSON.stringify(users));
  }

  function login(email, password, userType) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password && u.userType === userType);
    if (user) {
      localStorage.setItem("vp_current_user", JSON.stringify(user));
      setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, error: "Invalid credentials or account type." };
  }

  function register(data) {
    const users = getUsers();
    if (users.find(u => u.email === data.email)) {
      return { success: false, error: "An account with this email already exists." };
    }
    const newUser = { ...data, id: Date.now().toString() };
    saveUsers([...users, newUser]);
    localStorage.setItem("vp_current_user", JSON.stringify(newUser));
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  }

  function logout() {
    localStorage.removeItem("vp_current_user");
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
