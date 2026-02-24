import type { AppRouter } from "@som-brain-turbo/api/routers/index";
import type { inferRouterOutputs } from "@trpc/server";

export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type DashboardData = RouterOutputs["timeTracker"]["dashboardData"];
export type DashboardTarget = DashboardData["targets"][number];
export type TargetType = DashboardTarget["type"];
export type DashboardEntry = DashboardData["entries"][number];

export interface DescriptionSuggestion {
	description: string;
	targetKey: string;
	targetType: DashboardEntry["targetType"];
	targetTitle: string | null;
	isBillable: boolean;
}

export interface GroupedEntries {
	key: string;
	description: string;
	targetKey: string | null;
	targetType: DashboardEntry["targetType"];
	targetTitle: string | null;
	projectName: string | null;
	isBillable: boolean;
	totalMinutes: number;
	entries: DashboardEntry[];
	latestStartedAt: string;
}

export const TARGET_TYPE_LABELS: Record<TargetType, string> = {
	task: "Task",
	sprintStep: "Sprint Step",
	ticket: "Ticket",
};

export const GROUPS_PER_PAGE = 4;
