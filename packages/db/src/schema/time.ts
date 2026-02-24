import { sql } from "drizzle-orm";
import { type AnyPgColumn, index, uniqueIndex } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { createTable } from "./base";
import { projects } from "./client-project";
import { mbTicketStatusEnum } from "./enums";
import { mbTickets } from "./mb";
import { organizations } from "./organization";
import { sprints } from "./sprint";
import { tasks } from "./work";

export const timeEntries = createTable(
	"time_entry",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		shortDescription: d.varchar({ length: 256 }),
		longDescription: d.text(),
		startTime: d.timestamp({ withTimezone: true }).notNull(),
		endTime: d.timestamp({ withTimezone: true }),
		userId: d
			.text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		taskId: d.integer().references(() => tasks.id, { onDelete: "set null" }),
		projectId: d
			.integer()
			.references(() => projects.id, { onDelete: "set null" }),
		sprintId: d
			.integer()
			.references(() => sprints.id, { onDelete: "set null" }),
		organizationId: d
			.integer()
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		reviewerId: d.text().references(() => user.id, { onDelete: "set null" }),
		mbTicketId: d
			.integer()
			.references(() => mbTickets.id, { onDelete: "set null" }),
		mbTicketStatus: mbTicketStatusEnum(),
		isBillable: d.boolean().default(false).notNull(),
		approvedAt: d.timestamp({ withTimezone: true }),
		approvedById: d.text().references(() => user.id, { onDelete: "set null" }),
		rejectedAt: d.timestamp({ withTimezone: true }),
		rejectedById: d.text().references(() => user.id, { onDelete: "set null" }),
		rejectionReason: d.text(),
		supervisedEntryId: d
			.integer()
			.references((): AnyPgColumn => timeEntries.id, { onDelete: "set null" }),
		estimateAtStart: d.integer(),
		preOverdueSpentSeconds: d.integer(),
		overdueSpentSeconds: d.integer(),
		isOverdue: d.boolean().default(false).notNull(),
		createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
		updatedAt: d
			.timestamp({ withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	}),
	(t) => [
		index("time_entry_user_idx").on(t.userId),
		index("time_entry_org_idx").on(t.organizationId),
		index("time_entry_project_idx").on(t.projectId),
		index("time_entry_task_idx").on(t.taskId),
		index("time_entry_sprint_idx").on(t.sprintId),
		index("time_entry_start_idx").on(t.startTime),
		index("time_entry_end_idx").on(t.endTime),
		index("time_entry_running_idx")
			.on(t.userId)
			.where(sql`${t.endTime} is null`),
		index("time_entry_user_start_idx").on(t.userId, t.startTime),
		index("time_entry_org_start_idx").on(t.organizationId, t.startTime),
		index("time_entry_org_billable_start_idx").on(
			t.organizationId,
			t.isBillable,
			t.startTime,
		),
		index("time_entry_mb_ticket_idx").on(t.mbTicketId),
		index("time_entry_mb_ticket_status_idx").on(t.mbTicketStatus),
		index("time_entry_reviewer_idx").on(t.reviewerId),
		index("time_entry_approved_at_idx").on(t.approvedAt),
		index("time_entry_rejected_at_idx").on(t.rejectedAt),
		index("time_entry_supervised_entry_idx").on(t.supervisedEntryId),
	],
);

export const timeEntryReviewers = createTable(
	"time_entry_reviewer",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		timeEntryId: d
			.integer()
			.notNull()
			.references(() => timeEntries.id, { onDelete: "cascade" }),
		userId: d
			.text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
	}),
	(t) => [
		index("time_entry_reviewer_entry_idx").on(t.timeEntryId),
		index("time_entry_reviewer_user_idx").on(t.userId),
		uniqueIndex("time_entry_reviewer_unique_idx").on(t.timeEntryId, t.userId),
	],
);
