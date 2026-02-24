import { db } from "@som-brain-turbo/db";
import {
	organizationMembers,
	organizations,
} from "@som-brain-turbo/db/schema/index";
import { asc, eq } from "drizzle-orm";
import { protectedProcedure, router } from "../index";

export const workspaceRouter = router({
	organizations: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		return db
			.select({
				id: organizations.id,
				name: organizations.name,
				slug: organizations.slug,
			})
			.from(organizationMembers)
			.innerJoin(
				organizations,
				eq(organizationMembers.organizationId, organizations.id),
			)
			.where(eq(organizationMembers.userId, userId))
			.orderBy(asc(organizations.name));
	}),
});
