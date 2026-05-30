import { create } from "zustand";

export const useAuth = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,

  setUser: (user) => {
    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    set({ user });
  },

  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    set({ user: null });
  },
}));