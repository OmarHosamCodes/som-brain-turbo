import type { StateCreator } from "zustand";
import type { AppStateStore } from "../store";

export const AUTH_FORM_MODES = ["sign-in", "sign-up"] as const;

export type AuthFormMode = (typeof AUTH_FORM_MODES)[number];

export interface AuthFormSlice {
  authFormMode: AuthFormMode;
  setAuthFormMode: (mode: AuthFormMode) => void;
  toggleAuthFormMode: () => void;
}

export const createAuthFormSlice: StateCreator<
  AppStateStore,
  [],
  [],
  AuthFormSlice
> = (set) => ({
  authFormMode: "sign-up",
  setAuthFormMode: (mode) => {
    set({ authFormMode: mode });
  },
  toggleAuthFormMode: () => {
    set((state) => ({
      authFormMode: state.authFormMode === "sign-in" ? "sign-up" : "sign-in",
    }));
  },
});
