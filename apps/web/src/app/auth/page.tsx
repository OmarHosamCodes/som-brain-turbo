"use client";

import { useAuthFormModeState } from "@som-brain-turbo/hooks";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export default function AuthPage() {
	const { isSignInMode, showSignInForm, showSignUpForm } =
		useAuthFormModeState();

	return isSignInMode ? (
		<SignInForm onSwitchToSignUp={showSignUpForm} />
	) : (
		<SignUpForm onSwitchToSignIn={showSignInForm} />
	);
}
