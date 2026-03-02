import { db } from "@som-brain-turbo/db";
import {
	mbTickets,
	projects,
	sprints,
	sprintTasks,
	tasks,
	timeEntries,
} from "@som-brain-turbo/db/schema/index";
import { resolveOrganizationIdForUser } from "@som-brain-turbo/db/workspace-provisioning";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

export type TrackerTargetType = "task" | "sprintStep" | "ticket";

export interface TrackerTarget {
	key: string;
	type: TrackerTargetType;
	title: string;
	projectName: string | null;
}

interface TimeEntryRow {
	id: number;
	shortDescription: string | null;
	longDescription: string | null;
	isBillable: boolean;
	startTime: Date;
	endTime: Date | null;
	taskId: number | null;
	sprintId: number | null;
	mbTicketId: number | null;
}

function parseTargetKey(
	targetKey: string,
):
	| { type: "task"; taskId: number }
	| { type: "ticket"; ticketId: number }
	| { type: "sprintStep"; sprintId: number; taskId: number }
	| null {
	const taskMatch = targetKey.match(/^task:(\d+)$/);
	if (taskMatch?.[1]) {
		return {
			type: "task",
			taskId: Number.parseInt(taskMatch[1], 10),
		};
	}

	const ticketMatch = targetKey.match(/^ticket:(\d+)$/);
	if (ticketMatch?.[1]) {
		return {
			type: "ticket",
			ticketId: Number.parseInt(ticketMatch[1], 10),
		};
	}

	const sprintStepMatch = targetKey.match(/^sprintStep:(\d+):(\d+)$/);
	if (sprintStepMatch?.[1] && sprintStepMatch[2]) {
		return {
			type: "sprintStep",
			sprintId: Number.parseInt(sprintStepMatch[1], 10),
			taskId: Number.parseInt(sprintStepMatch[2], 10),
		};
	}

	return null;
}

function getEntryDescription(entry: {
	shortDescription: string | null;
	longDescription: string | null;
}) {
	const shortDescription = entry.shortDescription?.trim();
	if (shortDescription) {
		return shortDescription;
	}

	const longDescription = entry.longDescription?.trim();
	if (longDescription) {
		return longDescription;
	}

	return "Untitled entry";
}

function getTargetKey(entry: {
	taskId: number | null;
	sprintId: number | null;
	mbTicketId: number | null;
}) {
	if (entry.mbTicketId !== null) {
		return `ticket:${entry.mbTicketId}`;
	}

	if (entry.sprintId !== null && entry.taskId !== null) {
		return `sprintStep:${entry.sprintId}:${entry.taskId}`;
	}

	if (entry.taskId !== null) {
		return `task:${entry.taskId}`;
	}

	return null;
}

function getTargetTypeFromKey(
	targetKey: string | null,
): TrackerTargetType | null {
	if (!targetKey) {
		return null;
	}

	if (targetKey.startsWith("task:")) {
		return "task";
	}

	if (targetKey.startsWith("sprintStep:")) {
		return "sprintStep";
	}

	if (targetKey.startsWith("ticket:")) {
		return "ticket";
	}

	return null;
}

const timeEntrySelect = {
	id: timeEntries.id,
	shortDescription: timeEntries.shortDescription,
	longDescription: timeEntries.longDescription,
	isBillable: timeEntries.isBillable,
	startTime: timeEntries.startTime,
	endTime: timeEntries.endTime,
	taskId: timeEntries.taskId,
	sprintId: timeEntries.sprintId,
	mbTicketId: timeEntries.mbTicketId,
};

export const timeTrackerRouter = router({
	dashboardData: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;
		const organizationId = await resolveOrganizationIdForUser({
			userId,
			userName: ctx.session.user.name,
			requestedOrganizationId: ctx.activeOrganizationId,
		});

		const [taskRows, sprintStepRows, ticketRows, activeRows, completedRows] =
			await Promise.all([
				db
					.select({
						id: tasks.id,
						title: tasks.name,
						projectName: projects.name,
					})
					.from(tasks)
					.innerJoin(projects, eq(tasks.projectId, projects.id))
					.where(
						and(
							eq(projects.organizationId, organizationId),
							isNull(tasks.archivedAt),
							isNull(projects.archivedAt),
						),
					)
					.orderBy(desc(tasks.updatedAt))
					.limit(300),
				db
					.select({
						sprintId: sprints.id,
						sprintName: sprints.name,
						taskId: tasks.id,
						taskName: tasks.name,
						projectName: projects.name,
					})
					.from(sprintTasks)
					.innerJoin(sprints, eq(sprintTasks.sprintId, sprints.id))
					.innerJoin(tasks, eq(sprintTasks.taskId, tasks.id))
					.innerJoin(projects, eq(sprints.projectId, projects.id))
					.where(
						and(
							eq(sprints.organizationId, organizationId),
							isNull(sprints.archivedAt),
							isNull(tasks.archivedAt),
							isNull(projects.archivedAt),
						),
					)
					.orderBy(desc(sprints.updatedAt), desc(sprintTasks.id))
					.limit(300),
				db
					.select({
						id: mbTickets.id,
						title: mbTickets.title,
						projectName: projects.name,
					})
					.from(mbTickets)
					.leftJoin(projects, eq(mbTickets.projectId, projects.id))
					.where(
						and(
							eq(mbTickets.organizationId, organizationId),
							isNull(mbTickets.archivedAt),
						),
					)
					.orderBy(desc(mbTickets.updatedAt))
					.limit(300),
				db
					.select(timeEntrySelect)
					.from(timeEntries)
					.where(
						and(
							eq(timeEntries.userId, userId),
							eq(timeEntries.organizationId, organizationId),
							isNull(timeEntries.endTime),
						),
					)
					.orderBy(desc(timeEntries.startTime))
					.limit(1),
				db
					.select(timeEntrySelect)
					.from(timeEntries)
					.where(
						and(
							eq(timeEntries.userId, userId),
							eq(timeEntries.organizationId, organizationId),
							isNotNull(timeEntries.endTime),
						),
					)
					.orderBy(desc(timeEntries.startTime))
					.limit(200),
			]);

		const targets: TrackerTarget[] = [
			...taskRows.map((taskRow) => ({
				key: `task:${taskRow.id}`,
				type: "task" as const,
				title: taskRow.title,
				projectName: taskRow.projectName,
			})),
			...sprintStepRows.map((sprintStepRow) => ({
				key: `sprintStep:${sprintStepRow.sprintId}:${sprintStepRow.taskId}`,
				type: "sprintStep" as const,
				title: `${sprintStepRow.sprintName}: ${sprintStepRow.taskName}`,
				projectName: sprintStepRow.projectName,
			})),
			...ticketRows.map((ticketRow) => ({
				key: `ticket:${ticketRow.id}`,
				type: "ticket" as const,
				title: ticketRow.title,
				projectName: ticketRow.projectName,
			})),
		];

		const targetByKey = new Map(targets.map((target) => [target.key, target]));

		const activeEntryRow = activeRows[0] as TimeEntryRow | undefined;
		const activeEntry = activeEntryRow
			? (() => {
					const targetKey = getTargetKey(activeEntryRow);
					const target = targetKey ? targetByKey.get(targetKey) : null;

					return {
						id: activeEntryRow.id,
						description: getEntryDescription(activeEntryRow),
						targetKey,
						targetType: target?.type ?? getTargetTypeFromKey(targetKey),
						targetTitle: target?.title ?? null,
						projectName: target?.projectName ?? null,
						isBillable: activeEntryRow.isBillable,
						startTime: activeEntryRow.startTime.toISOString(),
					};
				})()
			: null;

		const entries = (completedRows as TimeEntryRow[]).map((entryRow) => {
			const targetKey = getTargetKey(entryRow);
			const target = targetKey ? targetByKey.get(targetKey) : null;
			const endTime = entryRow.endTime ?? entryRow.startTime;
			const durationMinutes = Math.max(
				1,
				Math.round((endTime.getTime() - entryRow.startTime.getTime()) / 60000),
			);

			return {
				id: entryRow.id,
				description: getEntryDescription(entryRow),
				targetKey,
				targetType: target?.type ?? getTargetTypeFromKey(targetKey),
				targetTitle: target?.title ?? null,
				projectName: target?.projectName ?? null,
				isBillable: entryRow.isBillable,
				startTime: entryRow.startTime.toISOString(),
				endTime: endTime.toISOString(),
				durationMinutes,
			};
		});

		return {
			targets,
			activeEntry,
			entries,
		};
	}),

	startTimer: protectedProcedure
		.input(
			z.object({
				description: z.string().trim().min(1).max(256),
				targetKey: z.string().min(1),
				isBillable: z.boolean(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const organizationId = await resolveOrganizationIdForUser({
				userId,
				userName: ctx.session.user.name,
				requestedOrganizationId: ctx.activeOrganizationId,
			});

			const [runningEntry] = await db
				.select({ id: timeEntries.id })
				.from(timeEntries)
				.where(
					and(
						eq(timeEntries.userId, userId),
						eq(timeEntries.organizationId, organizationId),
						isNull(timeEntries.endTime),
					),
				)
				.limit(1);

			if (runningEntry) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "A timer is already running.",
				});
			}

			const parsedTarget = parseTargetKey(input.targetKey);
			if (!parsedTarget) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Invalid target.",
				});
			}

			const now = new Date();

			if (parsedTarget.type === "task") {
				const [taskTarget] = await db
					.select({
						taskId: tasks.id,
						projectId: tasks.projectId,
					})
					.from(tasks)
					.innerJoin(projects, eq(tasks.projectId, projects.id))
					.where(
						and(
							eq(tasks.id, parsedTarget.taskId),
							eq(projects.organizationId, organizationId),
							isNull(tasks.archivedAt),
							isNull(projects.archivedAt),
						),
					)
					.limit(1);

				if (!taskTarget) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Selected task was not found.",
					});
				}

				const [createdEntry] = await db
					.insert(timeEntries)
					.values({
						shortDescription: input.description,
						startTime: now,
						userId,
						organizationId,
						taskId: taskTarget.taskId,
						projectId: taskTarget.projectId,
						isBillable: input.isBillable,
					})
					.returning({ id: timeEntries.id });

				return { id: createdEntry?.id ?? null };
			}

			if (parsedTarget.type === "ticket") {
				const [ticketTarget] = await db
					.select({
						ticketId: mbTickets.id,
						projectId: mbTickets.projectId,
					})
					.from(mbTickets)
					.where(
						and(
							eq(mbTickets.id, parsedTarget.ticketId),
							eq(mbTickets.organizationId, organizationId),
							isNull(mbTickets.archivedAt),
						),
					)
					.limit(1);

				if (!ticketTarget) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Selected ticket was not found.",
					});
				}

				const [createdEntry] = await db
					.insert(timeEntries)
					.values({
						shortDescription: input.description,
						startTime: now,
						userId,
						organizationId,
						mbTicketId: ticketTarget.ticketId,
						projectId: ticketTarget.projectId,
						isBillable: input.isBillable,
					})
					.returning({ id: timeEntries.id });

				return { id: createdEntry?.id ?? null };
			}

			const [sprintStepTarget] = await db
				.select({
					sprintId: sprints.id,
					taskId: tasks.id,
					projectId: projects.id,
				})
				.from(sprintTasks)
				.innerJoin(sprints, eq(sprintTasks.sprintId, sprints.id))
				.innerJoin(tasks, eq(sprintTasks.taskId, tasks.id))
				.innerJoin(projects, eq(sprints.projectId, projects.id))
				.where(
					and(
						eq(sprintTasks.sprintId, parsedTarget.sprintId),
						eq(sprintTasks.taskId, parsedTarget.taskId),
						eq(sprints.organizationId, organizationId),
						isNull(sprints.archivedAt),
						isNull(tasks.archivedAt),
						isNull(projects.archivedAt),
					),
				)
				.limit(1);

			if (!sprintStepTarget) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Selected sprint step was not found.",
				});
			}

			const [createdEntry] = await db
				.insert(timeEntries)
				.values({
					shortDescription: input.description,
					startTime: now,
					userId,
					organizationId,
					sprintId: sprintStepTarget.sprintId,
					taskId: sprintStepTarget.taskId,
					projectId: sprintStepTarget.projectId,
					isBillable: input.isBillable,
				})
				.returning({ id: timeEntries.id });

			return { id: createdEntry?.id ?? null };
		}),

	stopTimer: protectedProcedure.mutation(async ({ ctx }) => {
		const userId = ctx.session.user.id;
		const organizationId = await resolveOrganizationIdForUser({
			userId,
			userName: ctx.session.user.name,
			requestedOrganizationId: ctx.activeOrganizationId,
		});

		const [runningEntry] = await db
			.select({ id: timeEntries.id })
			.from(timeEntries)
			.where(
				and(
					eq(timeEntries.userId, userId),
					eq(timeEntries.organizationId, organizationId),
					isNull(timeEntries.endTime),
				),
			)
			.orderBy(desc(timeEntries.startTime))
			.limit(1);

		if (!runningEntry) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "No active timer found.",
			});
		}

		await db
			.update(timeEntries)
			.set({ endTime: new Date() })
			.where(
				and(
					eq(timeEntries.id, runningEntry.id),
					eq(timeEntries.userId, userId),
					eq(timeEntries.organizationId, organizationId),
					isNull(timeEntries.endTime),
				),
			);

		return { id: runningEntry.id };
	}),

	discardTimer: protectedProcedure.mutation(async ({ ctx }) => {
		const userId = ctx.session.user.id;
		const organizationId = await resolveOrganizationIdForUser({
			userId,
			userName: ctx.session.user.name,
			requestedOrganizationId: ctx.activeOrganizationId,
		});

		const [runningEntry] = await db
			.select({ id: timeEntries.id })
			.from(timeEntries)
			.where(
				and(
					eq(timeEntries.userId, userId),
					eq(timeEntries.organizationId, organizationId),
					isNull(timeEntries.endTime),
				),
			)
			.orderBy(desc(timeEntries.startTime))
			.limit(1);

		if (!runningEntry) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "No active timer found.",
			});
		}

		await db
			.delete(timeEntries)
			.where(
				and(
					eq(timeEntries.id, runningEntry.id),
					eq(timeEntries.userId, userId),
					eq(timeEntries.organizationId, organizationId),
					isNull(timeEntries.endTime),
				),
			);

		return { id: runningEntry.id };
	}),
});
