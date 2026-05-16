import { create } from "zustand";

interface UiState {
    sidebarOpen: boolean;
    sidebarCollapsed: boolean;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
    toggleCollapse: () => void;
}

export const useUiStore = create<UiState>((set) => ({
    sidebarOpen: false,
    sidebarCollapsed: false,
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    toggleCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
