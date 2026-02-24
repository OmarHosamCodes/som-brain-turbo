import type { DashboardEntry, GroupedEntries } from "@/types/dashboard";

export function formatTimerDuration(totalSeconds: number) {
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	return [hours, minutes, seconds]
		.map((value) => value.toString().padStart(2, "0"))
		.join(":");
}

export function formatMinutes(totalMinutes: number) {
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	if (hours === 0) return `${minutes}m`;
	if (minutes === 0) return `${hours}h`;
	return `${hours}h ${minutes}m`;
}

export function formatDateTime(isoDate: string) {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(isoDate));
}

export function toErrorMessage(error: unknown) {
	if (error instanceof Error) {
		return error.message;
	}
	return "Something went wrong.";
}

export function buildGroupedEntries(entries: DashboardEntry[]) {
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
