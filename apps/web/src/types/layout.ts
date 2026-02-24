import type { ReactNode } from "react";

export interface NavItem {
	href: string;
	label: string;
	icon: ReactNode;
}

export interface NavGroup {
	label: string;
	items: NavItem[];
	defaultOpen?: boolean;
}
