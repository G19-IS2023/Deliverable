
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate a delay
      setIsAuthenticated(true);
      setUserData({ name: 'User', loggedIn: true });
    };

    fetchData();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
