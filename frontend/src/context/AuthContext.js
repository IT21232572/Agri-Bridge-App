import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const API_URL = 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('agri_token') || null);
  const [authLoading, setAuthLoading] = useState(true);

  // Attach JWT token to every Axios request automatically
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('agri_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('agri_token');
    }
  }, [token]);

  // Verify token and load user profile on page refresh
  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser({ ...res.data, id: res.data._id });
      } catch (err) {
        setToken(null);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    loadProfile();
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/login`, { email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (formData) => {
    const res = await axios.post(`${API_URL}/register`, formData);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, authLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};