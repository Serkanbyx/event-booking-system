import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';

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
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Validate existing token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        setUser(response.data?.user || response.data);
      } catch {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);
    const { token: newToken, user: newUser } = response.data;

    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);

    return response;
  }, []);

  const register = useCallback(async (data) => {
    const response = await authService.register(data);
    const { token: newToken, user: newUser } = response.data;

    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);

    return response;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/');
  }, [navigate]);

  const updateUser = useCallback((updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    isOrganizer: user?.role === 'organizer' || user?.role === 'admin',
    isAdmin: user?.role === 'admin',
    isAttendee: user?.role === 'attendee',
    login,
    register,
    logout,
    updateUser,
  }), [user, token, loading, login, register, logout, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
