"use client";

import {
	type AuthFormMode,
	useAuthFormMode,
	useAuthFormModeActions,
} from "@som-brain-turbo/state";

export function useAuthFormModeState() {
	const authFormMode = useAuthFormMode();
	const actions = useAuthFormModeActions();

	return {
		authFormMode,
		isSignInMode: authFormMode === "sign-in",
		isSignUpMode: authFormMode === "sign-up",
		setAuthFormMode: actions.setAuthFormMode,
		toggleAuthFormMode: actions.toggleAuthFormMode,
		showSignInForm: () => actions.setAuthFormMode("sign-in"),
		showSignUpForm: () => actions.setAuthFormMode("sign-up"),
	} as const;
}

export function useSetAuthFormMode() {
	return useAuthFormModeActions().setAuthFormMode;
}

export type { AuthFormMode };
