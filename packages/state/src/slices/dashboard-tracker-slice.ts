import type { StateCreator } from "zustand";
import type { AppStateStore } from "../store";

export interface DashboardTrackerSlice {
	dashboardDescription: string;
	dashboardTargetKey: string;
	dashboardIsBillable: boolean;
	dashboardIsDescriptionFocused: boolean;
	dashboardCollapsedGroups: Record<string, boolean>;
	dashboardCurrentPage: number;
	setDashboardDescription: (description: string) => void;
	setDashboardTargetKey: (targetKey: string) => void;
	setDashboardIsBillable: (isBillable: boolean) => void;
	toggleDashboardIsBillable: () => void;
	setDashboardIsDescriptionFocused: (isFocused: boolean) => void;
	setDashboardCurrentPage: (page: number) => void;
	setDashboardGroupCollapsed: (groupKey: string, collapsed: boolean) => void;
	toggleDashboardGroupCollapsed: (groupKey: string) => void;
	resetDashboardCurrentPage: () => void;
}

export const createDashboardTrackerSlice: StateCreator<
	AppStateStore,
	[],
	[],
	DashboardTrackerSlice
> = (set) => ({
	dashboardDescription: "",
	dashboardTargetKey: "",
	dashboardIsBillable: true,
	dashboardIsDescriptionFocused: false,
	dashboardCollapsedGroups: {},
	dashboardCurrentPage: 1,
	setDashboardDescription: (description) => {
		set({ dashboardDescription: description });
	},
	setDashboardTargetKey: (targetKey) => {
		set({ dashboardTargetKey: targetKey });
	},
	setDashboardIsBillable: (isBillable) => {
		set({ dashboardIsBillable: isBillable });
	},
	toggleDashboardIsBillable: () => {
		set((state) => ({ dashboardIsBillable: !state.dashboardIsBillable }));
	},
	setDashboardIsDescriptionFocused: (isFocused) => {
		set({ dashboardIsDescriptionFocused: isFocused });
	},
	setDashboardCurrentPage: (page) => {
		set({ dashboardCurrentPage: Math.max(1, page) });
	},
	setDashboardGroupCollapsed: (groupKey, collapsed) => {
		set((state) => ({
			dashboardCollapsedGroups: {
				...state.dashboardCollapsedGroups,
				[groupKey]: collapsed,
			},
		}));
	},
	toggleDashboardGroupCollapsed: (groupKey) => {
		set((state) => ({
			dashboardCollapsedGroups: {
				...state.dashboardCollapsedGroups,
				[groupKey]: !(state.dashboardCollapsedGroups[groupKey] ?? false),
			},
		}));
	},
	resetDashboardCurrentPage: () => {
		set({ dashboardCurrentPage: 1 });
	},
});
