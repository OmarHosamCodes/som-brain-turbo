"use client";

import { useSidebarState } from "@som-brain-turbo/hooks";
import {
	ChevronDownIcon,
	ChevronLeftIcon,
	ClockIcon,
	PanelLeftIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/layout";
import { navGroups, settingsItems } from "./sidebar/data";
import { isActive } from "./sidebar/is-active";

export function Sidebar() {
	const pathname = usePathname();
	const {
		collapsed,
		settingsOpen,
		isSectionOpen,
		toggleCollapsed,
		toggleSettingsOpen,
		toggleSectionOpen,
	} = useSidebarState();
	const shouldShowSettings =
		settingsOpen || pathname.startsWith("/dashboard/settings");

	const renderNavItem = (item: NavItem, isCollapsed: boolean) => {
		const active = isActive(pathname, item.href);

		return (
			<li key={item.href}>
				<a
					className={cn(
						"flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-sm transition-colors",
						isCollapsed && "justify-center px-0",
						active
							? "bg-primary/10 text-primary"
							: "text-muted-foreground hover:bg-muted hover:text-foreground",
					)}
					href={item.href}
					title={isCollapsed ? item.label : undefined}
				>
					{item.icon}
					{!isCollapsed ? <span>{item.label}</span> : null}
				</a>
			</li>
		);
	};

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
						<span className="font-semibold text-foreground text-lg">
							SomBrain
						</span>
					</Link>
				) : null}
				<Button
					className={cn("size-8 p-0", collapsed ? "mx-auto" : "")}
					onClick={() => toggleCollapsed()}
					size="sm"
					variant="ghost"
				>
					{collapsed ? (
						<PanelLeftIcon className="size-4" />
					) : (
						<ChevronLeftIcon className="size-4" />
					)}
				</Button>
			</div>

			<nav className="flex-1 overflow-y-auto p-3">
				<div className="space-y-4">
					{navGroups.map((group) => {
						const sectionOpen = isSectionOpen(
							group.label,
							group.defaultOpen ?? true,
						);

						if (collapsed) {
							return (
								<ul className="space-y-1" key={group.label}>
									{group.items.map((item) => renderNavItem(item, true))}
								</ul>
							);
						}

						return (
							<div key={group.label}>
								<button
									className="flex w-full items-center justify-between px-3 py-1.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider hover:text-foreground"
									onClick={() =>
										toggleSectionOpen(group.label, group.defaultOpen ?? true)
									}
									type="button"
								>
									<span>{group.label}</span>
									<ChevronDownIcon
										className={cn(
											"size-3.5 transition-transform",
											!sectionOpen && "-rotate-90",
										)}
									/>
								</button>
								{sectionOpen ? (
									<ul className="mt-1 space-y-0.5">
										{group.items.map((item) => renderNavItem(item, false))}
									</ul>
								) : null}
							</div>
						);
					})}
				</div>

				<div className="mt-6 border-border border-t pt-4">
					{collapsed ? (
						<ul className="space-y-1">
							{settingsItems.map((item) => renderNavItem(item, true))}
						</ul>
					) : (
						<div>
							<button
								className="flex w-full items-center justify-between px-3 py-1.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider hover:text-foreground"
								onClick={() => toggleSettingsOpen()}
								type="button"
							>
								<span>Settings</span>
								<ChevronDownIcon
									className={cn(
										"size-3.5 transition-transform",
										!shouldShowSettings && "-rotate-90",
									)}
								/>
							</button>
							{shouldShowSettings ? (
								<ul className="mt-1 space-y-0.5">
									{settingsItems.map((item) => renderNavItem(item, false))}
								</ul>
							) : null}
						</div>
					)}
				</div>
			</nav>
		</aside>
	);
}
