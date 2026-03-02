"use client";

import { useSprintsCrudState } from "@som-brain-turbo/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SPRINT_STATUS_OPTIONS } from "@/types/entities";

function readText(formData: FormData, key: string) {
	const value = formData.get(key);
	return typeof value === "string" ? value : "";
}

export default function SprintsPage() {
	const {
		archiveSprint,
		createSprint,
		deleteSprint,
		isBusy,
		projects,
		sprints,
		sprintsQuery,
		unarchiveSprint,
		updateSprint,
	} = useSprintsCrudState();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-bold text-3xl tracking-tight">Sprints</h1>
				<p className="text-muted-foreground">
					Manage sprint lifecycle, project assignment, archive state, and
					deletion.
				</p>
			</div>

			<Card>
				<CardHeader className="border-border border-b">
					<CardTitle className="text-base">Create Sprint</CardTitle>
				</CardHeader>
				<CardContent className="pt-4">
					<form
						className="grid gap-2 md:grid-cols-2"
						onSubmit={(event) => {
							event.preventDefault();
							const formData = new FormData(event.currentTarget);
							void createSprint({
								name: readText(formData, "name"),
								description: readText(formData, "description"),
								projectId: readText(formData, "projectId"),
								status: readText(formData, "status"),
							});
							event.currentTarget.reset();
						}}
					>
						<Input name="name" placeholder="Sprint Name" required />
						<select
							name="projectId"
							required
							className="h-8 border border-input bg-background px-2.5 text-sm"
						>
							<option value="">Select Project</option>
							{projects.map((project) => (
								<option key={project.id} value={project.id}>
									{project.name}
								</option>
							))}
						</select>
						<select
							name="status"
							defaultValue="draft"
							className="h-8 border border-input bg-background px-2.5 text-sm"
						>
							{SPRINT_STATUS_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						<Input name="description" placeholder="Description" />
						<div className="md:col-span-2">
							<Button type="submit" disabled={isBusy || projects.length === 0}>
								Create Sprint
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="border-border border-b">
					<CardTitle className="text-base">Sprints</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 pt-4">
					{sprintsQuery.isPending ? (
						<p className="text-muted-foreground text-sm">Loading sprints...</p>
					) : sprints.length === 0 ? (
						<p className="text-muted-foreground text-sm">No sprints yet.</p>
					) : (
						sprints.map((sprint) => (
							<div
								key={sprint.id}
								className="space-y-3 border border-border p-3"
							>
								<div className="flex flex-wrap items-center justify-between gap-2">
									<div className="flex flex-wrap items-center gap-2">
										<p className="font-medium text-sm">{sprint.name}</p>
										{sprint.archivedAt ? (
											<Badge variant="secondary">Archived</Badge>
										) : (
											<Badge variant="outline">Active</Badge>
										)}
										<Badge variant="secondary">{sprint.status}</Badge>
									</div>
									<div className="flex flex-wrap gap-2">
										{sprint.archivedAt ? (
											<Button
												size="sm"
												variant="outline"
												disabled={isBusy}
												onClick={() => unarchiveSprint(sprint.id)}
											>
												Unarchive
											</Button>
										) : (
											<Button
												size="sm"
												variant="outline"
												disabled={isBusy}
												onClick={() => archiveSprint(sprint.id)}
											>
												Archive
											</Button>
										)}
										<Button
											size="sm"
											variant="destructive"
											disabled={isBusy}
											onClick={() => deleteSprint(sprint.id)}
										>
											Delete
										</Button>
									</div>
								</div>

								<form
									className="grid gap-2 md:grid-cols-2"
									onSubmit={(event) => {
										event.preventDefault();
										const formData = new FormData(event.currentTarget);
										void updateSprint({
											id: sprint.id,
											name: readText(formData, "name"),
											description: readText(formData, "description"),
											projectId: readText(formData, "projectId"),
											status: readText(formData, "status"),
										});
									}}
								>
									<Input
										name="name"
										defaultValue={sprint.name}
										placeholder="Sprint Name"
									/>
									<select
										name="projectId"
										defaultValue={sprint.projectId.toString()}
										className="h-8 border border-input bg-background px-2.5 text-sm"
									>
										{projects.map((project) => (
											<option key={project.id} value={project.id}>
												{project.name}
											</option>
										))}
									</select>
									<select
										name="status"
										defaultValue={sprint.status}
										className="h-8 border border-input bg-background px-2.5 text-sm"
									>
										{SPRINT_STATUS_OPTIONS.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
									<Input
										name="description"
										defaultValue={sprint.description ?? ""}
										placeholder="Description"
									/>
									<div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs md:col-span-2">
										<span>Project: {sprint.projectName}</span>
										{sprint.startedAt ? <span>Started</span> : null}
										{sprint.completedAt ? <span>Completed</span> : null}
									</div>
									<div className="md:col-span-2">
										<Button type="submit" size="sm" disabled={isBusy}>
											Update Sprint
										</Button>
									</div>
								</form>
							</div>
						))
					)}
				</CardContent>
			</Card>
		</div>
	);
}
