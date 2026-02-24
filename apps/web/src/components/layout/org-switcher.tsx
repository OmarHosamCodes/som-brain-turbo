"use client";

import { Building2Icon, CheckIcon, ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const ORGS = [
	{ id: "personal", name: "Personal Workspace" },
	{ id: "team", name: "Team Workspace" },
] as const;

export function OrgSwitcher() {
	const [activeOrgId, setActiveOrgId] = useState<(typeof ORGS)[number]["id"]>(
		"personal",
	);
	const activeOrg = ORGS.find((org) => org.id === activeOrgId) ?? ORGS[0];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Button variant="outline" className="gap-2" />}>
				<Building2Icon className="size-4" />
				<span className="max-w-44 truncate">{activeOrg.name}</span>
				<ChevronDownIcon className="size-4" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-56 bg-card">
				<DropdownMenuGroup>
					{ORGS.map((org) => (
						<DropdownMenuItem
							className="flex items-center gap-2"
							key={org.id}
							onClick={() => setActiveOrgId(org.id)}
						>
							<span className="flex-1">{org.name}</span>
							{org.id === activeOrgId ? <CheckIcon className="size-4 text-primary" /> : null}
						</DropdownMenuItem>
					))}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
