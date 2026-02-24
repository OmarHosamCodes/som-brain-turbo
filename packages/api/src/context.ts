import { auth } from "@som-brain-turbo/auth";
import type { NextRequest } from "next/server";

export async function createContext(req: NextRequest) {
	const session = await auth.api.getSession({
		headers: req.headers,
	});
	const activeOrganizationIdHeader = req.headers.get("x-org-id");
	const parsedActiveOrganizationId = activeOrganizationIdHeader
		? Number.parseInt(activeOrganizationIdHeader, 10)
		: Number.NaN;
	const activeOrganizationId =
		Number.isInteger(parsedActiveOrganizationId) &&
		parsedActiveOrganizationId > 0
			? parsedActiveOrganizationId
			: null;

	return {
		session,
		activeOrganizationId,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
