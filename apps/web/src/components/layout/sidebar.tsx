"use client";

import { ChevronDownIcon, ChevronLeftIcon, ClockIcon, PanelLeftIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { navGroups, settingsItems } from "./sidebar/data";
import { NavLink } from "./sidebar/nav-link";
import { NavSection } from "./sidebar/nav-section";

export function Sidebar() {
	const pathname = usePathname();
	const [collapsed, setCollapsed] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(pathname.startsWith("/dashboard/settings"));

	return (
		<aside
			className={cn(
				"hidden h-full shrink-0 flex-col border-border border-r bg-card transition-[width] duration-200 md:flex",
				collapsed ? "w-16" : "w-64",
			)}
		>
			<div className="flex h-16 items-center justify-between border-border border-b px-4">
				{!collapsed ? (
					<Link className="flex items-center gap-2" href="/dashboard">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
							<ClockIcon className="size-4 text-primary-foreground" />
						</div>
						<span className="font-semibold text-foreground text-lg">SomBrain</span>
					</Link>
				) : null}
				<Button
					className={cn("size-8 p-0", collapsed ? "mx-auto" : "")}
					onClick={() => setCollapsed((value) => !value)}
					size="sm"
					variant="ghost"
				>
					{collapsed ? <PanelLeftIcon className="size-4" /> : <ChevronLeftIcon className="size-4" />}
				</Button>
			</div>

			<nav className="flex-1 overflow-y-auto p-3">
				<div className="space-y-4">
					{navGroups.map((group) => (
						<NavSection collapsed={collapsed} group={group} key={group.label} pathname={pathname} />
					))}
				</div>

				<div className="mt-6 border-border border-t pt-4">
					{collapsed ? (
						<ul className="space-y-1">
							{settingsItems.map((item) => (
								<NavLink collapsed item={item} key={item.href} pathname={pathname} />
							))}
						</ul>
					) : (
						<div>
							<button
								className="flex w-full items-center justify-between px-3 py-1.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider hover:text-foreground"
								onClick={() => setSettingsOpen((value) => !value)}
								type="button"
							>
								<span>Settings</span>
								<ChevronDownIcon className={cn("size-3.5 transition-transform", !settingsOpen && "-rotate-90")} />
							</button>
							{settingsOpen ? (
								<ul className="mt-1 space-y-0.5">
									{settingsItems.map((item) => (
										<NavLink collapsed={false} item={item} key={item.href} pathname={pathname} />
									))}
								</ul>
							) : null}
						</div>
					)}
				</div>
			</nav>
		</aside>
	);
}
