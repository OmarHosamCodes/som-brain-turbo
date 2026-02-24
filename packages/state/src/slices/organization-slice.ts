import type { StateCreator } from "zustand";
import type { AppStateStore } from "../store";

export const ACTIVE_ORG_STORAGE_KEY = "active-org-id";

function readPersistedActiveOrganizationId() {
	if (typeof window === "undefined") {
		return "";
	}

	return window.localStorage.getItem(ACTIVE_ORG_STORAGE_KEY) ?? "";
}

function persistActiveOrganizationId(activeOrganizationId: string) {
	if (typeof window === "undefined") {
		return;
	}

	if (!activeOrganizationId) {
		window.localStorage.removeItem(ACTIVE_ORG_STORAGE_KEY);
		return;
	}

	window.localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, activeOrganizationId);
}

export interface OrganizationSlice {
	activeOrganizationId: string;
	setActiveOrganizationId: (activeOrganizationId: string) => void;
	clearActiveOrganizationId: () => void;
}

export const createOrganizationSlice: StateCreator<
	AppStateStore,
	[],
	[],
	OrganizationSlice
> = (set) => ({
	activeOrganizationId: readPersistedActiveOrganizationId(),
	setActiveOrganizationId: (activeOrganizationId) => {
		persistActiveOrganizationId(activeOrganizationId);
		set({ activeOrganizationId });
	},
	clearActiveOrganizationId: () => {
		persistActiveOrganizationId("");
		set({ activeOrganizationId: "" });
	},
});
