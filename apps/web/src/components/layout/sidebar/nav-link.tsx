import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/layout";
import { isActive } from "./is-active";

interface NavLinkProps {
	item: NavItem;
	pathname: string;
	collapsed: boolean;
}

export function NavLink({ item, pathname, collapsed }: NavLinkProps) {
	const active = isActive(pathname, item.href);

	return (
		<li>
			<a
				className={cn(
					"flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-sm transition-colors",
					collapsed && "justify-center px-0",
					active
						? "bg-primary/10 text-primary"
						: "text-muted-foreground hover:bg-muted hover:text-foreground",
				)}
				href={item.href}
				title={collapsed ? item.label : undefined}
			>
				{item.icon}
				{!collapsed ? <span>{item.label}</span> : null}
			</a>
		</li>
	);
}
