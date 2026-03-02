import { db } from "@som-brain-turbo/db";
import { clients, projects } from "@som-brain-turbo/db/schema/index";
import {
	entityArchiveSchema,
	listQuerySchema,
	projectCreateSchema,
	projectUpdateSchema,
} from "@som-brain-turbo/validators";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { protectedProcedure, router } from "../index";
import { getActiveOrganizationId } from "./_organization";

async function assertClientBelongsToOrganization(
	organizationId: number,
	clientId: number,
) {
	const [client] = await db
		.select({ id: clients.id })
		.from(clients)
		.where(
			and(
				eq(clients.id, clientId),
				eq(clients.organizationId, organizationId),
				isNull(clients.archivedAt),
			),
		)
		.limit(1);

	if (!client) {
		throw new TRPCError({
			code: "BAD_REQUEST",
			message: "Selected client was not found.",
		});
	}
}

export const projectsRouter = router({
	list: protectedProcedure
		.input(listQuerySchema.optional())
		.query(async ({ ctx, input }) => {
			const organizationId = await getActiveOrganizationId(ctx);
			const includeArchived = input?.includeArchived ?? false;

			return db
				.select({
					id: projects.id,
					name: projects.name,
					color: projects.color,
					isBillable: projects.isBillable,
					hourlyRate: projects.hourlyRate,
					clientId: projects.clientId,
					clientName: clients.name,
					archivedAt: projects.archivedAt,
					createdAt: projects.createdAt,
					updatedAt: projects.updatedAt,
				})
				.from(projects)
				.leftJoin(clients, eq(projects.clientId, clients.id))
				.where(
					includeArchived
						? eq(projects.organizationId, organizationId)
						: and(
								eq(projects.organizationId, organizationId),
								isNull(projects.archivedAt),
							),
				)
				.orderBy(desc(projects.updatedAt));
		}),

	create: protectedProcedure
		.input(projectCreateSchema)
		.mutation(async ({ ctx, input }) => {
			const organizationId = await getActiveOrganizationId(ctx);

			if (input.clientId) {
				await assertClientBelongsToOrganization(organizationId, input.clientId);
			}

			const [createdProject] = await db
				.insert(projects)
				.values({
					name: input.name,
					color: input.color,
					isBillable: input.isBillable,
					hourlyRate: input.hourlyRate,
					clientId: input.clientId,
					organizationId,
				})
				.returning({ id: projects.id });

			if (!createdProject) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create project.",
				});
			}

			return createdProject;
		}),

	update: protectedProcedure
		.input(projectUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			const organizationId = await getActiveOrganizationId(ctx);

			if (input.clientId) {
				await assertClientBelongsToOrganization(organizationId, input.clientId);
			}

			const [updatedProject] = await db
				.update(projects)
				.set({
					name: input.name,
					color: input.color,
					isBillable: input.isBillable,
					hourlyRate: input.hourlyRate,
					clientId: input.clientId,
				})
				.where(
					and(
						eq(projects.id, input.id),
						eq(projects.organizationId, organizationId),
					),
				)
				.returning({ id: projects.id });

			if (!updatedProject) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found.",
				});
			}

			return updatedProject;
		}),

	archive: protectedProcedure
		.input(entityArchiveSchema)
		.mutation(async ({ ctx, input }) => {
			const organizationId = await getActiveOrganizationId(ctx);

			const [archivedProject] = await db
				.update(projects)
				.set({ archivedAt: new Date() })
				.where(
					and(
						eq(projects.id, input.id),
						eq(projects.organizationId, organizationId),
						isNull(projects.archivedAt),
					),
				)
				.returning({ id: projects.id });

			if (!archivedProject) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found or already archived.",
				});
			}

			return archivedProject;
		}),

	unarchive: protectedProcedure
		.input(entityArchiveSchema)
		.mutation(async ({ ctx, input }) => {
			const organizationId = await getActiveOrganizationId(ctx);

			const [restoredProject] = await db
				.update(projects)
				.set({ archivedAt: null })
				.where(
					and(
						eq(projects.id, input.id),
						eq(projects.organizationId, organizationId),
					),
				)
				.returning({ id: projects.id });

			if (!restoredProject) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found.",
				});
			}

			return restoredProject;
		}),

	delete: protectedProcedure
		.input(entityArchiveSchema)
		.mutation(async ({ ctx, input }) => {
			const organizationId = await getActiveOrganizationId(ctx);

			const [deletedProject] = await db
				.delete(projects)
				.where(
					and(
						eq(projects.id, input.id),
						eq(projects.organizationId, organizationId),
					),
				)
				.returning({ id: projects.id });

			if (!deletedProject) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found.",
				});
			}

			return deletedProject;
		}),
});
