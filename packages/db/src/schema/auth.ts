import { boolean, index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { createTable } from "./base";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified")
		.$defaultFn(() => false)
		.notNull(),
	image: text("image"),
	createdAt: timestamp("created_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
	updatedAt: timestamp("updated_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
});

export const pushSubscriptions = createTable(
	"push_subscription",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		userId: d
			.text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		endpoint: d.text().notNull(),
		p256dh: d.text().notNull(),
		auth: d.text().notNull(),
		userAgent: d.text(),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
	}),
	(t) => [
		index("push_subscription_user_idx").on(t.userId),
		uniqueIndex("push_subscription_user_endpoint_idx").on(t.userId, t.endpoint),
	],
);

export const notificationPreferences = createTable(
	"notification_preference",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		userId: d
			.text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		taskOverdue: d.boolean().default(true).notNull(),
		timeEntrySubmitted: d.boolean().default(true).notNull(),
		timeEntryApproved: d.boolean().default(true).notNull(),
		timeEntryRejected: d.boolean().default(true).notNull(),
		mbTicketAssigned: d.boolean().default(true).notNull(),
		mbTicketStatusChanged: d.boolean().default(true).notNull(),
		mbIssueReported: d.boolean().default(true).notNull(),
		mbIssueResolved: d.boolean().default(true).notNull(),
		mbTicketDelayed: d.boolean().default(true).notNull(),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [uniqueIndex("notification_preference_user_idx").on(t.userId)],
);
