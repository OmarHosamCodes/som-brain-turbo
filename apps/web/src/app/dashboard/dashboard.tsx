"use client";

import { usePrivateDataQuery } from "@som-brain-turbo/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
	const privateData = usePrivateDataQuery();

	return (
		<div className="space-y-4">
			<div>
				<h1 className="font-semibold text-2xl">Dashboard</h1>
				<p className="text-muted-foreground text-sm">Welcome back. Here is your current workspace overview.</p>
			</div>
			<Card>
				<CardHeader>
					<CardTitle className="text-base">API Status</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm">{privateData.isLoading ? "Loading..." : `API: ${privateData.data?.message ?? "Unavailable"}`}</p>
				</CardContent>
			</Card>
		</div>
	);
}
