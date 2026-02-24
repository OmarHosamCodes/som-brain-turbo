import { auth } from "@som-brain-turbo/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/layout";

export default async function DashboardLayout({
	children,
}: {
	children: ReactNode;
}) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/auth");
	}

	return (
		<DashboardShell
			user={{
				email: session.user.email,
				name: session.user.name,
			}}
		>
			{children}
		</DashboardShell>
	);
}
