import { sql } from "drizzle-orm";
import { index, uniqueIndex } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { createTable } from "./base";
import {
	benefitTypeEnum,
	memberSubTypeEnum,
	organizationRoleEnum,
} from "./enums";

export const organizations = createTable(
	"organization",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		name: d.varchar({ length: 256 }).notNull(),
		slug: d.varchar({ length: 256 }).notNull(),
		defaultHourlyRate: d.integer(),
		targetHours: d.integer(),
		monthStartDay: d.integer().notNull().default(1),
		monthEndDay: d.integer().notNull().default(31),
		createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
		updatedAt: d
			.timestamp({ withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	}),
	(t) => [uniqueIndex("org_slug_idx").on(t.slug)],
);

export const organizationMembers = createTable(
	"organization_member",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		userId: d
			.text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		organizationId: d
			.integer()
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		role: organizationRoleEnum().notNull().default("member"),
		subType: memberSubTypeEnum().notNull().default("standard"),
		hourlyRate: d.integer(),
		manualAverageHours: d.numeric({ precision: 5, scale: 2 }),
		createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
	}),
	(t) => [
		index("org_member_user_idx").on(t.userId),
		index("org_member_org_idx").on(t.organizationId),
		index("org_member_subtype_idx").on(t.subType),
		index("org_member_org_subtype_idx").on(t.organizationId, t.subType),
		uniqueIndex("org_member_owner_unique_idx")
			.on(t.userId)
			.where(sql`${t.role} = 'owner'`),
		uniqueIndex("org_member_unique_idx").on(t.userId, t.organizationId),
	],
);

export const subTypeMultipliers = createTable(
	"sub_type_multiplier",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		organizationId: d
			.integer()
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		subType: memberSubTypeEnum().notNull(),
		multiplier: d.numeric({ precision: 5, scale: 2 }).notNull().default("1.00"),
		createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
		updatedAt: d
			.timestamp({ withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	}),
	(t) => [
		index("sub_type_multiplier_org_idx").on(t.organizationId),
		uniqueIndex("sub_type_multiplier_org_subtype_idx").on(
			t.organizationId,
			t.subType,
		),
	],
);

export const memberRateHistory = createTable(
	"member_rate_history",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		memberId: d
			.integer()
			.notNull()
			.references(() => organizationMembers.id, { onDelete: "cascade" }),
		previousRate: d.integer(),
		newRate: d.integer(),
		previousSubType: memberSubTypeEnum(),
		newSubType: memberSubTypeEnum(),
		changedById: d
			.text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		reason: d.text(),
		createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
	}),
	(t) => [
		index("member_rate_history_member_idx").on(t.memberId),
		index("member_rate_history_changed_by_idx").on(t.changedById),
		index("member_rate_history_created_at_idx").on(t.createdAt),
		index("member_rate_history_member_created_idx").on(t.memberId, t.createdAt),
	],
);

export const memberTags = createTable(
	"member_tag",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		organizationId: d
			.integer()
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		name: d.varchar({ length: 100 }).notNull(),
		color: d.varchar({ length: 7 }).default("#6366f1"),
		benefitType: benefitTypeEnum().notNull(),
		benefitValue: d.integer().notNull(),
		createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
		updatedAt: d
			.timestamp({ withTimezone: true })
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	}),
	(t) => [
		index("member_tag_org_idx").on(t.organizationId),
		uniqueIndex("member_tag_org_name_idx").on(t.organizationId, t.name),
	],
);

export const memberTagAssignments = createTable(
	"member_tag_assignment",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		memberId: d
			.integer()
			.notNull()
			.references(() => organizationMembers.id, { onDelete: "cascade" }),
		tagId: d
			.integer()
			.notNull()
			.references(() => memberTags.id, { onDelete: "cascade" }),
		assignedById: d
			.text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
	}),
	(t) => [
		index("member_tag_assignment_member_idx").on(t.memberId),
		index("member_tag_assignment_tag_idx").on(t.tagId),
		uniqueIndex("member_tag_assignment_unique_idx").on(t.memberId, t.tagId),
	],
);
