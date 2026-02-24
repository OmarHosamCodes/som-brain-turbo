"use client";

import { useAuthFormModeState } from "@som-brain-turbo/hooks";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export default function AuthPage() {
	const { isSignInMode } = useAuthFormModeState();

	return isSignInMode ? <SignInForm /> : <SignUpForm />;
}
