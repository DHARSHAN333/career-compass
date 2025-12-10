import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth on mount - load user from token if exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        try {
          const response = await axios.get('http://localhost:5000/api/v1/auth/me');
          setUser(response.data.data.user);
        } catch (error) {
          // Only logout on 401 (invalid token), not on network/server errors
          if (error.response?.status === 401) {
            console.warn('Invalid token, clearing...');
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
          } else {
            console.error('Server error, keeping token for retry:', error.message);
          }
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/v1/auth/register', userData);
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.errors?.[0]?.msg || 'Registration failed'
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/v1/auth/login', {
        email,
        password
      });
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
