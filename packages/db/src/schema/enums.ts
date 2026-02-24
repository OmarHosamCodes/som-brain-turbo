import { pgEnum } from "drizzle-orm/pg-core";

export const organizationRoleEnum = pgEnum("organization_role", [
	"owner",
	"admin",
	"member",
]);

export const taskStatusEnum = pgEnum("task_status", [
	"not_started",
	"open",
	"on_hold",
	"in_review",
	"complete",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
	"normal",
	"important",
	"urgent",
]);

export const sprintStatusEnum = pgEnum("sprint_status", [
	"draft",
	"active",
	"completed",
]);

export const sprintTaskStatusEnum = pgEnum("sprint_task_status", [
	"pending",
	"in_progress",
	"finished",
]);

export const mbTicketStatusEnum = pgEnum("mb_ticket_status", [
	"problem",
	"task",
	"in_progress",
	"testing",
	"deployed",
]);

export const mbTicketPriorityEnum = pgEnum("mb_ticket_priority", [
	"low",
	"medium",
	"high",
	"critical",
]);

export const mbTicketRiskEnum = pgEnum("mb_ticket_risk", [
	"low",
	"medium",
	"high",
]);

export const mbTicketTypeEnum = pgEnum("mb_ticket_type", ["issue", "feature"]);

export const commentTypeEnum = pgEnum("comment_type", ["user", "system"]);

export const memberSubTypeEnum = pgEnum("member_sub_type", [
	"standard",
	"intern",
	"contractor",
	"cofounder",
]);

export const benefitTypeEnum = pgEnum("benefit_type", ["percentage", "fixed"]);
