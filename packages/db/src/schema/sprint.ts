import { type AnyPgColumn, index, uniqueIndex } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { createTable } from "./base";
import { projects } from "./client-project";
import { sprintStatusEnum, sprintTaskStatusEnum } from "./enums";
import { organizations } from "./organization";
import { departments, tasks } from "./work";

export const sprintTemplates = createTable(
	"sprint_template",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		name: d.varchar({ length: 256 }).notNull(),
		description: d.text(),
		organizationId: d
			.integer()
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		createdById: d
			.text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: d
			.timestamp({ withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: d
			.timestamp({ withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	}),
	(t) => [
		index("sprint_template_org_idx").on(t.organizationId),
		index("sprint_template_created_by_idx").on(t.createdById),
		index("sprint_template_org_creator_idx").on(t.organizationId, t.createdById),
	],
);

export const sprintTemplateSteps = createTable(
	"sprint_template_step",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		templateId: d
			.integer()
			.notNull()
			.references(() => sprintTemplates.id, { onDelete: "cascade" }),
		name: d.varchar({ length: 256 }).notNull(),
		description: d.text(),
		departmentId: d
			.integer()
			.notNull()
			.references(() => departments.id, { onDelete: "cascade" }),
		sequenceOrder: d.integer().notNull(),
		estimate: d.integer(),
		createdAt: d
			.timestamp({ withTimezone: true })
			.defaultNow()
			.notNull(),
	}),
	(t) => [
		index("sprint_template_step_template_idx").on(t.templateId),
		index("sprint_template_step_dept_idx").on(t.departmentId),
		index("sprint_template_step_order_idx").on(t.templateId, t.sequenceOrder),
	],
);

export const sprints = createTable(
	"sprint",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		name: d.varchar({ length: 256 }).notNull(),
		description: d.text(),
		projectId: d
			.integer()
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		organizationId: d
			.integer()
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		status: sprintStatusEnum().notNull().default("draft"),
		templateId: d.integer().references(() => sprintTemplates.id, {
			onDelete: "set null",
		}),
		createdById: d
			.text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		startedAt: d.timestamp({ withTimezone: true }),
		completedAt: d.timestamp({ withTimezone: true }),
		createdAt: d
			.timestamp({ withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: d
			.timestamp({ withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	}),
	(t) => [
		index("sprint_project_idx").on(t.projectId),
		index("sprint_org_idx").on(t.organizationId),
		index("sprint_status_idx").on(t.status),
		index("sprint_template_idx").on(t.templateId),
		index("sprint_created_by_idx").on(t.createdById),
		index("sprint_org_status_idx").on(t.organizationId, t.status),
		index("sprint_project_status_idx").on(t.projectId, t.status),
	],
);

export const sprintTasks = createTable(
	"sprint_task",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		sprintId: d
			.integer()
			.notNull()
			.references(() => sprints.id, { onDelete: "cascade" }),
		taskId: d
			.integer()
			.notNull()
			.references(() => tasks.id, { onDelete: "cascade" }),
		departmentId: d
			.integer()
			.notNull()
			.references(() => departments.id, { onDelete: "cascade" }),
		sequenceOrder: d.integer().notNull(),
		predecessorId: d.integer().references((): AnyPgColumn => sprintTasks.id, {
			onDelete: "set null",
		}),
		isVisible: d.boolean().default(false).notNull(),
		status: sprintTaskStatusEnum().notNull().default("pending"),
		assignedReviewerId: d.text().references(() => user.id, {
			onDelete: "set null",
		}),
		finishedAt: d.timestamp({ withTimezone: true }),
		finishedById: d.text().references(() => user.id, { onDelete: "set null" }),
		createdAt: d
			.timestamp({ withTimezone: true })
			.defaultNow()
			.notNull(),
	}),
	(t) => [
		index("sprint_task_sprint_idx").on(t.sprintId),
		index("sprint_task_task_idx").on(t.taskId),
		index("sprint_task_dept_idx").on(t.departmentId),
		index("sprint_task_order_idx").on(t.sprintId, t.sequenceOrder),
		index("sprint_task_predecessor_idx").on(t.predecessorId),
		index("sprint_task_status_idx").on(t.status),
		index("sprint_task_finished_by_idx").on(t.finishedById),
		index("sprint_task_sprint_status_visible_idx").on(
			t.sprintId,
			t.status,
			t.isVisible,
		),
		uniqueIndex("sprint_task_unique_idx").on(t.sprintId, t.taskId),
	],
);
