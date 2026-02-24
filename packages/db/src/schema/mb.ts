import { index, jsonb } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { createTable } from "./base";
import { projects } from "./client-project";
import {
	mbTicketPriorityEnum,
	mbTicketRiskEnum,
	mbTicketStatusEnum,
	mbTicketTypeEnum,
} from "./enums";
import { organizations } from "./organization";

export const mbTickets = createTable(
	"mb_ticket",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		title: d.varchar({ length: 256 }).notNull(),
		description: d.text(),
		type: mbTicketTypeEnum().notNull().default("issue"),
		status: mbTicketStatusEnum().notNull().default("problem"),
		priority: mbTicketPriorityEnum(),
		risk: mbTicketRiskEnum(),
		testCredentials: d.text(),
		testScenarios: d.text(),
		isDelayed: d.boolean().default(false).notNull(),
		delayReason: d.text(),
		isIssued: d.boolean().default(false).notNull(),
		authorId: d
			.text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		assigneeId: d.text().references(() => user.id, { onDelete: "set null" }),
		projectId: d
			.integer()
			.references(() => projects.id, { onDelete: "set null" }),
		organizationId: d
			.integer()
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		assets: jsonb().$type<{ url: string; name: string }[]>(),
		archivedAt: d.timestamp({ withTimezone: true }),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("mb_ticket_org_idx").on(t.organizationId),
		index("mb_ticket_type_idx").on(t.type),
		index("mb_ticket_status_idx").on(t.status),
		index("mb_ticket_author_idx").on(t.authorId),
		index("mb_ticket_assignee_idx").on(t.assigneeId),
		index("mb_ticket_project_idx").on(t.projectId),
		index("mb_ticket_archived_idx").on(t.archivedAt),
	],
);

export const mbTicketIssues = createTable(
	"mb_ticket_issue",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		ticketId: d
			.integer()
			.notNull()
			.references(() => mbTickets.id, { onDelete: "cascade" }),
		content: d.text().notNull(),
		isResolved: d.boolean().default(false).notNull(),
		isFalsePositive: d.boolean().default(false).notNull(),
		falsePositiveReason: d.text(),
		images: jsonb().$type<string[]>(),
		reporterId: d
			.text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("mb_ticket_issue_ticket_idx").on(t.ticketId),
		index("mb_ticket_issue_reporter_idx").on(t.reporterId),
		index("mb_ticket_issue_resolved_idx").on(t.isResolved),
	],
);
