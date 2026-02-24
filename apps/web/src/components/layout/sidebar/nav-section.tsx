"use client";

import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { NavGroup } from "@/types/layout";
import { NavLink } from "./nav-link";

interface NavSectionProps {
	group: NavGroup;
	pathname: string;
	collapsed: boolean;
}

export function NavSection({ group, pathname, collapsed }: NavSectionProps) {
	const [open, setOpen] = useState(group.defaultOpen ?? true);

	if (collapsed) {
		return (
			<ul className="space-y-1">
				{group.items.map((item) => (
					<NavLink collapsed item={item} key={item.href} pathname={pathname} />
				))}
			</ul>
		);
	}

	return (
		<div>
			<button
				className="flex w-full items-center justify-between px-3 py-1.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider hover:text-foreground"
				onClick={() => setOpen((value) => !value)}
				type="button"
			>
				<span>{group.label}</span>
				<ChevronDownIcon
					className={cn("size-3.5 transition-transform", !open && "-rotate-90")}
				/>
			</button>
			{open ? (
				<ul className="mt-1 space-y-0.5">
					{group.items.map((item) => (
						<NavLink
							collapsed={false}
							item={item}
							key={item.href}
							pathname={pathname}
						/>
					))}
				</ul>
			) : null}
		</div>
	);
}
