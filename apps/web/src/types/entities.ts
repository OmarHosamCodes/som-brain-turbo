import type { AppRouter } from "@som-brain-turbo/api/routers/index";
import type { inferRouterOutputs } from "@trpc/server";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type ClientRecord = RouterOutputs["clients"]["list"][number];
export type ProjectRecord = RouterOutputs["projects"]["list"][number];
export type TaskRecord = RouterOutputs["tasks"]["list"][number];
export type SprintRecord = RouterOutputs["sprints"]["list"][number];

export const TASK_STATUS_OPTIONS = [
	{ value: "not_started", label: "Not Started" },
	{ value: "open", label: "Open" },
	{ value: "on_hold", label: "On Hold" },
	{ value: "in_review", label: "In Review" },
	{ value: "complete", label: "Complete" },
] as const;

export const TASK_PRIORITY_OPTIONS = [
	{ value: "normal", label: "Normal" },
	{ value: "important", label: "Important" },
	{ value: "urgent", label: "Urgent" },
] as const;

export const SPRINT_STATUS_OPTIONS = [
	{ value: "draft", label: "Draft" },
	{ value: "active", label: "Active" },
	{ value: "completed", label: "Completed" },
] as const;
