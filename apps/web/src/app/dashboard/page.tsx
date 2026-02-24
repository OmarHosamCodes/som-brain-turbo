"use client";

import { trpc } from "@som-brain-turbo/hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TimeEntriesSection } from "@/components/dashboard/time-entries-section";
import { TrackerWidget } from "@/components/dashboard/tracker-widget";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type DescriptionSuggestion, GROUPS_PER_PAGE } from "@/types/dashboard";
import { buildGroupedEntries, toErrorMessage } from "./dashboard.utils";

export default function DashboardPage() {
	const dashboardQuery = useQuery(
		trpc.timeTracker.dashboardData.queryOptions(),
	);
	const startTimerMutation = useMutation(
		trpc.timeTracker.startTimer.mutationOptions(),
	);
	const stopTimerMutation = useMutation(
		trpc.timeTracker.stopTimer.mutationOptions(),
	);
	const discardTimerMutation = useMutation(
		trpc.timeTracker.discardTimer.mutationOptions(),
	);

	const [description, setDescription] = useState("");
	const [targetKey, setTargetKey] = useState("");
	const [isBillable, setIsBillable] = useState(true);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
	const [collapsedGroups, setCollapsedGroups] = useState<
		Record<string, boolean>
	>({});
	const [currentPage, setCurrentPage] = useState(1);

	const targets = dashboardQuery.data?.targets ?? [];
	const completedEntries = dashboardQuery.data?.entries ?? [];
	const activeEntry = dashboardQuery.data?.activeEntry ?? null;

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

	const selectedTarget = useMemo(
		() => targets.find((target) => target.key === targetKey) ?? null,
		[targetKey, targets],
	);

	const groupedEntries = useMemo(
		() => buildGroupedEntries(completedEntries),
		[completedEntries],
	);
	const totalPages = useMemo(
		() => Math.max(1, Math.ceil(groupedEntries.length / GROUPS_PER_PAGE)),
		[groupedEntries.length],
	);
	const paginatedGroups = useMemo(() => {
		const start = (currentPage - 1) * GROUPS_PER_PAGE;
		const end = start + GROUPS_PER_PAGE;
		return groupedEntries.slice(start, end);
	}, [groupedEntries, currentPage]);

	useEffect(() => {
		if (!activeEntry) {
			setElapsedSeconds(0);
			return;
		}

		setElapsedSeconds(
			Math.floor(
				(Date.now() - new Date(activeEntry.startTime).getTime()) / 1000,
			),
		);

		const timerId = window.setInterval(() => {
			setElapsedSeconds(
				Math.floor(
					(Date.now() - new Date(activeEntry.startTime).getTime()) / 1000,
				),
			);
		}, 1000);

		return () => window.clearInterval(timerId);
	}, [activeEntry]);

	useEffect(() => {
		if (targets.length === 0) {
			if (targetKey !== "") {
				setTargetKey("");
			}
			return;
		}

		const hasSelectedTarget = targets.some(
			(target) => target.key === targetKey,
		);
		if (!hasSelectedTarget) {
			setTargetKey(targets[0]?.key ?? "");
		}
	}, [targetKey, targets]);

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [currentPage, totalPages]);

	const applySuggestion = (suggestion: DescriptionSuggestion) => {
		setDescription(suggestion.description);
		if (targetsByKey.has(suggestion.targetKey)) {
			setTargetKey(suggestion.targetKey);
		}
		setIsBillable(suggestion.isBillable);
		setIsDescriptionFocused(false);
	};

	const handleDescriptionChange = (value: string) => {
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

	const handleStartTimer = async () => {
		const normalizedDescription = description.trim();
		if (!normalizedDescription || !targetKey) {
			return;
		}

		try {
			await startTimerMutation.mutateAsync({
				description: normalizedDescription,
				targetKey,
				isBillable,
			});
			setCurrentPage(1);
			await dashboardQuery.refetch();
		} catch (error) {
			toast.error(toErrorMessage(error));
		}
	};

	const handleStopTimer = async () => {
		try {
			await stopTimerMutation.mutateAsync();
			setCurrentPage(1);
			await dashboardQuery.refetch();
		} catch (error) {
			toast.error(toErrorMessage(error));
		}
	};

	const handleDiscardTimer = async () => {
		try {
			await discardTimerMutation.mutateAsync();
			await dashboardQuery.refetch();
		} catch (error) {
			toast.error(toErrorMessage(error));
		}
	};

	const handlePrimaryTimerAction = () => {
		if (activeEntry) {
			void handleStopTimer();
			return;
		}
		void handleStartTimer();
	};

	const handleDescriptionBlur = () => {
		window.setTimeout(() => setIsDescriptionFocused(false), 100);
	};

	const toggleGroup = (key: string) => {
		setCollapsedGroups((previous) => ({
			...previous,
			[key]: !(previous[key] ?? false),
		}));
	};

	const mutationBusy =
		startTimerMutation.isPending ||
		stopTimerMutation.isPending ||
		discardTimerMutation.isPending;
	const timerIsRunning = activeEntry !== null;
	const canStart =
		description.trim().length > 0 &&
		Boolean(targetKey) &&
		!timerIsRunning &&
		!mutationBusy;

	if (dashboardQuery.isPending) {
		return (
			<div className="space-y-4">
				<h1 className="font-semibold text-2xl">Time Tracker</h1>
				<Card>
					<CardContent className="pt-4">
						<p className="text-muted-foreground text-sm">
							Loading tracker data...
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (dashboardQuery.isError) {
		return (
			<div className="space-y-4">
				<h1 className="font-semibold text-2xl">Time Tracker</h1>
				<Card>
					<CardContent className="space-y-3 pt-4">
						<p className="text-destructive text-sm">
							{dashboardQuery.error.message}
						</p>
						<Button
							variant="outline"
							onClick={() => {
								void dashboardQuery.refetch();
							}}
						>
							Retry
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-5">
			<div className="space-y-1">
				<h1 className="font-semibold text-2xl">Time Tracker</h1>
				<p className="text-muted-foreground text-sm">
					Track focused work blocks and review grouped entries.
				</p>
			</div>

			<section>
				<TrackerWidget
					elapsedSeconds={elapsedSeconds}
					description={description}
					isDescriptionFocused={isDescriptionFocused}
					matchingSuggestions={matchingSuggestions}
					targets={targets}
					targetKey={targetKey}
					isBillable={isBillable}
					timerIsRunning={timerIsRunning}
					mutationBusy={mutationBusy}
					canStart={canStart}
					activeEntry={activeEntry}
					selectedTarget={selectedTarget}
					onDescriptionChange={handleDescriptionChange}
					onDescriptionFocus={() => setIsDescriptionFocused(true)}
					onDescriptionBlur={handleDescriptionBlur}
					onApplySuggestion={applySuggestion}
					onTargetKeyChange={setTargetKey}
					onToggleBillable={() => setIsBillable((current) => !current)}
					onPrimaryAction={handlePrimaryTimerAction}
					onDiscard={() => {
						void handleDiscardTimer();
					}}
				/>
			</section>

			<section>
				<TimeEntriesSection
					currentPage={currentPage}
					totalPages={totalPages}
					paginatedGroups={paginatedGroups}
					collapsedGroups={collapsedGroups}
					onToggleGroup={toggleGroup}
					onPreviousPage={() => setCurrentPage((page) => Math.max(1, page - 1))}
					onNextPage={() =>
						setCurrentPage((page) => Math.min(totalPages, page + 1))
					}
				/>
			</section>
		</div>
	);
}
