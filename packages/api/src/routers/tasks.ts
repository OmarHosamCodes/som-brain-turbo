import { db } from "@som-brain-turbo/db";
import { projects, tasks } from "@som-brain-turbo/db/schema/index";
import {
	entityArchiveSchema,
	listQuerySchema,
	taskCreateSchema,
	taskUpdateSchema,
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

async function assertTaskBelongsToOrganization(
	organizationId: number,
	taskId: number,
) {
	const [task] = await db
		.select({ id: tasks.id })
		.from(tasks)
		.innerJoin(projects, eq(tasks.projectId, projects.id))
		.where(
			and(eq(tasks.id, taskId), eq(projects.organizationId, organizationId)),
		)
		.limit(1);

	if (!task) {
		throw new TRPCError({
			code: "NOT_FOUND",
			message: "Task not found.",
		});
	}
}

export const tasksRouter = router({
	list: protectedProcedure
		.input(listQuerySchema.optional())
		.query(async ({ ctx, input }) => {
			const organizationId = await getActiveOrganizationId(ctx);
			const includeArchived = input?.includeArchived ?? false;

			return db
				.select({
					id: tasks.id,
					name: tasks.name,
					description: tasks.description,
					projectId: tasks.projectId,
					projectName: projects.name,
					status: tasks.status,
					priority: tasks.priority,
					estimate: tasks.estimate,
					links: tasks.links,
					completionPercentage: tasks.completionPercentage,
					allowedOvertime: tasks.allowedOvertime,
					unlimitedOvertime: tasks.unlimitedOvertime,
					completedAt: tasks.completedAt,
					archivedAt: tasks.archivedAt,
					createdAt: tasks.createdAt,
					updatedAt: tasks.updatedAt,
				})
				.from(tasks)
				.innerJoin(projects, eq(tasks.projectId, projects.id))
				.where(
					includeArchived
						? eq(projects.organizationId, organizationId)
						: and(
								eq(projects.organizationId, organizationId),
								isNull(tasks.archivedAt),
								isNull(projects.archivedAt),
							),
				)
				.orderBy(desc(tasks.updatedAt));
		}),

	create: protectedProcedure
		.input(taskCreateSchema)
		.mutation(async ({ ctx, input }) => {
			const organizationId = await getActiveOrganizationId(ctx);
			await assertProjectBelongsToOrganization(organizationId, input.projectId);

			const completionPercentage =
				input.status === "complete"
					? Math.max(input.completionPercentage ?? 100, 100)
					: input.completionPercentage;
			const completedAt = input.status === "complete" ? new Date() : null;

			const [createdTask] = await db
				.insert(tasks)
				.values({
					name: input.name,
					description: input.description,
					projectId: input.projectId,
					status: input.status,
					priority: input.priority,
					estimate: input.estimate,
					links: input.links,
					completionPercentage,
					allowedOvertime: input.allowedOvertime,
					unlimitedOvertime: input.unlimitedOvertime,
					completedAt,
					createdById: ctx.session.user.id,
				})
				.returning({ id: tasks.id });

			if (!createdTask) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create task.",
				});
			}

			return createdTask;
		}),

	update: protectedProcedure
		.input(taskUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			const organizationId = await getActiveOrganizationId(ctx);
			await assertTaskBelongsToOrganization(organizationId, input.id);
			await assertProjectBelongsToOrganization(organizationId, input.projectId);

			const completionPercentage =
				input.status === "complete"
					? Math.max(input.completionPercentage ?? 100, 100)
					: input.completionPercentage;
			const completedAt =
				input.status === "complete"
					? new Date()
					: input.completionPercentage === 0
						? null
						: undefined;

			const [updatedTask] = await db
				.update(tasks)
				.set({
					name: input.name,
					description: input.description,
					projectId: input.projectId,
					status: input.status,
					priority: input.priority,
					estimate: input.estimate,
					links: input.links,
					completionPercentage,
					allowedOvertime: input.allowedOvertime,
					unlimitedOvertime: input.unlimitedOvertime,
					completedAt,
				})
				.where(eq(tasks.id, input.id))
				.returning({ id: tasks.id });

			if (!updatedTask) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Task not found.",
				});
			}

			return updatedTask;
		}),

	archive: protectedProcedure
		.input(entityArchiveSchema)
		.mutation(async ({ ctx, input }) => {
			const organizationId = await getActiveOrganizationId(ctx);
			await assertTaskBelongsToOrganization(organizationId, input.id);

			const [archivedTask] = await db
				.update(tasks)
				.set({ archivedAt: new Date() })
				.where(and(eq(tasks.id, input.id), isNull(tasks.archivedAt)))
				.returning({ id: tasks.id });

			if (!archivedTask) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Task not found or already archived.",
				});
			}

			return archivedTask;
		}),

	unarchive: protectedProcedure
		.input(entityArchiveSchema)
		.mutation(async ({ ctx, input }) => {
			const organizationId = await getActiveOrganizationId(ctx);
			await assertTaskBelongsToOrganization(organizationId, input.id);

			const [restoredTask] = await db
				.update(tasks)
				.set({ archivedAt: null })
				.where(eq(tasks.id, input.id))
				.returning({ id: tasks.id });

			if (!restoredTask) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Task not found.",
				});
			}

			return restoredTask;
		}),

	delete: protectedProcedure
		.input(entityArchiveSchema)
		.mutation(async ({ ctx, input }) => {
			const organizationId = await getActiveOrganizationId(ctx);
			await assertTaskBelongsToOrganization(organizationId, input.id);

			const [deletedTask] = await db
				.delete(tasks)
				.where(eq(tasks.id, input.id))
				.returning({ id: tasks.id });

			if (!deletedTask) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Task not found.",
				});
			}

			return deletedTask;
		}),
});
