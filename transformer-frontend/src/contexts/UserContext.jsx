// src/contexts/UserContext.jsx
import { createContext, useContext, useState } from "react";
import api from "../services/api"; // keep as in your project

const UserContext = createContext(null);

export function UserProvider({ children }) {
  // 👇 ALWAYS start logged-out
  const [currentUser, setCurrentUser] = useState(null);

  // 👇 Call backend, check password there, and return user
  const login = async (name, password) => {
    const res = await api.post("/auth/login", { name, password });
    // expected: { token, id, name, occupation, admin }
    const user = res.data;

    setCurrentUser(user);

    if (user.token) {
      api.defaults.headers.common["X-Auth-Token"] = user.token;
    }

    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    delete api.defaults.headers.common["X-Auth-Token"];
  };

  return (
    <UserContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
