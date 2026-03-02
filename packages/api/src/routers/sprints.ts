import { db } from "@som-brain-turbo/db";
import { projects, sprints } from "@som-brain-turbo/db/schema/index";
import {
	entityArchiveSchema,
	listQuerySchema,
	sprintCreateSchema,
	sprintUpdateSchema,
} from "@som-brain-turbo/validators";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { protectedProcedure, router } from "../index";
import { getActiveOrganizationId } from "./_organization";

async function assertProjectBelongsToOrganization(
	organizationId: number,
	projectId: number,
) {
	const [project] = await db
		.select({ id: projects.id })
		.from(projects)
		.where(
			and(
				eq(projects.id, projectId),
				eq(projects.organizationId, organizationId),
				isNull(projects.archivedAt),
			),
		)
		.limit(1);

	if (!project) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Selected project was not found.",
		});
	}
}

async function getSprintForOrganization(
	organizationId: number,
	sprintId: number,
) {
	const [sprint] = await db
		.select({
			id: sprints.id,
			startedAt: sprints.startedAt,
			completedAt: sprints.completedAt,
		})
		.from(sprints)
		.where(
			and(eq(sprints.id, sprintId), eq(sprints.organizationId, organizationId)),
		)
		.limit(1);

	if (!sprint) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Sprint not found.",
		});
	}

	return sprint;
}

function getSprintTimestamps(status: "draft" | "active" | "completed") {
	const now = new Date();

	if (status === "draft") {
		return {
			startedAt: null as Date | null,
			completedAt: null as Date | null,
		};
	}

	if (status === "active") {
		return {
			startedAt: now,
			completedAt: null as Date | null,
		};
	}

	return {
		startedAt: now,
		completedAt: now,
	};
}

export const sprintsRouter = router({
	list: protectedProcedure
		.input(listQuerySchema.optional())
		.query(async ({ ctx, input }) => {
			const organizationId = await getActiveOrganizationId(ctx);
			const includeArchived = input?.includeArchived ?? false;

			return db
				.select({
					id: sprints.id,
					name: sprints.name,
					description: sprints.description,
					projectId: sprints.projectId,
					projectName: projects.name,
					status: sprints.status,
					startedAt: sprints.startedAt,
					completedAt: sprints.completedAt,
					archivedAt: sprints.archivedAt,
					createdAt: sprints.createdAt,
					updatedAt: sprints.updatedAt,
				})
				.from(sprints)
				.innerJoin(projects, eq(sprints.projectId, projects.id))
				.where(
					includeArchived
						? eq(sprints.organizationId, organizationId)
						: and(
								eq(sprints.organizationId, organizationId),
								isNull(sprints.archivedAt),
								isNull(projects.archivedAt),
							),
				)
				.orderBy(desc(sprints.updatedAt));
		}),

	create: protectedProcedure
		.input(sprintCreateSchema)
		.mutation(async ({ ctx, input }) => {
			const organizationId = await getActiveOrganizationId(ctx);
			await assertProjectBelongsToOrganization(organizationId, input.projectId);

			const timestamps = getSprintTimestamps(input.status);
			const [createdSprint] = await db
				.insert(sprints)
				.values({
					name: input.name,
					description: input.description,
					projectId: input.projectId,
					organizationId,
					status: input.status,
					startedAt: timestamps.startedAt,
					completedAt: timestamps.completedAt,
					createdById: ctx.session.user.id,
				})
				.returning({ id: sprints.id });

			if (!createdSprint) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create sprint.",
				});
			}

			return createdSprint;
		}),

	update: protectedProcedure
		.input(sprintUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			const organizationId = await getActiveOrganizationId(ctx);
			const existingSprint = await getSprintForOrganization(
				organizationId,
				input.id,
			);
			await assertProjectBelongsToOrganization(organizationId, input.projectId);

			const now = new Date();
			const startedAt =
				input.status === "draft" ? null : (existingSprint.startedAt ?? now);
			const completedAt = input.status === "completed" ? now : null;

			const [updatedSprint] = await db
				.update(sprints)
				.set({
					name: input.name,
					description: input.description,
					projectId: input.projectId,
					status: input.status,
					startedAt,
					completedAt,
				})
				.where(eq(sprints.id, existingSprint.id))
				.returning({ id: sprints.id });

			if (!updatedSprint) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Sprint not found.",
				});
			}

			return updatedSprint;
		}),

	archive: protectedProcedure
		.input(entityArchiveSchema)
		.mutation(async ({ ctx, input }) => {
			const organizationId = await getActiveOrganizationId(ctx);
			await getSprintForOrganization(organizationId, input.id);

			const [archivedSprint] = await db
				.update(sprints)
				.set({ archivedAt: new Date() })
				.where(and(eq(sprints.id, input.id), isNull(sprints.archivedAt)))
				.returning({ id: sprints.id });

			if (!archivedSprint) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Sprint not found or already archived.",
				});
			}

			return archivedSprint;
		}),

	unarchive: protectedProcedure
		.input(entityArchiveSchema)
		.mutation(async ({ ctx, input }) => {
			const organizationId = await getActiveOrganizationId(ctx);
			await getSprintForOrganization(organizationId, input.id);

			const [restoredSprint] = await db
				.update(sprints)
				.set({ archivedAt: null })
				.where(eq(sprints.id, input.id))
				.returning({ id: sprints.id });

			if (!restoredSprint) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Sprint not found.",
				});
			}

			return restoredSprint;
		}),

	delete: protectedProcedure
		.input(entityArchiveSchema)
		.mutation(async ({ ctx, input }) => {
			const organizationId = await getActiveOrganizationId(ctx);
			await getSprintForOrganization(organizationId, input.id);

			const [deletedSprint] = await db
				.delete(sprints)
				.where(eq(sprints.id, input.id))
				.returning({ id: sprints.id });

			if (!deletedSprint) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Sprint not found.",
				});
			}

			return deletedSprint;
		}),
});
