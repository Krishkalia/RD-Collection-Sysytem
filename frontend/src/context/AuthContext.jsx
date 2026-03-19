import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Create the context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('rdToken');
        const userData = localStorage.getItem('rdUser');
        if (token && userData) {
          let parsedUser = JSON.parse(userData);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // If user is a customer, fetch their profile photo
          if (parsedUser.role === 'user') {
            try {
              const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/customer/me`);
              parsedUser = { ...parsedUser, profilePictureUrl: res.data.profilePictureUrl };
            } catch (err) {
              console.error('Failed to fetch initial profile data', err);
            }
          }
          setUser(parsedUser);
        }
      } catch (err) {
        console.error('Auth initialization failed', err);
        localStorage.removeItem('rdToken');
        localStorage.removeItem('rdUser');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const updateUser = (data) => {
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('rdUser', JSON.stringify(updatedUser));
  };


  const login = async (email, password) => {
    try {
      // NOTE: Using localhost:5000 hardcode for dev. Adjust in prod.
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });

      
      const { token, user: loggedInUser } = res.data;
      
      // Convert backend role number back to string for UI routing 
      const roleStr = loggedInUser.userType === 1 ? 'admin' : loggedInUser.userType === 2 ? 'agent' : 'user';
      const frontendUserObj = { ...loggedInUser, role: roleStr };

      setUser(frontendUserObj);
      localStorage.setItem('rdToken', token);
      localStorage.setItem('rdUser', JSON.stringify(frontendUserObj));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return frontendUserObj;
    } catch (err) {
      console.error('Login Failed', err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rdToken');
    localStorage.removeItem('rdUser');
    delete axios.defaults.headers.common['Authorization'];
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Initializing application..." />;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
