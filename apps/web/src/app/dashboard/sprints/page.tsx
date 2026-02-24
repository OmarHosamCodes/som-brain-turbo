import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Sprints",
	description: "Manage your sprints",
};

export default function SprintsPage() {
	return (
		<div className="flex flex-col gap-8">
			<div>
				<h1 className="font-bold text-3xl tracking-tight">Sprints</h1>
				<p className="text-muted-foreground">Manage and track your sprints</p>
			</div>

			<div className="rounded-lg border border-muted border-dashed p-8 text-center">
				<p className="text-muted-foreground">Sprints content coming soon...</p>
			</div>
		</div>
	);
}
