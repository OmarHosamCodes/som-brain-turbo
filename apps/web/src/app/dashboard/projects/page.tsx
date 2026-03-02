"use client";

import { useProjectsCrudState } from "@som-brain-turbo/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function readText(formData: FormData, key: string) {
	const value = formData.get(key);
	return typeof value === "string" ? value : "";
}

function readChecked(formData: FormData, key: string) {
	return formData.get(key) === "on";
}

export default function ProjectsPage() {
	const {
		archiveProject,
		clients,
		createProject,
		deleteProject,
		isBusy,
		projects,
		projectsQuery,
		unarchiveProject,
		updateProject,
	} = useProjectsCrudState();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-bold text-3xl tracking-tight">Projects</h1>
				<p className="text-muted-foreground">
					Manage projects with client assignment, billing settings, archive, and
					delete workflows.
				</p>
			</div>

			<Card>
				<CardHeader className="border-border border-b">
					<CardTitle className="text-base">Create Project</CardTitle>
				</CardHeader>
				<CardContent className="pt-4">
					<form
						className="grid gap-2 md:grid-cols-2"
						onSubmit={(event) => {
							event.preventDefault();
							const formData = new FormData(event.currentTarget);
							void createProject({
								name: readText(formData, "name"),
								color: readText(formData, "color") || "#6366f1",
								isBillable: readChecked(formData, "isBillable"),
								hourlyRate: readText(formData, "hourlyRate"),
								clientId: readText(formData, "clientId"),
							});
							event.currentTarget.reset();
						}}
					>
						<Input name="name" placeholder="Project Name" required />
						<div className="flex items-center gap-2 border border-input px-2.5">
							<label htmlFor="create-project-color" className="text-xs">
								Color
							</label>
							<input
								id="create-project-color"
								name="color"
								type="color"
								defaultValue="#6366f1"
								className="h-8 w-full bg-transparent"
							/>
						</div>
						<select
							name="clientId"
							className="h-8 border border-input bg-background px-2.5 text-sm"
						>
							<option value="">No Client</option>
							{clients.map((client) => (
								<option key={client.id} value={client.id}>
									{client.name}
								</option>
							))}
						</select>
						<Input
							name="hourlyRate"
							placeholder="Hourly Rate"
							type="number"
							min={0}
						/>
						<label className="flex items-center gap-2 border border-input px-2.5 text-sm md:col-span-2">
							<input name="isBillable" type="checkbox" />
							Billable project
						</label>
						<div className="md:col-span-2">
							<Button type="submit" disabled={isBusy}>
								Create Project
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="border-border border-b">
					<CardTitle className="text-base">Projects</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 pt-4">
					{projectsQuery.isPending ? (
						<p className="text-muted-foreground text-sm">Loading projects...</p>
					) : projects.length === 0 ? (
						<p className="text-muted-foreground text-sm">No projects yet.</p>
					) : (
						projects.map((project) => (
							<div
								key={project.id}
								className="space-y-3 border border-border p-3"
							>
								<div className="flex flex-wrap items-center justify-between gap-2">
									<div className="flex flex-wrap items-center gap-2">
										<p className="font-medium text-sm">{project.name}</p>
										{project.archivedAt ? (
											<Badge variant="secondary">Archived</Badge>
										) : (
											<Badge variant="outline">Active</Badge>
										)}
										<Badge
											variant={project.isBillable ? "default" : "secondary"}
										>
											{project.isBillable ? "Billable" : "Non-billable"}
										</Badge>
									</div>
									<div className="flex flex-wrap gap-2">
										{project.archivedAt ? (
											<Button
												size="sm"
												variant="outline"
												disabled={isBusy}
												onClick={() => unarchiveProject(project.id)}
											>
												Unarchive
											</Button>
										) : (
											<Button
												size="sm"
												variant="outline"
												disabled={isBusy}
												onClick={() => archiveProject(project.id)}
											>
												Archive
											</Button>
										)}
										<Button
											size="sm"
											variant="destructive"
											disabled={isBusy}
											onClick={() => deleteProject(project.id)}
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
										void updateProject({
											id: project.id,
											name: readText(formData, "name"),
											color: readText(formData, "color") || "#6366f1",
											isBillable: readChecked(formData, "isBillable"),
											hourlyRate: readText(formData, "hourlyRate"),
											clientId: readText(formData, "clientId"),
										});
									}}
								>
									<Input
										name="name"
										defaultValue={project.name}
										placeholder="Project Name"
									/>
									<div className="flex items-center gap-2 border border-input px-2.5">
										<label
											htmlFor={`project-color-${project.id}`}
											className="text-xs"
										>
											Color
										</label>
										<input
											id={`project-color-${project.id}`}
											name="color"
											type="color"
											defaultValue={project.color ?? "#6366f1"}
											className="h-8 w-full bg-transparent"
										/>
									</div>
									<select
										name="clientId"
										defaultValue={project.clientId?.toString() ?? ""}
										className="h-8 border border-input bg-background px-2.5 text-sm"
									>
										<option value="">No Client</option>
										{clients.map((client) => (
											<option key={client.id} value={client.id}>
												{client.name}
											</option>
										))}
									</select>
									<Input
										name="hourlyRate"
										defaultValue={project.hourlyRate?.toString() ?? ""}
										placeholder="Hourly Rate"
										type="number"
										min={0}
									/>
									<label className="flex items-center gap-2 border border-input px-2.5 text-sm md:col-span-2">
										<input
											name="isBillable"
											type="checkbox"
											defaultChecked={project.isBillable}
										/>
										Billable project
									</label>
									<div className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs md:col-span-2">
										<span>Client: {project.clientName ?? "None"}</span>
									</div>
									<div className="md:col-span-2">
										<Button type="submit" size="sm" disabled={isBusy}>
											Update Project
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
