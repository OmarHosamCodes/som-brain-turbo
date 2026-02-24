"use client";

import { useAppStateStore } from "@som-brain-turbo/state";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { trpc } from "./trpc-client";

const GROUPS_PER_PAGE = 4;

interface DashboardTarget {
  key: string;
  type: "task" | "sprintStep" | "ticket";
  title: string;
  projectName: string | null;
}

interface DashboardActiveEntry {
  id: number;
  description: string;
  targetKey: string | null;
  targetType: DashboardTarget["type"] | null;
  targetTitle: string | null;
  projectName: string | null;
  isBillable: boolean;
  startTime: string;
}

interface DashboardEntry {
  id: number;
  description: string;
  targetKey: string | null;
  targetType: DashboardTarget["type"] | null;
  targetTitle: string | null;
  projectName: string | null;
  isBillable: boolean;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

interface DescriptionSuggestion {
  description: string;
  targetKey: string;
  targetType: DashboardEntry["targetType"];
  targetTitle: string | null;
  isBillable: boolean;
}

interface GroupedEntry {
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

function toErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    const message = (error as { message: string }).message.trim();
    if (message) {
      return message;
    }
  }

  return "Something went wrong.";
}

function buildGroupedEntries(entries: DashboardEntry[]) {
  const groupedMap = new Map<string, GroupedEntry>();

  for (const entry of entries) {
    const key = `${entry.description}|${entry.targetKey}|${entry.isBillable}`;
    const existingGroup = groupedMap.get(key);

    if (existingGroup) {
      existingGroup.entries.push(entry);
      existingGroup.totalMinutes += entry.durationMinutes;
      if (
        new Date(entry.startTime).getTime() >
        new Date(existingGroup.latestStartedAt).getTime()
      ) {
        existingGroup.latestStartedAt = entry.startTime;
      }
    } else {
      groupedMap.set(key, {
        key,
        description: entry.description,
        targetKey: entry.targetKey,
        targetType: entry.targetType,
        targetTitle: entry.targetTitle,
        projectName: entry.projectName,
        isBillable: entry.isBillable,
        totalMinutes: entry.durationMinutes,
        entries: [entry],
        latestStartedAt: entry.startTime,
      });
    }
  }

  return [...groupedMap.values()].sort(
    (a, b) =>
      new Date(b.latestStartedAt).getTime() -
      new Date(a.latestStartedAt).getTime(),
  );
}

function subscribeToClock(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const timerId = window.setInterval(onStoreChange, 1000);
  return () => window.clearInterval(timerId);
}

function getClockSnapshot() {
  return Math.floor(Date.now() / 1000);
}

function getClockServerSnapshot() {
  return 0;
}

function useSecondTicker() {
  return useSyncExternalStore(
    subscribeToClock,
    getClockSnapshot,
    getClockServerSnapshot,
  );
}

function useDashboardDataState() {
  const dashboardQuery = useQuery(
    trpc.timeTracker.dashboardData.queryOptions(),
  );
  const targets = (dashboardQuery.data?.targets ?? []) as DashboardTarget[];
  const completedEntries = (dashboardQuery.data?.entries ??
    []) as DashboardEntry[];
  const activeEntry =
    (dashboardQuery.data?.activeEntry as DashboardActiveEntry | null) ?? null;

  return {
    dashboardQuery,
    targets,
    completedEntries,
    activeEntry,
  } as const;
}

export function useDashboardPageStatus() {
  const { dashboardQuery } = useDashboardDataState();

  const retry = () => {
    void dashboardQuery.refetch();
  };

  return {
    isPending: dashboardQuery.isPending,
    isError: dashboardQuery.isError,
    errorMessage:
      dashboardQuery.error?.message ?? "Failed to load tracker data.",
    retry,
  } as const;
}

export function useDashboardTrackerWidgetState() {
  const { dashboardQuery, targets, completedEntries, activeEntry } =
    useDashboardDataState();
  const startTimerMutation = useMutation(
    trpc.timeTracker.startTimer.mutationOptions(),
  );
  const stopTimerMutation = useMutation(
    trpc.timeTracker.stopTimer.mutationOptions(),
  );
  const discardTimerMutation = useMutation(
    trpc.timeTracker.discardTimer.mutationOptions(),
  );
  const nowSecond = useSecondTicker();

  const description = useAppStateStore((state) => state.dashboardDescription);
  const targetKey = useAppStateStore((state) => state.dashboardTargetKey);
  const isBillable = useAppStateStore((state) => state.dashboardIsBillable);
  const isDescriptionFocused = useAppStateStore(
    (state) => state.dashboardIsDescriptionFocused,
  );
  const setDescription = useAppStateStore(
    (state) => state.setDashboardDescription,
  );
  const setTargetKey = useAppStateStore((state) => state.setDashboardTargetKey);
  const setIsBillable = useAppStateStore(
    (state) => state.setDashboardIsBillable,
  );
  const toggleIsBillable = useAppStateStore(
    (state) => state.toggleDashboardIsBillable,
  );
  const setIsDescriptionFocused = useAppStateStore(
    (state) => state.setDashboardIsDescriptionFocused,
  );
  const resetCurrentPage = useAppStateStore(
    (state) => state.resetDashboardCurrentPage,
  );

  const targetsByKey = useMemo(
    () => new Map(targets.map((target) => [target.key, target])),
    [targets],
  );

  const suggestions = useMemo(() => {
    const deduped = new Map<string, DescriptionSuggestion>();

    for (const entry of completedEntries) {
      if (!entry.targetKey) {
        continue;
      }

      const trimmedDescription = entry.description.trim();
      if (!trimmedDescription) {
        continue;
      }

      const signature = `${trimmedDescription.toLowerCase()}|${entry.targetKey}|${entry.isBillable}`;
      if (deduped.has(signature)) {
        continue;
      }

      deduped.set(signature, {
        description: trimmedDescription,
        targetKey: entry.targetKey,
        targetType: entry.targetType,
        targetTitle: entry.targetTitle,
        isBillable: entry.isBillable,
      });

      if (deduped.size >= 40) {
        break;
      }
    }

    return [...deduped.values()];
  }, [completedEntries]);

  const matchingSuggestions = useMemo(() => {
    const query = description.trim().toLowerCase();
    if (!query) {
      return suggestions.slice(0, 5);
    }

    return suggestions
      .filter((suggestion) =>
        suggestion.description.toLowerCase().includes(query),
      )
      .slice(0, 5);
  }, [description, suggestions]);

  const resolvedTargetKey = useMemo(() => {
    if (targets.length === 0) {
      return "";
    }

    const hasSelectedTarget = targets.some(
      (target) => target.key === targetKey,
    );

    if (hasSelectedTarget) {
      return targetKey;
    }

    return targets[0]?.key ?? "";
  }, [targetKey, targets]);

  const selectedTarget = useMemo(
    () => targets.find((target) => target.key === resolvedTargetKey) ?? null,
    [resolvedTargetKey, targets],
  );

  const timerIsRunning = activeEntry !== null;
  const elapsedSeconds = activeEntry
    ? Math.max(
        0,
        nowSecond -
          Math.floor(new Date(activeEntry.startTime).getTime() / 1000),
      )
    : 0;

  const mutationBusy =
    startTimerMutation.isPending ||
    stopTimerMutation.isPending ||
    discardTimerMutation.isPending;

  const canStart =
    description.trim().length > 0 &&
    Boolean(resolvedTargetKey) &&
    !timerIsRunning &&
    !mutationBusy;

  const applySuggestion = (suggestion: DescriptionSuggestion) => {
    setDescription(suggestion.description);
    if (targetsByKey.has(suggestion.targetKey)) {
      setTargetKey(suggestion.targetKey);
    }
    setIsBillable(suggestion.isBillable);
    setIsDescriptionFocused(false);
  };

  const onDescriptionChange = (value: string) => {
    setDescription(value);

    const exactSuggestion = suggestions.find(
      (suggestion) =>
        suggestion.description.toLowerCase() === value.trim().toLowerCase(),
    );

    if (!exactSuggestion) {
      return;
    }

    if (targetsByKey.has(exactSuggestion.targetKey)) {
      setTargetKey(exactSuggestion.targetKey);
    }
    setIsBillable(exactSuggestion.isBillable);
  };

  const onDescriptionFocus = () => {
    setIsDescriptionFocused(true);
  };

  const onDescriptionBlur = () => {
    window.setTimeout(() => {
      setIsDescriptionFocused(false);
    }, 100);
  };

  const onStartTimer = async () => {
    const normalizedDescription = description.trim();
    if (!normalizedDescription || !resolvedTargetKey) {
      return;
    }

    try {
      await startTimerMutation.mutateAsync({
        description: normalizedDescription,
        targetKey: resolvedTargetKey,
        isBillable,
      });
      resetCurrentPage();
      await dashboardQuery.refetch();
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  const onStopTimer = async () => {
    try {
      await stopTimerMutation.mutateAsync();
      resetCurrentPage();
      await dashboardQuery.refetch();
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  const onDiscardTimer = async () => {
    try {
      await discardTimerMutation.mutateAsync();
      await dashboardQuery.refetch();
    } catch (error) {
      toast.error(toErrorMessage(error));
    }
  };

  const onPrimaryAction = () => {
    if (timerIsRunning) {
      void onStopTimer();
      return;
    }

    void onStartTimer();
  };

  return {
    elapsedSeconds,
    description,
    isDescriptionFocused,
    matchingSuggestions,
    targets,
    targetKey: resolvedTargetKey,
    isBillable,
    timerIsRunning,
    mutationBusy,
    canStart,
    activeEntry,
    selectedTarget,
    onDescriptionChange,
    onDescriptionFocus,
    onDescriptionBlur,
    onApplySuggestion: applySuggestion,
    onTargetKeyChange: setTargetKey,
    onToggleBillable: toggleIsBillable,
    onPrimaryAction,
    onDiscard: () => {
      void onDiscardTimer();
    },
  } as const;
}

export function useTimeEntriesSectionState() {
  const { completedEntries } = useDashboardDataState();
  const currentPage = useAppStateStore((state) => state.dashboardCurrentPage);
  const collapsedGroups = useAppStateStore(
    (state) => state.dashboardCollapsedGroups,
  );
  const setCurrentPage = useAppStateStore(
    (state) => state.setDashboardCurrentPage,
  );
  const toggleGroupCollapsed = useAppStateStore(
    (state) => state.toggleDashboardGroupCollapsed,
  );

  const groupedEntries = useMemo(
    () => buildGroupedEntries(completedEntries),
    [completedEntries],
  );
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(groupedEntries.length / GROUPS_PER_PAGE)),
    [groupedEntries.length],
  );
  const resolvedCurrentPage = Math.min(currentPage, totalPages);
  const paginatedGroups = useMemo(() => {
    const start = (resolvedCurrentPage - 1) * GROUPS_PER_PAGE;
    const end = start + GROUPS_PER_PAGE;
    return groupedEntries.slice(start, end);
  }, [groupedEntries, resolvedCurrentPage]);

  const onPreviousPage = () => {
    setCurrentPage(Math.max(1, resolvedCurrentPage - 1));
  };

  const onNextPage = () => {
    setCurrentPage(Math.min(totalPages, resolvedCurrentPage + 1));
  };

  return {
    currentPage: resolvedCurrentPage,
    totalPages,
    paginatedGroups,
    collapsedGroups,
    onToggleGroup: toggleGroupCollapsed,
    onPreviousPage,
    onNextPage,
  } as const;
}
