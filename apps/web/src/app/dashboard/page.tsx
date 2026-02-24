"use client";

import { useDashboardPageStatus } from "@som-brain-turbo/hooks";
import { TimeEntriesSection } from "@/components/dashboard/time-entries-section";
import { TrackerWidget } from "@/components/dashboard/tracker-widget";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
	const { errorMessage, isError, isPending, retry } = useDashboardPageStatus();

	if (isPending) {
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

	if (isError) {
		return (
			<div className="space-y-4">
				<h1 className="font-semibold text-2xl">Time Tracker</h1>
				<Card>
					<CardContent className="space-y-3 pt-4">
						<p className="text-destructive text-sm">{errorMessage}</p>
						<Button variant="outline" onClick={retry}>
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
				<TrackerWidget />
			</section>

			<section>
				<TimeEntriesSection />
			</section>
		</div>
	);
}
