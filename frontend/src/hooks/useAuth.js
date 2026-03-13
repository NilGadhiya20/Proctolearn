import { useEffect } from 'react';
import { useAuthStore } from '../context/store.js';
import { getCurrentUser } from '../services/authService.js';

export const useAuth = () => {
  const { user, token, isAuthenticated, initializeFromLocalStorage } = useAuthStore();

  useEffect(() => {
    // Initialize auth from localStorage on mount
    initializeFromLocalStorage();
  }, []); // Empty dependency array - only run once on mount

  return {
    user,
    token,
    isAuthenticated
  };
};

export const useUser = () => {
  const { user, setUser } = useAuthStore();
  const isLoading = false;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getCurrentUser();
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    if (!user) {
      fetchUser();
    }
  }, [user, setUser]);

  return { user, isLoading };
};
