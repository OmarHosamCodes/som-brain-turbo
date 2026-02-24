import { index, uniqueIndex } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { createTable } from "./base";
import { organizations } from "./organization";

export const clients = createTable(
	"client",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		name: d.varchar({ length: 256 }).notNull(),
		email: d.varchar({ length: 256 }),
		phone: d.varchar({ length: 64 }),
		address: d.text(),
		organizationId: d
			.integer()
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		hourlyRate: d.integer(),
		accessCode: d.varchar({ length: 32 }).unique(),
		accessCodeCreatedAt: d.timestamp({ withTimezone: true }),
		accessCodeExpiresAt: d.timestamp({ withTimezone: true }),
		archivedAt: d.timestamp({ withTimezone: true }),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("client_org_idx").on(t.organizationId),
		index("client_archived_idx").on(t.archivedAt),
		index("client_access_code_idx").on(t.accessCode),
	],
);

export const clientRateHistory = createTable(
	"client_rate_history",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		clientId: d
			.integer()
			.notNull()
			.references(() => clients.id, { onDelete: "cascade" }),
		previousRate: d.integer(),
		newRate: d.integer(),
		changedById: d
			.text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		reason: d.text(),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
	}),
	(t) => [
		index("client_rate_history_client_idx").on(t.clientId),
		index("client_rate_history_changed_by_idx").on(t.changedById),
		index("client_rate_history_created_at_idx").on(t.createdAt),
	],
);

export const projects = createTable(
	"project",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		name: d.varchar({ length: 256 }).notNull(),
		color: d.varchar({ length: 7 }).default("#6366f1"),
		isBillable: d.boolean().default(false).notNull(),
		hourlyRate: d.integer(),
		clientId: d
			.integer()
			.references(() => clients.id, { onDelete: "set null" }),
		organizationId: d
			.integer()
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		archivedAt: d.timestamp({ withTimezone: true }),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("project_org_idx").on(t.organizationId),
		index("project_client_idx").on(t.clientId),
		index("project_archived_idx").on(t.archivedAt),
	],
);

export const projectOwners = createTable(
	"project_owner",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		projectId: d
			.integer()
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		userId: d
			.text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
	}),
	(t) => [
		index("project_owner_project_idx").on(t.projectId),
		index("project_owner_user_idx").on(t.userId),
		uniqueIndex("project_owner_unique_idx").on(t.projectId, t.userId),
	],
);
