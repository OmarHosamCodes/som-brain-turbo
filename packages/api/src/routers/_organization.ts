import { resolveOrganizationIdForUser } from "@som-brain-turbo/db/workspace-provisioning";

interface OrganizationContext {
	session: {
		user: {
			id: string;
			name?: string | null;
		};
	};
	activeOrganizationId: number | null;
}

export async function getActiveOrganizationId(ctx: OrganizationContext) {
	return resolveOrganizationIdForUser({
		userId: ctx.session.user.id,
		userName: ctx.session.user.name,
		requestedOrganizationId: ctx.activeOrganizationId,
	});
}
