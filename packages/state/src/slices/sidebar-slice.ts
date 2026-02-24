import type { StateCreator } from "zustand";
import type { AppStateStore } from "../store";

export interface SidebarSlice {
	sidebarCollapsed: boolean;
	sidebarSettingsOpen: boolean;
	sidebarSectionsOpen: Record<string, boolean>;
	toggleSidebarCollapsed: () => void;
	setSidebarCollapsed: (collapsed: boolean) => void;
	toggleSidebarSettingsOpen: () => void;
	setSidebarSettingsOpen: (isOpen: boolean) => void;
	toggleSidebarSectionOpen: (sectionLabel: string, defaultOpen?: boolean) => void;
	setSidebarSectionOpen: (sectionLabel: string, isOpen: boolean) => void;
}

export const createSidebarSlice: StateCreator<
	AppStateStore,
	[],
	[],
	SidebarSlice
> = (set) => ({
	sidebarCollapsed: false,
	sidebarSettingsOpen: false,
	sidebarSectionsOpen: {},
	toggleSidebarCollapsed: () => {
		set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
	},
	setSidebarCollapsed: (collapsed) => {
		set({ sidebarCollapsed: collapsed });
	},
	toggleSidebarSettingsOpen: () => {
		set((state) => ({ sidebarSettingsOpen: !state.sidebarSettingsOpen }));
	},
	setSidebarSettingsOpen: (isOpen) => {
		set({ sidebarSettingsOpen: isOpen });
	},
	toggleSidebarSectionOpen: (sectionLabel, defaultOpen = true) => {
		set((state) => {
			const currentValue =
				state.sidebarSectionsOpen[sectionLabel] ?? defaultOpen;
			return {
				sidebarSectionsOpen: {
					...state.sidebarSectionsOpen,
					[sectionLabel]: !currentValue,
				},
			};
		});
	},
	setSidebarSectionOpen: (sectionLabel, isOpen) => {
		set((state) => ({
			sidebarSectionsOpen: {
				...state.sidebarSectionsOpen,
				[sectionLabel]: isOpen,
			},
		}));
	},
});
