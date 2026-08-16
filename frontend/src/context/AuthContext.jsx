import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // memberships: list returned after phone/password login, shown on the center-chooser screen
  const [memberships, setMemberships] = useState([]);
  const [activeCenter, setActiveCenter] = useState(null);
  const [role, setRole] = useState(null);

  const loginWithMemberships = (list) => setMemberships(list);

  const selectMembership = (token, center, chosenRole) => {
    localStorage.setItem("token", token);
    setActiveCenter(center);
    setRole(chosenRole);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setMemberships([]);
    setActiveCenter(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{ memberships, activeCenter, role, loginWithMemberships, selectMembership, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
