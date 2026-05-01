import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setToken, clearToken, getToken } from '../api/axiosInstance';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) throw new Error('Token expired');
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch {
      clearToken();
      setUser(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    setToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    clearToken();
    setUser(null);
  };

  const setSocialToken = (token) => {
    setToken(token);
    loadUser();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, setSocialToken }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
