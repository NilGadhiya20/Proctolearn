import { create } from 'zustand';

// Initialize auth from localStorage immediately (before store creation)
const getInitialState = () => {
  try {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      return {
        token,
        user: JSON.parse(user),
        isAuthenticated: true,
        isLoading: false
      };
    }
  } catch (error) {
    console.error('Error initializing auth from localStorage:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false
  };
};

export const useAuthStore = create((set) => {
  const initialState = getInitialState();
  
  return {
    ...initialState,

    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setToken: (token) => set({ token }),
    setLoading: (isLoading) => set({ isLoading }),

    login: (user, token) => {
      set({ user, token, isAuthenticated: true });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('✅ Login successful - saved to localStorage');
    },

    logout: () => {
      set({ user: null, token: null, isAuthenticated: false });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('✅ Logout successful - cleared localStorage');
    },

    initializeFromLocalStorage: () => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        console.log('🔄 Initializing auth from localStorage...');
        console.log('   Token exists:', !!token);
        console.log('   User exists:', !!user);
        
        if (token && user) {
          set({
            token,
            user: JSON.parse(user),
            isAuthenticated: true
          });
          console.log('✅ Auth restored from localStorage');
        } else {
          console.log('⚠️ No auth data in localStorage');
        }
      } catch (error) {
        console.error('❌ Error initializing from localStorage:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  };
});

export const useQuizStore = create((set) => ({
  quizzes: [],
  currentQuiz: null,
  isLoading: false,

  setQuizzes: (quizzes) => set({ quizzes }),
  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),
  setLoading: (isLoading) => set({ isLoading }),

  addQuiz: (quiz) =>
    set((state) => ({
      quizzes: [...state.quizzes, quiz]
    })),

  updateQuiz: (id, updatedQuiz) =>
    set((state) => ({
      quizzes: state.quizzes.map((q) => (q._id === id ? updatedQuiz : q))
    })),

  deleteQuiz: (id) =>
    set((state) => ({
      quizzes: state.quizzes.filter((q) => q._id !== id)
    }))
}));

export const useUIStore = create((set) => ({
  sidebarOpen: false,
  darkMode: false,
  notifications: [],

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setDarkMode: (dark) => set({ darkMode: dark }),
  setNotifications: (notifications) => set({ notifications }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, notification]
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    }))
}));

export const useFormStore = create((set) => ({
  formData: {},
  errors: {},
  touched: {},

  setFormData: (data) => set({ formData: data }),
  setErrors: (errors) => set({ errors }),
  setTouched: (touched) => set({ touched }),

  resetForm: () =>
    set({ formData: {}, errors: {}, touched: {} }),

  updateField: (field, value) =>
    set((state) => ({
      formData: { ...state.formData, [field]: value }
    }))
}));
