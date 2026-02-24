"use client";

import type { AppRouter } from "@som-brain-turbo/api/routers/index";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error, query) => {
			toast.error(error.message, {
				action: {
					label: "retry",
					onClick: query.invalidate,
				},
			});
		},
	}),
});

const trpcClient = createTRPCClient<AppRouter>({
	links: [
		httpBatchLink({
			url: "/api/trpc",
			fetch(url, options) {
				const headers = new Headers(options?.headers);
				const activeOrgId =
					typeof window !== "undefined"
						? window.localStorage.getItem("active-org-id")
						: null;

				if (activeOrgId) {
					headers.set("x-org-id", activeOrgId);
				}

				return fetch(url, {
					...options,
					headers,
					credentials: "include",
				});
			},
		}),
	],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client: trpcClient,
	queryClient,
});
