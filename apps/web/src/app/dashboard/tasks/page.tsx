"use client";

import { useTasksCrudState } from "@som-brain-turbo/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "@/types/entities";

function readText(formData: FormData, key: string) {
	const value = formData.get(key);
	return typeof value === "string" ? value : "";
}

function readChecked(formData: FormData, key: string) {
	return formData.get(key) === "on";
}

export default function TasksPage() {
	const {
		archiveTask,
		createTask,
		deleteTask,
		isBusy,
		projects,
		tasks,
		tasksQuery,
		unarchiveTask,
		updateTask,
	} = useTasksCrudState();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-bold text-3xl tracking-tight">Tasks</h1>
				<p className="text-muted-foreground">
					Manage tasks with project mapping, priority/status, overtime settings,
					archive, and deletion.
				</p>
			</div>

			<Card>
				<CardHeader className="border-border border-b">
					<CardTitle className="text-base">Create Task</CardTitle>
				</CardHeader>
				<CardContent className="pt-4">
					<form
						className="grid gap-2 md:grid-cols-2"
						onSubmit={(event) => {
							event.preventDefault();
							const formData = new FormData(event.currentTarget);
							void createTask({
								name: readText(formData, "name"),
								description: readText(formData, "description"),
								projectId: readText(formData, "projectId"),
								status: readText(formData, "status"),
								priority: readText(formData, "priority"),
								estimate: readText(formData, "estimate"),
								links: readText(formData, "links"),
								completionPercentage: readText(
									formData,
									"completionPercentage",
								),
								allowedOvertime: readText(formData, "allowedOvertime"),
								unlimitedOvertime: readChecked(formData, "unlimitedOvertime"),
							});
							event.currentTarget.reset();
						}}
					>
						<Input name="name" placeholder="Task Name" required />
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
							defaultValue="not_started"
							className="h-8 border border-input bg-background px-2.5 text-sm"
						>
							{TASK_STATUS_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						<select
							name="priority"
							defaultValue="normal"
							className="h-8 border border-input bg-background px-2.5 text-sm"
						>
							{TASK_PRIORITY_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						<Input
							name="estimate"
							placeholder="Estimate (minutes)"
							type="number"
							min={0}
						/>
						<Input
							name="completionPercentage"
							placeholder="Completion %"
							type="number"
							min={0}
							max={100}
						/>
						<Input
							name="allowedOvertime"
							placeholder="Allowed Overtime (seconds)"
							type="number"
							min={0}
						/>
						<Input name="links" placeholder="Related links" />
						<Input
							className="md:col-span-2"
							name="description"
							placeholder="Description"
						/>
						<label className="flex items-center gap-2 border border-input px-2.5 text-sm md:col-span-2">
							<input name="unlimitedOvertime" type="checkbox" />
							Unlimited overtime
						</label>
						<div className="md:col-span-2">
							<Button type="submit" disabled={isBusy || projects.length === 0}>
								Create Task
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="border-border border-b">
					<CardTitle className="text-base">Tasks</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 pt-4">
					{tasksQuery.isPending ? (
						<p className="text-muted-foreground text-sm">Loading tasks...</p>
					) : tasks.length === 0 ? (
						<p className="text-muted-foreground text-sm">No tasks yet.</p>
					) : (
						tasks.map((task) => (
							<div key={task.id} className="space-y-3 border border-border p-3">
								<div className="flex flex-wrap items-center justify-between gap-2">
									<div className="flex flex-wrap items-center gap-2">
										<p className="font-medium text-sm">{task.name}</p>
										{task.archivedAt ? (
											<Badge variant="secondary">Archived</Badge>
										) : (
											<Badge variant="outline">Active</Badge>
										)}
										<Badge variant="outline">{task.status}</Badge>
										<Badge variant="secondary">{task.priority}</Badge>
									</div>
									<div className="flex flex-wrap gap-2">
										{task.archivedAt ? (
											<Button
												size="sm"
												variant="outline"
												disabled={isBusy}
												onClick={() => unarchiveTask(task.id)}
											>
												Unarchive
											</Button>
										) : (
											<Button
												size="sm"
												variant="outline"
												disabled={isBusy}
												onClick={() => archiveTask(task.id)}
											>
												Archive
											</Button>
										)}
										<Button
											size="sm"
											variant="destructive"
											disabled={isBusy}
											onClick={() => deleteTask(task.id)}
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
										void updateTask({
											id: task.id,
											name: readText(formData, "name"),
											description: readText(formData, "description"),
											projectId: readText(formData, "projectId"),
											status: readText(formData, "status"),
											priority: readText(formData, "priority"),
											estimate: readText(formData, "estimate"),
											links: readText(formData, "links"),
											completionPercentage: readText(
												formData,
												"completionPercentage",
											),
											allowedOvertime: readText(formData, "allowedOvertime"),
											unlimitedOvertime: readChecked(
												formData,
												"unlimitedOvertime",
											),
										});
									}}
								>
									<Input
										name="name"
										defaultValue={task.name}
										placeholder="Task Name"
									/>
									<select
										name="projectId"
										defaultValue={task.projectId.toString()}
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
										defaultValue={task.status}
										className="h-8 border border-input bg-background px-2.5 text-sm"
									>
										{TASK_STATUS_OPTIONS.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
									<select
										name="priority"
										defaultValue={task.priority}
										className="h-8 border border-input bg-background px-2.5 text-sm"
									>
										{TASK_PRIORITY_OPTIONS.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
									<Input
										name="estimate"
										defaultValue={task.estimate?.toString() ?? ""}
										placeholder="Estimate (minutes)"
										type="number"
										min={0}
									/>
									<Input
										name="completionPercentage"
										defaultValue={task.completionPercentage.toString()}
										placeholder="Completion %"
										type="number"
										min={0}
										max={100}
									/>
									<Input
										name="allowedOvertime"
										defaultValue={task.allowedOvertime?.toString() ?? ""}
										placeholder="Allowed Overtime (seconds)"
										type="number"
										min={0}
									/>
									<Input
										name="links"
										defaultValue={task.links ?? ""}
										placeholder="Related links"
									/>
									<Input
										className="md:col-span-2"
										name="description"
										defaultValue={task.description ?? ""}
										placeholder="Description"
									/>
									<label className="flex items-center gap-2 border border-input px-2.5 text-sm md:col-span-2">
										<input
											name="unlimitedOvertime"
											type="checkbox"
											defaultChecked={task.unlimitedOvertime}
										/>
										Unlimited overtime
									</label>
									<div className="text-muted-foreground text-xs md:col-span-2">
										Project: {task.projectName}
									</div>
									<div className="md:col-span-2">
										<Button type="submit" size="sm" disabled={isBusy}>
											Update Task
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
