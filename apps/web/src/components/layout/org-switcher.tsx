"use client";

import { useOrgSwitcherState } from "@som-brain-turbo/hooks";
import { Building2Icon, CheckIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function OrgSwitcher() {
	const {
		activeOrganization,
		activeOrganizationId,
		organizations,
		organizationsQuery,
		selectOrganization,
	} = useOrgSwitcherState();

	if (organizationsQuery.isPending) {
		return (
			<Button variant="outline" className="gap-2" disabled>
				<Building2Icon className="size-4" />
				<span className="max-w-44 truncate">Loading workspace...</span>
			</Button>
		);
	}

	if (organizations.length === 0) {
		return (
			<Button variant="outline" className="gap-2" disabled>
				<Building2Icon className="size-4" />
				<span className="max-w-44 truncate">No workspace</span>
			</Button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={<Button variant="outline" className="gap-2" />}
			>
				<Building2Icon className="size-4" />
				<span className="max-w-44 truncate">
					{activeOrganization?.name ?? "Workspace"}
				</span>
				<ChevronDownIcon className="size-4" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-56 bg-card">
				<DropdownMenuGroup>
					{organizations.map((organization) => {
						const organizationId = String(organization.id);
						return (
							<DropdownMenuItem
								className="flex items-center gap-2"
								key={organization.id}
								onClick={() => selectOrganization(organizationId)}
							>
								<span className="flex-1">{organization.name}</span>
								{organizationId === activeOrganizationId ? (
									<CheckIcon className="size-4 text-primary" />
								) : null}
							</DropdownMenuItem>
						);
					})}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
