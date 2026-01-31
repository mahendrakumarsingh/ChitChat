import { useState, useCallback } from 'react';

// Mock authentication for demo purposes
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Alex Chen',
    email: 'alex@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    status: 'online',
  },
  {
    id: '2',
    name: 'Sarah Miller',
    email: 'sarah@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    status: 'offline',
  },
  {
    id: '3',
    name: 'Jordan Park',
    email: 'jordan@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan',
    status: 'online',
  },
];

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  const login = useCallback(async (email: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = MOCK_USERS.find(u => u.email === email);
    if (user) {
      setAuthState({
        isAuthenticated: true,
        user,
        token: 'mock-jwt-token',
      });
      return true;
    }
    return false;
  }, []);

  const register = useCallback(async (name: string, email: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      status: 'online',
    };
    
    setAuthState({
      isAuthenticated: true,
      user: newUser,
      token: 'mock-jwt-token',
    });
    return true;
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  }, []);

  const updateUserStatus = useCallback((status: User['status']) => {
    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, status } : null,
    }));
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    updateUserStatus,
  };
};
