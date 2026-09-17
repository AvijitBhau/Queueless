import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      profile: null,
      // loading is NOT persisted (see partialize below) so it always starts
      // true on a fresh page load and goes false once the session resolves.
      // Keeping it in the store (not local useState) means ALL useAuth() callers
      // share one loading value — ProtectedRoute never re-enters a loading state
      // just because it re-mounts after initial resolution.
      loading: true,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (v) => set({ loading: v }),
      logout: () => set({ user: null, profile: null }),
    }),
    {
      name: 'queueless-auth',
      // Only persist user and profile. loading must always start as true
      // on a new page load so the initial session check is performed.
      partialize: (state) => ({ user: state.user, profile: state.profile }),
    }
  )
);

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
