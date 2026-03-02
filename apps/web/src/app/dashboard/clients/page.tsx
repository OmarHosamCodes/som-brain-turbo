"use client";

import { useClientsCrudState } from "@som-brain-turbo/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function readText(formData: FormData, key: string) {
	const value = formData.get(key);
	return typeof value === "string" ? value : "";
}

export default function ClientsPage() {
	const {
		archiveClient,
		clients,
		clientsQuery,
		createClient,
		deleteClient,
		isBusy,
		unarchiveClient,
		updateClient,
	} = useClientsCrudState();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-bold text-3xl tracking-tight">Clients</h1>
				<p className="text-muted-foreground">
					Manage clients with create, update, archive, unarchive, and delete
					actions.
				</p>
			</div>

			<Card>
				<CardHeader className="border-border border-b">
					<CardTitle className="text-base">Create Client</CardTitle>
				</CardHeader>
				<CardContent className="pt-4">
					<form
						className="grid gap-2 md:grid-cols-2"
						onSubmit={(event) => {
							event.preventDefault();
							const formData = new FormData(event.currentTarget);
							void createClient({
								name: readText(formData, "name"),
								email: readText(formData, "email"),
								phone: readText(formData, "phone"),
								address: readText(formData, "address"),
								hourlyRate: readText(formData, "hourlyRate"),
							});
							event.currentTarget.reset();
						}}
					>
						<Input name="name" placeholder="Client Name" required />
						<Input name="email" placeholder="Email" type="email" />
						<Input name="phone" placeholder="Phone" />
						<Input
							name="hourlyRate"
							placeholder="Hourly Rate"
							type="number"
							min={0}
						/>
						<Input
							className="md:col-span-2"
							name="address"
							placeholder="Address"
						/>
						<div className="md:col-span-2">
							<Button type="submit" disabled={isBusy}>
								Create Client
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="border-border border-b">
					<CardTitle className="text-base">Clients</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 pt-4">
					{clientsQuery.isPending ? (
						<p className="text-muted-foreground text-sm">Loading clients...</p>
					) : clients.length === 0 ? (
						<p className="text-muted-foreground text-sm">No clients yet.</p>
					) : (
						clients.map((client) => (
							<div
								key={client.id}
								className="space-y-3 border border-border p-3"
							>
								<div className="flex flex-wrap items-center justify-between gap-2">
									<div className="flex flex-wrap items-center gap-2">
										<p className="font-medium text-sm">{client.name}</p>
										{client.archivedAt ? (
											<Badge variant="secondary">Archived</Badge>
										) : (
											<Badge variant="outline">Active</Badge>
										)}
									</div>
									<div className="flex flex-wrap gap-2">
										{client.archivedAt ? (
											<Button
												size="sm"
												variant="outline"
												disabled={isBusy}
												onClick={() => unarchiveClient(client.id)}
											>
												Unarchive
											</Button>
										) : (
											<Button
												size="sm"
												variant="outline"
												disabled={isBusy}
												onClick={() => archiveClient(client.id)}
											>
												Archive
											</Button>
										)}
										<Button
											size="sm"
											variant="destructive"
											disabled={isBusy}
											onClick={() => deleteClient(client.id)}
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
										void updateClient({
											id: client.id,
											name: readText(formData, "name"),
											email: readText(formData, "email"),
											phone: readText(formData, "phone"),
											address: readText(formData, "address"),
											hourlyRate: readText(formData, "hourlyRate"),
										});
									}}
								>
									<Input
										name="name"
										defaultValue={client.name}
										placeholder="Name"
									/>
									<Input
										name="email"
										defaultValue={client.email ?? ""}
										placeholder="Email"
										type="email"
									/>
									<Input
										name="phone"
										defaultValue={client.phone ?? ""}
										placeholder="Phone"
									/>
									<Input
										name="hourlyRate"
										defaultValue={client.hourlyRate?.toString() ?? ""}
										placeholder="Hourly Rate"
										type="number"
										min={0}
									/>
									<Input
										className="md:col-span-2"
										name="address"
										defaultValue={client.address ?? ""}
										placeholder="Address"
									/>
									<div className="md:col-span-2">
										<Button type="submit" size="sm" disabled={isBusy}>
											Update Client
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
