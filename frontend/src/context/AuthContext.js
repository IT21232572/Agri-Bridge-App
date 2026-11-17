import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on mount
    const savedUser = localStorage.getItem('agri_user');
    const token = localStorage.getItem('agri_auth_token');

    if (savedUser && token) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('agri_user');
      }
    } else {
      // Set a default active demo profile (Admin) so the app is immediately fully usable
      const defaultDemo = {
        name: 'Admin Manager',
        email: 'admin@agribridge.lk',
        role: 'Admin',
        phone: '+94 77 100 2001',
        location: { city: 'Colombo', district: 'Colombo' }
      };
      setCurrentUser(defaultDemo);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await loginUser({ email, password });
    setCurrentUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await registerUser(userData);
    setCurrentUser(data.user);
    return data;
  };

  const logout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  const quickSwitchRole = (roleType) => {
    const rolePresets = {
      Admin: {
        name: 'Admin Manager',
        email: 'admin@agribridge.lk',
        role: 'Admin',
        phone: '+94 77 100 2001',
        location: { city: 'Colombo', district: 'Colombo' }
      },
      Driver: {
        name: 'Sunil Perera (Express Driver)',
        email: 'sunil.driver@agribridge.lk',
        role: 'Driver',
        phone: '+94 71 888 4421',
        location: { city: 'Dambulla', district: 'Matale' },
        driverDetails: {
          vehicleType: 'Refrigerated Truck',
          vehicleNumber: 'WP-LB-9482',
          isAvailable: true,
          currentStatus: 'Available',
          rating: 4.9
        }
      },
      Seller: {
        name: 'Nimal Fernando (Produce Seller)',
        email: 'nimal.seller@agribridge.lk',
        role: 'Seller',
        phone: '+94 78 333 9911',
        location: { city: 'Dambulla', district: 'Matale' }
      },
      Buyer: {
        name: 'Ruwan Wijesinghe (Wholesale Buyer)',
        email: 'ruwan.buyer@agribridge.lk',
        role: 'Buyer',
        phone: '+94 77 999 5544',
        location: { city: 'Peliyagoda', district: 'Gampaha' }
      }
    };

    if (rolePresets[roleType]) {
      const selected = rolePresets[roleType];
      setCurrentUser(selected);
      localStorage.setItem('agri_user', JSON.stringify(selected));
    }
  };

  const value = {
    currentUser,
    userRole: currentUser?.role || 'Guest',
    isAuthenticated: !!currentUser,
    login,
    register,
    logout,
    quickSwitchRole,
    setCurrentUser,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
