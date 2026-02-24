import type { DashboardEntry, GroupedEntries } from "@/types/dashboard";

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
