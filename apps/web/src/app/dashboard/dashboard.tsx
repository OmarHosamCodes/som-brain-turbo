"use client";

import type { AppRouter } from "@som-brain-turbo/api/routers/index";
import { trpc } from "@som-brain-turbo/hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import {
	CheckCircle2Icon,
	ChevronDownIcon,
	ChevronRightIcon,
	Clock3Icon,
	EllipsisVerticalIcon,
	PauseCircleIcon,
	PlayCircleIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type DashboardData = RouterOutputs["timeTracker"]["dashboardData"];
type DashboardTarget = DashboardData["targets"][number];
type TargetType = DashboardTarget["type"];
type DashboardEntry = DashboardData["entries"][number];

interface DescriptionSuggestion {
	description: string;
	targetKey: string;
	targetType: DashboardEntry["targetType"];
	targetTitle: string | null;
	isBillable: boolean;
}

interface GroupedEntries {
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

const TARGET_TYPE_LABELS: Record<TargetType, string> = {
	task: "Task",
	sprintStep: "Sprint Step",
	ticket: "Ticket",
};

const GROUPS_PER_PAGE = 4;

function formatTimerDuration(totalSeconds: number) {
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	return [hours, minutes, seconds]
		.map((value) => value.toString().padStart(2, "0"))
		.join(":");
}

function formatMinutes(totalMinutes: number) {
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	if (hours === 0) return `${minutes}m`;
	if (minutes === 0) return `${hours}h`;
	return `${hours}h ${minutes}m`;
}

function formatDateTime(isoDate: string) {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(isoDate));
}

function toErrorMessage(error: unknown) {
	if (error instanceof Error) {
		return error.message;
	}
	return "Something went wrong.";
}

function buildGroupedEntries(entries: DashboardEntry[]) {
	const groupedMap = new Map<string, GroupedEntries>();

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

export default function Dashboard() {
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
	const totalPages = Math.max(
		1,
		Math.ceil(groupedEntries.length / GROUPS_PER_PAGE),
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
				<Card className="border-l-2 border-l-primary/30">
					<CardHeader className="border-border border-b">
						<CardTitle className="flex items-center justify-between gap-4 text-base">
							<span>Tracker Widget</span>
							<div className="flex items-center gap-2">
								<Clock3Icon className="size-3.5 text-muted-foreground" />
								<span
									className="font-mono text-sm tabular-nums"
									aria-live="polite"
								>
									{formatTimerDuration(elapsedSeconds)}
								</span>
							</div>
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 pt-4">
						<div className="space-y-1.5">
							<label
								className="font-medium text-muted-foreground text-xs uppercase tracking-wide"
								htmlFor="tracker-description"
							>
								Description
							</label>
							<div className="relative">
								<Input
									id="tracker-description"
									placeholder="What are you working on?"
									value={description}
									onChange={(event) =>
										handleDescriptionChange(event.currentTarget.value)
									}
									onFocus={() => setIsDescriptionFocused(true)}
									onBlur={() => {
										window.setTimeout(
											() => setIsDescriptionFocused(false),
											100,
										);
									}}
									className="pr-8"
								/>
								{isDescriptionFocused && matchingSuggestions.length > 0 && (
									<div className="absolute z-20 mt-1 max-h-52 w-full overflow-auto border border-border bg-popover shadow-sm">
										{matchingSuggestions.map((suggestion) => (
											<button
												type="button"
												key={`${suggestion.description}|${suggestion.targetKey}|${suggestion.isBillable}`}
												onMouseDown={(event) => event.preventDefault()}
												onClick={() => applySuggestion(suggestion)}
												className="flex w-full flex-col gap-1 border-border border-b px-2.5 py-2 text-left transition-colors last:border-b-0 hover:bg-accent"
											>
												<span className="line-clamp-1 text-xs">
													{suggestion.description}
												</span>
												<span className="text-[11px] text-muted-foreground">
													Auto-target:{" "}
													{suggestion.targetType
														? TARGET_TYPE_LABELS[suggestion.targetType]
														: "Target"}
													• {suggestion.targetTitle ?? "Unknown target"}
												</span>
											</button>
										))}
									</div>
								)}
							</div>
						</div>

						<div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
							<div className="space-y-1.5">
								<label
									className="font-medium text-muted-foreground text-xs uppercase tracking-wide"
									htmlFor="tracker-target"
								>
									Target
								</label>
								<select
									id="tracker-target"
									value={targetKey}
									onChange={(event) => setTargetKey(event.currentTarget.value)}
									disabled={targets.length === 0}
									className="h-8 w-full border border-input bg-transparent px-2.5 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:opacity-50"
								>
									{targets.length === 0 ? (
										<option value="">No valid targets</option>
									) : (
										targets.map((target) => (
											<option
												key={target.key}
												value={target.key}
												className="bg-background text-foreground"
											>
												{TARGET_TYPE_LABELS[target.type]} • {target.title}
											</option>
										))
									)}
								</select>
								<p className="text-muted-foreground text-xs">
									Only task, sprint step, and ticket targets are allowed.
								</p>
							</div>

							<div className="space-y-1.5">
								<span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
									isBillable
								</span>
								<button
									type="button"
									role="switch"
									aria-checked={isBillable}
									onClick={() => setIsBillable((current) => !current)}
									className="flex h-8 min-w-28 items-center justify-between border border-input bg-transparent px-2 text-xs transition-colors hover:bg-accent"
								>
									<span>{isBillable ? "Billable" : "Non-billable"}</span>
									<span
										className={`relative h-4 w-7 border border-border ${
											isBillable ? "bg-primary/20" : "bg-muted"
										}`}
									>
										<span
											className={`absolute top-0.5 size-2.5 bg-primary transition-transform ${
												isBillable ? "translate-x-3.5" : "translate-x-0.5"
											}`}
										/>
									</span>
								</button>
							</div>
						</div>

						<div className="flex flex-wrap items-center gap-2">
							<Button
								variant={timerIsRunning ? "destructive" : "default"}
								onClick={() => {
									if (timerIsRunning) {
										void handleStopTimer();
										return;
									}
									void handleStartTimer();
								}}
								disabled={timerIsRunning ? mutationBusy : !canStart}
							>
								{timerIsRunning ? (
									<>
										<PauseCircleIcon />
										Stop
									</>
								) : (
									<>
										<PlayCircleIcon />
										Start
									</>
								)}
							</Button>

							<DropdownMenu>
								<DropdownMenuTrigger
									render={<Button size="icon-sm" variant="outline" />}
								>
									<EllipsisVerticalIcon className="size-4" />
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-40 bg-card">
									<DropdownMenuItem
										variant="destructive"
										disabled={!timerIsRunning || mutationBusy}
										onClick={() => {
											void handleDiscardTimer();
										}}
									>
										Discard
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							{timerIsRunning && activeEntry && (
								<div className="flex items-center gap-2 text-muted-foreground text-xs">
									<CheckCircle2Icon className="size-3.5" />
									<span className="line-clamp-1">
										Running: {activeEntry.description}
									</span>
								</div>
							)}
						</div>

						{selectedTarget && (
							<div className="border border-border/70 bg-muted/20 px-2.5 py-2 text-xs">
								<div className="mb-0.5 flex items-center gap-1.5">
									<Badge variant="outline">
										{TARGET_TYPE_LABELS[selectedTarget.type]}
									</Badge>
									<span className="font-medium">{selectedTarget.title}</span>
								</div>
								<p className="text-muted-foreground">
									Project: {selectedTarget.projectName ?? "No project"}
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</section>

			<section>
				<Card>
					<CardHeader className="border-border border-b">
						<div className="flex flex-wrap items-center justify-between gap-2">
							<CardTitle className="text-base">Time Entries</CardTitle>
							<p className="text-muted-foreground text-xs">
								Group page {currentPage} of {totalPages}
							</p>
						</div>
					</CardHeader>
					<CardContent className="space-y-3 pt-4">
						{paginatedGroups.length === 0 ? (
							<p className="text-muted-foreground text-sm">
								No time entries yet.
							</p>
						) : (
							paginatedGroups.map((group) => {
								const collapsed = collapsedGroups[group.key] ?? false;

								return (
									<div
										key={group.key}
										className="border border-border bg-card/60"
									>
										<button
											type="button"
											onClick={() => toggleGroup(group.key)}
											className="flex w-full items-start justify-between gap-3 border-border border-b px-3 py-2.5 text-left transition-colors hover:bg-accent/50"
										>
											<div className="min-w-0 space-y-1">
												<p className="line-clamp-1 font-medium text-sm">
													{group.description}
												</p>
												<div className="flex flex-wrap items-center gap-1.5">
													<Badge variant="outline">
														{group.targetType
															? TARGET_TYPE_LABELS[group.targetType]
															: "Target"}
													</Badge>
													<span className="truncate text-muted-foreground text-xs">
														{group.targetTitle ?? "Unknown target"}
													</span>
													<Badge
														variant={group.isBillable ? "default" : "secondary"}
													>
														{group.isBillable ? "Billable" : "Non-billable"}
													</Badge>
												</div>
											</div>
											<div className="flex shrink-0 items-center gap-2 text-muted-foreground text-xs">
												<span>
													{group.entries.length}{" "}
													{group.entries.length === 1 ? "entry" : "entries"}
												</span>
												<span>{formatMinutes(group.totalMinutes)}</span>
												{collapsed ? (
													<ChevronRightIcon className="size-4" />
												) : (
													<ChevronDownIcon className="size-4" />
												)}
											</div>
										</button>

										{!collapsed && (
											<div className="space-y-2 px-3 py-2">
												{group.entries
													.slice()
													.sort(
														(a, b) =>
															new Date(b.startTime).getTime() -
															new Date(a.startTime).getTime(),
													)
													.map((entry) => (
														<div
															key={entry.id}
															className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-border border-b pb-2 text-xs last:border-b-0 last:pb-0"
														>
															<div className="text-muted-foreground">
																{formatDateTime(entry.startTime)} -{" "}
																{formatDateTime(entry.endTime)}
															</div>
															<div className="font-medium">
																{formatMinutes(entry.durationMinutes)}
															</div>
														</div>
													))}
											</div>
										)}
									</div>
								);
							})
						)}

						<div className="flex flex-wrap items-center justify-between gap-2 border-border border-t pt-3">
							<p className="text-muted-foreground text-xs">
								Showing {paginatedGroups.length} grouped result
								{paginatedGroups.length === 1 ? "" : "s"}
							</p>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									disabled={currentPage <= 1}
									onClick={() =>
										setCurrentPage((page) => Math.max(1, page - 1))
									}
								>
									Previous
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={currentPage >= totalPages}
									onClick={() =>
										setCurrentPage((page) => Math.min(totalPages, page + 1))
									}
								>
									Next
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</section>
		</div>
	);
}
