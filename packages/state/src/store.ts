"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import {
	type AuthFormMode,
	type AuthFormSlice,
	createAuthFormSlice,
} from "./slices/auth-form-slice";
import {
	createDashboardTrackerSlice,
	type DashboardTrackerSlice,
} from "./slices/dashboard-tracker-slice";
import {
	createOrganizationSlice,
	type OrganizationSlice,
} from "./slices/organization-slice";
import { createSidebarSlice, type SidebarSlice } from "./slices/sidebar-slice";

export type AppStateStore = AuthFormSlice &
	DashboardTrackerSlice &
	OrganizationSlice &
	SidebarSlice;

export const useAppStateStore = create<AppStateStore>()((...args) => ({
	...createAuthFormSlice(...args),
	...createDashboardTrackerSlice(...args),
	...createOrganizationSlice(...args),
	...createSidebarSlice(...args),
}));

export const useAuthFormMode = (): AuthFormMode =>
	useAppStateStore((state) => state.authFormMode);

export const useAuthFormModeActions = () =>
	useAppStateStore(
		useShallow((state) => ({
			setAuthFormMode: state.setAuthFormMode,
			toggleAuthFormMode: state.toggleAuthFormMode,
		})),
	);
