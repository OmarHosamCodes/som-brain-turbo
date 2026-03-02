import { db } from "@som-brain-turbo/db";
import { clients } from "@som-brain-turbo/db/schema/index";
import {
	clientCreateSchema,
	clientUpdateSchema,
	entityArchiveSchema,
	listQuerySchema,
} from "@som-brain-turbo/validators";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { protectedProcedure, router } from "../index";
import { getActiveOrganizationId } from "./_organization";

export const clientsRouter = router({
	list: protectedProcedure
		.input(listQuerySchema.optional())
		.query(async ({ ctx, input }) => {
			const organizationId = await getActiveOrganizationId(ctx);
			const includeArchived = input?.includeArchived ?? false;

			return db
				.select({
					id: clients.id,
					name: clients.name,
					email: clients.email,
					phone: clients.phone,
					address: clients.address,
					hourlyRate: clients.hourlyRate,
					archivedAt: clients.archivedAt,
					createdAt: clients.createdAt,
					updatedAt: clients.updatedAt,
				})
				.from(clients)
				.where(
					includeArchived
						? eq(clients.organizationId, organizationId)
						: and(
								eq(clients.organizationId, organizationId),
								isNull(clients.archivedAt),
							),
				)
				.orderBy(desc(clients.updatedAt));
		}),

	create: protectedProcedure
		.input(clientCreateSchema)
		.mutation(async ({ ctx, input }) => {
			const organizationId = await getActiveOrganizationId(ctx);

			const [createdClient] = await db
				.insert(clients)
				.values({
					name: input.name,
					email: input.email,
					phone: input.phone,
					address: input.address,
					hourlyRate: input.hourlyRate,
					organizationId,
				})
				.returning({ id: clients.id });

			if (!createdClient) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create client.",
				});
			}

			return createdClient;
		}),

	update: protectedProcedure
		.input(clientUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			const organizationId = await getActiveOrganizationId(ctx);

			const [updatedClient] = await db
				.update(clients)
				.set({
					name: input.name,
					email: input.email,
					phone: input.phone,
					address: input.address,
					hourlyRate: input.hourlyRate,
				})
				.where(
					and(
						eq(clients.id, input.id),
						eq(clients.organizationId, organizationId),
					),
				)
				.returning({ id: clients.id });

			if (!updatedClient) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Client not found.",
				});
			}

			return updatedClient;
		}),

	archive: protectedProcedure
		.input(entityArchiveSchema)
		.mutation(async ({ ctx, input }) => {
			const organizationId = await getActiveOrganizationId(ctx);

			const [archivedClient] = await db
				.update(clients)
				.set({ archivedAt: new Date() })
				.where(
					and(
						eq(clients.id, input.id),
						eq(clients.organizationId, organizationId),
						isNull(clients.archivedAt),
					),
				)
				.returning({ id: clients.id });

			if (!archivedClient) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Client not found or already archived.",
				});
			}

			return archivedClient;
		}),

	unarchive: protectedProcedure
		.input(entityArchiveSchema)
		.mutation(async ({ ctx, input }) => {
			const organizationId = await getActiveOrganizationId(ctx);

			const [restoredClient] = await db
				.update(clients)
				.set({ archivedAt: null })
				.where(
					and(
						eq(clients.id, input.id),
						eq(clients.organizationId, organizationId),
					),
				)
				.returning({ id: clients.id });

			if (!restoredClient) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Client not found.",
				});
			}

			return restoredClient;
		}),

	delete: protectedProcedure
		.input(entityArchiveSchema)
		.mutation(async ({ ctx, input }) => {
			const organizationId = await getActiveOrganizationId(ctx);

			const [deletedClient] = await db
				.delete(clients)
				.where(
					and(
						eq(clients.id, input.id),
						eq(clients.organizationId, organizationId),
					),
				)
				.returning({ id: clients.id });

			if (!deletedClient) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Client not found.",
				});
			}

			return deletedClient;
		}),
});
