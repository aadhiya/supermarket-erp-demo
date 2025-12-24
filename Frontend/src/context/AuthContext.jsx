import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email, password) => {
    try {
        const res = await apiClient.post('/api/auth/login', { email, password });
        //  STORE TOKEN IN localStorage (apiClient needs it)
        localStorage.setItem('accessToken', res.data.accessToken);
      setAccessToken(res.data.accessToken);
      // Decode token to get user info (simple version)
        
        const payload = JSON.parse(atob(res.data.accessToken.split('.')[1]));
        const id = payload.sub || payload['nameid'] || payload.nameid;
        const emailFromToken = payload.email;

        setUser({ id, email: emailFromToken });
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Invalid credentials' };
    }
  };

    const logout = () => {
        localStorage.removeItem('accessToken');
    setAccessToken(null);
        setUser(null);
        
  };

    //  Use useEffect to load token on app start
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setAccessToken(token);
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const id = payload.sub || payload['nameid'] || payload.nameid;
                const emailFromToken = payload.email;
                setUser({ id, email: emailFromToken });
            } catch {
                // bad token → clear
                localStorage.removeItem('accessToken');
                setAccessToken(null);
                setUser(null);
            }
        }
        setIsLoading(false);
    }, []);
    const value = {
        accessToken,
        user,
        login,
        logout,
        isAuthenticated: !!accessToken,
        isLoading
};
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
