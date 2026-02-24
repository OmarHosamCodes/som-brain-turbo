"use client";

import type { ReactNode } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

interface DashboardShellProps {
	children: ReactNode;
	user: {
		name?: string | null;
		email: string;
	};
}

export function DashboardShell({ children, user }: DashboardShellProps) {
	return (
		<div className="flex h-screen bg-background text-foreground">
			<Sidebar />
			<div className="flex min-w-0 flex-1 flex-col">
				<Header user={user} />
				<main className="min-h-0 flex-1 overflow-auto p-4 md:p-6">
					{children}
				</main>
			</div>
		</div>
	);
}
