import { type AnyPgColumn, index, uniqueIndex } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { createTable } from "./base";
import { organizations } from "./organization";

export const expenseCategories = createTable(
	"expense_category",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		organizationId: d
			.integer()
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		name: d.varchar({ length: 256 }).notNull(),
		parentId: d.integer().references((): AnyPgColumn => expenseCategories.id, {
			onDelete: "cascade",
		}),
		isActive: d.boolean().default(true).notNull(),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("expense_category_org_idx").on(t.organizationId),
		index("expense_category_parent_idx").on(t.parentId),
		uniqueIndex("expense_category_org_name_parent_idx").on(
			t.organizationId,
			t.name,
			t.parentId,
		),
	],
);

export const expenses = createTable(
	"expense",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		organizationId: d
			.integer()
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		categoryId: d
			.integer()
			.notNull()
			.references(() => expenseCategories.id, { onDelete: "restrict" }),
		amount: d.integer().notNull(),
		description: d.varchar({ length: 500 }),
		date: d.timestamp({ withTimezone: true }).notNull(),
		createdById: d
			.text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		receipt: d.text(),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("expense_org_idx").on(t.organizationId),
		index("expense_category_idx").on(t.categoryId),
		index("expense_created_by_idx").on(t.createdById),
		index("expense_date_idx").on(t.date),
	],
);
