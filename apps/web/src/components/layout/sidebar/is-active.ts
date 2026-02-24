export function isActive(pathname: string, href: string) {
	if (href === "/dashboard") {
		return pathname === "/dashboard";
	}

	if (href === "/dashboard/settings") {
		return pathname === "/dashboard/settings";
	}

	return pathname === href || pathname.startsWith(`${href}/`);
}
