import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type GroupedEntries, TARGET_TYPE_LABELS } from "@/types/dashboard";
import { formatDateTime, formatMinutes } from "./dashboard.utils";

interface TimeEntriesSectionProps {
	currentPage: number;
	totalPages: number;
	paginatedGroups: GroupedEntries[];
	collapsedGroups: Record<string, boolean>;
	onToggleGroup: (key: string) => void;
	onPreviousPage: () => void;
	onNextPage: () => void;
}

export function TimeEntriesSection({
	currentPage,
	totalPages,
	paginatedGroups,
	collapsedGroups,
	onToggleGroup,
	onPreviousPage,
	onNextPage,
}: TimeEntriesSectionProps) {
	return (
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
					<p className="text-muted-foreground text-sm">No time entries yet.</p>
				) : (
					paginatedGroups.map((group) => {
						const collapsed = collapsedGroups[group.key] ?? false;

						return (
							<div key={group.key} className="border border-border bg-card/60">
								<button
									type="button"
									onClick={() => onToggleGroup(group.key)}
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
							onClick={onPreviousPage}
						>
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={currentPage >= totalPages}
							onClick={onNextPage}
						>
							Next
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
