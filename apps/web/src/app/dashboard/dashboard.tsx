"use client";

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

type TargetType = "task" | "sprintStep" | "ticket";

interface TargetOption {
	id: string;
	type: TargetType;
	title: string;
	projectName: string;
}

interface DescriptionTemplate {
	id: string;
	description: string;
	targetId: string;
	isBillable: boolean;
}

interface TimeEntry {
	id: string;
	description: string;
	targetId: string;
	isBillable: boolean;
	startedAt: string;
	endedAt: string;
	durationMinutes: number;
}

interface ActiveTimer {
	description: string;
	targetId: string;
	isBillable: boolean;
	startedAtMs: number;
}

interface GroupedEntries {
	key: string;
	description: string;
	targetId: string;
	isBillable: boolean;
	totalMinutes: number;
	entries: TimeEntry[];
	latestStartedAt: string;
}

const TARGET_OPTIONS: TargetOption[] = [
	{
		id: "task-frontend-reports",
		type: "task",
		title: "Build reports table filters",
		projectName: "Pulse Platform",
	},
	{
		id: "task-billing-export",
		type: "task",
		title: "Fix billing CSV export edge case",
		projectName: "Finance Core",
	},
	{
		id: "sprint-step-onboarding",
		type: "sprintStep",
		title: "Sprint 12: onboarding polish",
		projectName: "Pulse Platform",
	},
	{
		id: "sprint-step-qa",
		type: "sprintStep",
		title: "Sprint 12: QA and regression sweep",
		projectName: "Pulse Platform",
	},
	{
		id: "ticket-4189",
		type: "ticket",
		title: "SB-4189: timer drift on tab sleep",
		projectName: "Tracker API",
	},
	{
		id: "ticket-4220",
		type: "ticket",
		title: "SB-4220: duplicate entry merge issue",
		projectName: "Tracker API",
	},
];

const DESCRIPTION_TEMPLATES: DescriptionTemplate[] = [
	{
		id: "tpl-billing-export",
		description: "Debugged CSV export mismatch for enterprise invoices",
		targetId: "task-billing-export",
		isBillable: true,
	},
	{
		id: "tpl-reports-filter",
		description:
			"Implemented date-range and assignee filters for reports table",
		targetId: "task-frontend-reports",
		isBillable: true,
	},
	{
		id: "tpl-ticket-drift",
		description: "Investigated timer drift after browser sleep",
		targetId: "ticket-4189",
		isBillable: true,
	},
	{
		id: "tpl-qa",
		description: "Ran QA checklist and fixed sprint blockers",
		targetId: "sprint-step-qa",
		isBillable: false,
	},
	{
		id: "tpl-dupes",
		description: "Validated duplicate time-entry grouping behavior",
		targetId: "ticket-4220",
		isBillable: false,
	},
];

const INITIAL_ENTRIES: TimeEntry[] = [
	{
		id: "entry-1",
		description:
			"Implemented date-range and assignee filters for reports table",
		targetId: "task-frontend-reports",
		isBillable: true,
		startedAt: "2026-02-23T09:05:00.000Z",
		endedAt: "2026-02-23T10:20:00.000Z",
		durationMinutes: 75,
	},
	{
		id: "entry-2",
		description:
			"Implemented date-range and assignee filters for reports table",
		targetId: "task-frontend-reports",
		isBillable: true,
		startedAt: "2026-02-23T10:35:00.000Z",
		endedAt: "2026-02-23T11:15:00.000Z",
		durationMinutes: 40,
	},
	{
		id: "entry-3",
		description: "Investigated timer drift after browser sleep",
		targetId: "ticket-4189",
		isBillable: true,
		startedAt: "2026-02-22T13:00:00.000Z",
		endedAt: "2026-02-22T14:30:00.000Z",
		durationMinutes: 90,
	},
	{
		id: "entry-4",
		description: "Ran QA checklist and fixed sprint blockers",
		targetId: "sprint-step-qa",
		isBillable: false,
		startedAt: "2026-02-21T12:10:00.000Z",
		endedAt: "2026-02-21T13:10:00.000Z",
		durationMinutes: 60,
	},
	{
		id: "entry-5",
		description: "Validated duplicate time-entry grouping behavior",
		targetId: "ticket-4220",
		isBillable: false,
		startedAt: "2026-02-20T15:00:00.000Z",
		endedAt: "2026-02-20T15:30:00.000Z",
		durationMinutes: 30,
	},
	{
		id: "entry-6",
		description: "Validated duplicate time-entry grouping behavior",
		targetId: "ticket-4220",
		isBillable: false,
		startedAt: "2026-02-20T15:45:00.000Z",
		endedAt: "2026-02-20T16:15:00.000Z",
		durationMinutes: 30,
	},
];

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

function buildGroupedEntries(entries: TimeEntry[]) {
	const groupedMap = new Map<string, GroupedEntries>();

	for (const entry of entries) {
		const key = `${entry.description}|${entry.targetId}|${entry.isBillable}`;
		const existingGroup = groupedMap.get(key);

		if (existingGroup) {
			existingGroup.entries.push(entry);
			existingGroup.totalMinutes += entry.durationMinutes;
			if (
				new Date(entry.startedAt).getTime() >
				new Date(existingGroup.latestStartedAt).getTime()
			) {
				existingGroup.latestStartedAt = entry.startedAt;
			}
		} else {
			groupedMap.set(key, {
				key,
				description: entry.description,
				targetId: entry.targetId,
				isBillable: entry.isBillable,
				totalMinutes: entry.durationMinutes,
				entries: [entry],
				latestStartedAt: entry.startedAt,
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
	const [description, setDescription] = useState("");
	const [targetId, setTargetId] = useState(TARGET_OPTIONS[0]?.id ?? "");
	const [isBillable, setIsBillable] = useState(true);
	const [entries, setEntries] = useState<TimeEntry[]>(INITIAL_ENTRIES);
	const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
	const [collapsedGroups, setCollapsedGroups] = useState<
		Record<string, boolean>
	>({});
	const [currentPage, setCurrentPage] = useState(1);

	const targetById = useMemo(
		() => new Map(TARGET_OPTIONS.map((target) => [target.id, target])),
		[],
	);

	const selectedTarget = targetById.get(targetId);

	const matchingTemplates = useMemo(() => {
		const query = description.trim().toLowerCase();

		if (!query) {
			return DESCRIPTION_TEMPLATES.slice(0, 4);
		}

		return DESCRIPTION_TEMPLATES.filter((template) =>
			template.description.toLowerCase().includes(query),
		).slice(0, 5);
	}, [description]);

	const groupedEntries = useMemo(() => buildGroupedEntries(entries), [entries]);
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
		if (!activeTimer) {
			setElapsedSeconds(0);
			return;
		}

		setElapsedSeconds(
			Math.floor((Date.now() - activeTimer.startedAtMs) / 1000),
		);

		const timerId = window.setInterval(() => {
			setElapsedSeconds(
				Math.floor((Date.now() - activeTimer.startedAtMs) / 1000),
			);
		}, 1000);

		return () => window.clearInterval(timerId);
	}, [activeTimer]);

	useEffect(() => {
		if (currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [currentPage, totalPages]);

	const applyTemplate = (template: DescriptionTemplate) => {
		setDescription(template.description);
		setTargetId(template.targetId);
		setIsBillable(template.isBillable);
		setIsDescriptionFocused(false);
	};

	const handleDescriptionChange = (value: string) => {
		setDescription(value);

		const exactTemplate = DESCRIPTION_TEMPLATES.find(
			(template) =>
				template.description.toLowerCase() === value.trim().toLowerCase(),
		);

		if (exactTemplate) {
			setTargetId(exactTemplate.targetId);
			setIsBillable(exactTemplate.isBillable);
		}
	};

	const handleStartTimer = () => {
		const normalizedDescription = description.trim();
		if (!normalizedDescription || !targetId) {
			return;
		}

		setActiveTimer({
			description: normalizedDescription,
			targetId,
			isBillable,
			startedAtMs: Date.now(),
		});
	};

	const handleStopTimer = () => {
		if (!activeTimer) {
			return;
		}

		const endedAtMs = Date.now();
		const startedAtMs = activeTimer.startedAtMs;
		const durationMinutes = Math.max(
			1,
			Math.round((endedAtMs - startedAtMs) / (1000 * 60)),
		);

		const newEntry: TimeEntry = {
			id: `entry-${crypto.randomUUID()}`,
			description: activeTimer.description,
			targetId: activeTimer.targetId,
			isBillable: activeTimer.isBillable,
			startedAt: new Date(startedAtMs).toISOString(),
			endedAt: new Date(endedAtMs).toISOString(),
			durationMinutes,
		};

		setEntries((previousEntries) => [newEntry, ...previousEntries]);
		setActiveTimer(null);
		setCurrentPage(1);
	};

	const handleDiscardTimer = () => {
		if (!activeTimer) {
			return;
		}
		setActiveTimer(null);
	};

	const toggleGroup = (key: string) => {
		setCollapsedGroups((previous) => ({
			...previous,
			[key]: !(previous[key] ?? false),
		}));
	};

	const timerIsRunning = activeTimer !== null;
	const canStart = description.trim().length > 0 && Boolean(targetId);

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
								{isDescriptionFocused && matchingTemplates.length > 0 && (
									<div className="absolute z-20 mt-1 max-h-52 w-full overflow-auto border border-border bg-popover shadow-sm">
										{matchingTemplates.map((template) => {
											const templateTarget = targetById.get(template.targetId);
											if (!templateTarget) return null;

											return (
												<button
													type="button"
													key={template.id}
													onMouseDown={(event) => event.preventDefault()}
													onClick={() => applyTemplate(template)}
													className="flex w-full flex-col gap-1 border-border border-b px-2.5 py-2 text-left transition-colors last:border-b-0 hover:bg-accent"
												>
													<span className="line-clamp-1 text-xs">
														{template.description}
													</span>
													<span className="text-[11px] text-muted-foreground">
														Auto-target:{" "}
														{TARGET_TYPE_LABELS[templateTarget.type]} •{" "}
														{templateTarget.title}
													</span>
												</button>
											);
										})}
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
									value={targetId}
									onChange={(event) => setTargetId(event.currentTarget.value)}
									className="h-8 w-full border border-input bg-transparent px-2.5 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
								>
									{TARGET_OPTIONS.map((target) => (
										<option
											key={target.id}
											value={target.id}
											className="bg-background text-foreground"
										>
											{TARGET_TYPE_LABELS[target.type]} • {target.title}
										</option>
									))}
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
								onClick={timerIsRunning ? handleStopTimer : handleStartTimer}
								disabled={!timerIsRunning && !canStart}
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
										disabled={!timerIsRunning}
										onClick={handleDiscardTimer}
									>
										Discard
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							{timerIsRunning && activeTimer && (
								<div className="flex items-center gap-2 text-muted-foreground text-xs">
									<CheckCircle2Icon className="size-3.5" />
									<span className="line-clamp-1">
										Running: {activeTimer.description}
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
									Project: {selectedTarget.projectName}
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
								const groupTarget = targetById.get(group.targetId);
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
														{groupTarget
															? TARGET_TYPE_LABELS[groupTarget.type]
															: "Target"}
													</Badge>
													<span className="truncate text-muted-foreground text-xs">
														{groupTarget?.title ?? "Unknown target"}
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
															new Date(b.startedAt).getTime() -
															new Date(a.startedAt).getTime(),
													)
													.map((entry) => (
														<div
															key={entry.id}
															className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-border border-b pb-2 text-xs last:border-b-0 last:pb-0"
														>
															<div className="text-muted-foreground">
																{formatDateTime(entry.startedAt)} -{" "}
																{formatDateTime(entry.endedAt)}
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
