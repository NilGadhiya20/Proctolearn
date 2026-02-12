import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),

  login: (user, token) => {
    set({ user, token, isAuthenticated: true });
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  initializeFromLocalStorage: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      set({
        token,
        user: JSON.parse(user),
        isAuthenticated: true
      });
    }
  }
}));

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
