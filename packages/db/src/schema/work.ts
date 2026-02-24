import { index, uniqueIndex } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { createTable } from "./base";
import { projects } from "./client-project";
import { commentTypeEnum, taskPriorityEnum, taskStatusEnum } from "./enums";
import { organizations } from "./organization";

export const departments = createTable(
	"department",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		name: d.varchar({ length: 256 }).notNull(),
		organizationId: d
			.integer()
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [index("department_org_idx").on(t.organizationId)],
);

export const tasks = createTable(
	"task",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		name: d.varchar({ length: 256 }).notNull(),
		description: d.text(),
		projectId: d
			.integer()
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		status: taskStatusEnum().notNull().default("not_started"),
		priority: taskPriorityEnum().notNull().default("normal"),
		estimate: d.integer(),
		links: d.text(),
		completionPercentage: d.integer().notNull().default(0),
		createdById: d
			.text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		assignedToId: d.text().references(() => user.id, { onDelete: "set null" }),
		departmentId: d
			.integer()
			.references(() => departments.id, { onDelete: "set null" }),
		allowedOvertime: d.integer(),
		unlimitedOvertime: d.boolean().default(false).notNull(),
		completedAt: d.timestamp({ withTimezone: true }),
		archivedAt: d.timestamp({ withTimezone: true }),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("task_project_idx").on(t.projectId),
		index("task_archived_idx").on(t.archivedAt),
		index("task_status_idx").on(t.status),
		index("task_priority_idx").on(t.priority),
		index("task_created_by_idx").on(t.createdById),
		index("task_assigned_to_idx").on(t.assignedToId),
		index("task_department_idx").on(t.departmentId),
		index("task_overtime_idx").on(t.allowedOvertime),
	],
);

export const checklistItems = createTable(
	"checklist_item",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		taskId: d
			.integer()
			.notNull()
			.references(() => tasks.id, { onDelete: "cascade" }),
		name: d.varchar({ length: 256 }).notNull(),
		isComplete: d.boolean().notNull().default(false),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
	}),
	(t) => [index("checklist_item_task_idx").on(t.taskId)],
);

export const departmentMembers = createTable(
	"department_member",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		userId: d
			.text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		departmentId: d
			.integer()
			.notNull()
			.references(() => departments.id, { onDelete: "cascade" }),
		organizationId: d
			.integer()
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
	}),
	(t) => [
		index("dept_member_user_idx").on(t.userId),
		index("dept_member_dept_idx").on(t.departmentId),
		index("dept_member_org_idx").on(t.organizationId),
		uniqueIndex("dept_member_unique_idx").on(t.userId, t.departmentId),
	],
);

export const taskReviewers = createTable(
	"task_reviewer",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		taskId: d
			.integer()
			.notNull()
			.references(() => tasks.id, { onDelete: "cascade" }),
		userId: d
			.text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		approvedAt: d.timestamp({ withTimezone: true }),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
	}),
	(t) => [
		index("task_reviewer_task_idx").on(t.taskId),
		index("task_reviewer_user_idx").on(t.userId),
		uniqueIndex("task_reviewer_unique_idx").on(t.taskId, t.userId),
	],
);

export const taskComments = createTable(
	"task_comment",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		taskId: d
			.integer()
			.notNull()
			.references(() => tasks.id, { onDelete: "cascade" }),
		userId: d
			.text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		content: d.text().notNull(),
		type: commentTypeEnum().notNull().default("user"),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("task_comment_task_idx").on(t.taskId),
		index("task_comment_user_idx").on(t.userId),
	],
);
