"use client";

import { authClient } from "./auth-client";

export function useAuthSession() {
  return authClient.useSession();
}
