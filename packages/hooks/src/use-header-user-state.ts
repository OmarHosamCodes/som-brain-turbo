"use client";

import { useRouter } from "next/navigation";
import { authClient } from "./auth-client";

export function useHeaderUserState() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const userEmail = session?.user.email ?? "";
	const userName = session?.user.name?.trim() || userEmail || "User";
	const userInitial = userName.charAt(0).toUpperCase();

	const signOut = async () => {
		await authClient.signOut();
		router.push("/auth");
	};

	return {
		isPending,
		userEmail,
		userName,
		userInitial,
		signOut,
	} as const;
}
