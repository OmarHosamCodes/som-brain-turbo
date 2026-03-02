import { db } from "@som-brain-turbo/db";
import {
	organizationMembers,
	organizations,
	user,
} from "@som-brain-turbo/db/schema/index";
import { ensureOwnedWorkspaceForUser } from "@som-brain-turbo/db/workspace-provisioning";
import { workspaceInviteByEmailSchema } from "@som-brain-turbo/validators";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, ilike } from "drizzle-orm";
import { protectedProcedure, router } from "../index";
import { getActiveOrganizationId } from "./_organization";

function isUniqueConstraintError(error: unknown) {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		(error as { code?: string }).code === "23505"
	);
}

export const workspaceRouter = router({
	organizations: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;
		await ensureOwnedWorkspaceForUser({
			userId,
			userName: ctx.session.user.name,
		});

		return db
			.select({
				id: organizations.id,
				name: organizations.name,
				slug: organizations.slug,
				role: organizationMembers.role,
				isOwner: eq(organizationMembers.role, "owner"),
			})
			.from(organizationMembers)
			.innerJoin(
				organizations,
				eq(organizationMembers.organizationId, organizations.id),
			)
			.where(eq(organizationMembers.userId, userId))
			.orderBy(asc(organizations.name));
	}),

	members: protectedProcedure.query(async ({ ctx }) => {
		const organizationId = await getActiveOrganizationId(ctx);

		return db
			.select({
				id: organizationMembers.id,
				userId: organizationMembers.userId,
				name: user.name,
				email: user.email,
				role: organizationMembers.role,
				subType: organizationMembers.subType,
				createdAt: organizationMembers.createdAt,
			})
			.from(organizationMembers)
			.innerJoin(user, eq(organizationMembers.userId, user.id))
			.where(eq(organizationMembers.organizationId, organizationId))
			.orderBy(asc(organizationMembers.createdAt));
	}),

	inviteByEmail: protectedProcedure
		.input(workspaceInviteByEmailSchema)
		.mutation(async ({ ctx, input }) => {
			const organizationId = await getActiveOrganizationId(ctx);
			const actorUserId = ctx.session.user.id;
			const normalizedEmail = input.email.trim().toLowerCase();

			const [actorMembership] = await db
				.select({ role: organizationMembers.role })
				.from(organizationMembers)
				.where(
					and(
						eq(organizationMembers.organizationId, organizationId),
						eq(organizationMembers.userId, actorUserId),
					),
				)
				.limit(1);

			if (!actorMembership) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You are not a member of this workspace.",
				});
			}

			if (
				actorMembership.role !== "owner" &&
				actorMembership.role !== "admin"
			) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only owners and admins can invite members.",
				});
			}

			const [targetUser] = await db
				.select({
					id: user.id,
					email: user.email,
				})
				.from(user)
				.where(ilike(user.email, normalizedEmail))
				.limit(1);

			if (!targetUser) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "No user found with this email.",
				});
			}

			if (targetUser.id === actorUserId) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "You are already in this workspace.",
				});
			}

			try {
				const [createdMembership] = await db
					.insert(organizationMembers)
					.values({
						userId: targetUser.id,
						organizationId,
						role: "member",
					})
					.returning({ id: organizationMembers.id });

				if (!createdMembership) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Failed to add user to workspace.",
					});
				}

				return createdMembership;
			} catch (error) {
				if (isUniqueConstraintError(error)) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "User is already a member of this workspace.",
					});
				}

				throw error;
			}
		}),
});
