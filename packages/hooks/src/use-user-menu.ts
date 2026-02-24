"use client";

import { useRouter } from "next/navigation";
import { authClient } from "./auth-client";

export function useUserMenuState() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const signOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  return {
    session,
    isPending,
    signOut,
  } as const;
}
