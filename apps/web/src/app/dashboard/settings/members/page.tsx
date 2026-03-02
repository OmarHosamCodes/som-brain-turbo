"use client";

import { useMembersCrudState } from "@som-brain-turbo/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function readText(formData: FormData, key: string) {
	const value = formData.get(key);
	return typeof value === "string" ? value : "";
}

export default function MembersPage() {
	const { inviteMemberByEmail, isBusy, members, membersQuery } =
		useMembersCrudState();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="font-bold text-3xl tracking-tight">Members</h1>
				<p className="text-muted-foreground">
					Add existing users to this workspace by email and review current
					members.
				</p>
			</div>

			<Card>
				<CardHeader className="border-border border-b">
					<CardTitle className="text-base">Add Member By Email</CardTitle>
				</CardHeader>
				<CardContent className="pt-4">
					<form
						className="flex flex-col gap-2 sm:flex-row"
						onSubmit={(event) => {
							event.preventDefault();
							const formData = new FormData(event.currentTarget);
							void inviteMemberByEmail({
								email: readText(formData, "email"),
							});
							event.currentTarget.reset();
						}}
					>
						<Input
							name="email"
							placeholder="name@company.com"
							type="email"
							required
						/>
						<Button type="submit" disabled={isBusy}>
							Add Member
						</Button>
					</form>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="border-border border-b">
					<CardTitle className="text-base">Workspace Members</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 pt-4">
					{membersQuery.isPending ? (
						<p className="text-muted-foreground text-sm">Loading members...</p>
					) : members.length === 0 ? (
						<p className="text-muted-foreground text-sm">
							No members in this workspace.
						</p>
					) : (
						members.map((member) => (
							<div
								key={member.id}
								className="flex flex-col gap-3 border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
							>
								<div className="space-y-1">
									<p className="font-medium text-sm">{member.name}</p>
									<p className="text-muted-foreground text-xs">
										{member.email}
									</p>
									<p className="text-muted-foreground text-xs">
										Joined {new Date(member.createdAt).toLocaleDateString()}
									</p>
								</div>
								<div className="flex flex-wrap gap-2">
									<Badge
										variant={member.role === "owner" ? "default" : "outline"}
									>
										{member.role}
									</Badge>
									<Badge variant="secondary">{member.subType}</Badge>
								</div>
							</div>
						))
					)}
				</CardContent>
			</Card>
		</div>
	);
}
