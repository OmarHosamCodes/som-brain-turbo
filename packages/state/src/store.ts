"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import {
	type AuthFormMode,
	type AuthFormSlice,
	createAuthFormSlice,
} from "./slices/auth-form-slice";

export type AppStateStore = AuthFormSlice;

export const useAppStateStore = create<AppStateStore>()((...args) => ({
	...createAuthFormSlice(...args),
}));

export const useAuthFormMode = (): AuthFormMode =>
	useAppStateStore((state) => state.authFormMode);

export const useAuthFormModeActions = () =>
	useAppStateStore(
		useShallow((state) => ({
			setAuthFormMode: state.setAuthFormMode,
			toggleAuthFormMode: state.toggleAuthFormMode,
		})),
	);
