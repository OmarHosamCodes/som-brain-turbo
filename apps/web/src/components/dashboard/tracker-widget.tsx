import { useDashboardTrackerWidgetState } from "@som-brain-turbo/hooks";
import {
	CheckCircle2Icon,
	Clock3Icon,
	EllipsisVerticalIcon,
	PauseCircleIcon,
	PlayCircleIcon,
} from "lucide-react";
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
import {
	type DashboardData,
	type DashboardTarget,
	type DescriptionSuggestion,
	TARGET_TYPE_LABELS,
} from "@/types/dashboard";
import { formatTimerDuration } from "@/utils/time";

type TrackerWidgetState = Omit<
	ReturnType<typeof useDashboardTrackerWidgetState>,
	"activeEntry" | "matchingSuggestions" | "selectedTarget" | "targets"
> & {
	activeEntry: DashboardData["activeEntry"];
	matchingSuggestions: DescriptionSuggestion[];
	selectedTarget: DashboardTarget | null;
	targets: DashboardTarget[];
};

export function TrackerWidget() {
	const {
		activeEntry,
		canStart,
		description,
		elapsedSeconds,
		isBillable,
		isDescriptionFocused,
		matchingSuggestions,
		mutationBusy,
		onApplySuggestion,
		onDescriptionBlur,
		onDescriptionChange,
		onDescriptionFocus,
		onDiscard,
		onPrimaryAction,
		onTargetKeyChange,
		onToggleBillable,
		selectedTarget,
		targetKey,
		targets,
		timerIsRunning,
	} = useDashboardTrackerWidgetState() as TrackerWidgetState;

	return (
		<Card className="border-l-2 border-l-primary/30">
			<CardHeader className="border-border border-b">
				<CardTitle className="flex items-center justify-between gap-4 text-base">
					<span>Tracker Widget</span>
					<div className="flex items-center gap-2">
						<Clock3Icon className="size-3.5 text-muted-foreground" />
						<span className="font-mono text-sm tabular-nums" aria-live="polite">
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
								onDescriptionChange(event.currentTarget.value)
							}
							onFocus={onDescriptionFocus}
							onBlur={onDescriptionBlur}
							className="pr-8"
						/>
						{isDescriptionFocused && matchingSuggestions.length > 0 && (
							<div className="absolute z-20 mt-1 max-h-52 w-full overflow-auto border border-border bg-popover shadow-sm">
								{matchingSuggestions.map((suggestion) => (
									<button
										type="button"
										key={`${suggestion.description}|${suggestion.targetKey}|${suggestion.isBillable}`}
										onMouseDown={(event) => event.preventDefault()}
										onClick={() => onApplySuggestion(suggestion)}
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
											{" - "}
											{suggestion.targetTitle ?? "Unknown target"}
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
							onChange={(event) => onTargetKeyChange(event.currentTarget.value)}
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
										{TARGET_TYPE_LABELS[target.type]} - {target.title}
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
							onClick={onToggleBillable}
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
						onClick={onPrimaryAction}
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
								onClick={onDiscard}
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
	);
}
