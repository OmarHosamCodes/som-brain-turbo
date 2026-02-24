"use client";

import { useAppStateStore } from "@som-brain-turbo/state";

export function useSidebarState() {
  const collapsed = useAppStateStore((state) => state.sidebarCollapsed);
  const settingsOpen = useAppStateStore((state) => state.sidebarSettingsOpen);
  const sectionsOpen = useAppStateStore((state) => state.sidebarSectionsOpen);
  const toggleCollapsed = useAppStateStore(
    (state) => state.toggleSidebarCollapsed,
  );
  const toggleSettingsOpen = useAppStateStore(
    (state) => state.toggleSidebarSettingsOpen,
  );
  const toggleSectionOpen = useAppStateStore(
    (state) => state.toggleSidebarSectionOpen,
  );

  const isSectionOpen = (sectionLabel: string, defaultOpen = true) =>
    sectionsOpen[sectionLabel] ?? defaultOpen;

  return {
    collapsed,
    settingsOpen,
    sectionsOpen,
    toggleCollapsed,
    toggleSettingsOpen,
    isSectionOpen,
    toggleSectionOpen,
  } as const;
}
