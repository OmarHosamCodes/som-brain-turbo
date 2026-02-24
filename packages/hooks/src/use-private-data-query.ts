"use client";

import { useQuery } from "@tanstack/react-query";
import { trpc } from "./trpc-client";

export function usePrivateDataQuery() {
  return useQuery(trpc.privateData.queryOptions());
}
