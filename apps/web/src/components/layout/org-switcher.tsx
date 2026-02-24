"use client";

import { queryClient, trpc } from "@som-brain-turbo/hooks";
import { useQuery } from "@tanstack/react-query";
import { Building2Icon, CheckIcon, ChevronDownIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ACTIVE_ORG_STORAGE_KEY = "active-org-id";

function persistActiveOrg(activeOrgId: string) {
	window.localStorage.setItem(ACTIVE_ORG_STORAGE_KEY, activeOrgId);
}

export function OrgSwitcher() {
	const organizationsQuery = useQuery(
		trpc.workspace.organizations.queryOptions(),
	);
	const organizations = organizationsQuery.data ?? [];
	const [activeOrgId, setActiveOrgId] = useState("");

	useEffect(() => {
		const storedActiveOrgId = window.localStorage.getItem(
			ACTIVE_ORG_STORAGE_KEY,
		);
		if (storedActiveOrgId) {
			setActiveOrgId(storedActiveOrgId);
		}
	}, []);

	useEffect(() => {
		if (organizations.length === 0) {
			if (activeOrgId !== "") {
				setActiveOrgId("");
			}
			return;
		}

		const hasActiveOrg = organizations.some(
			(organization) => String(organization.id) === activeOrgId,
		);

		if (hasActiveOrg) {
			return;
		}

		const storedActiveOrgId = window.localStorage.getItem(
			ACTIVE_ORG_STORAGE_KEY,
		);
		const nextActiveOrgId = organizations.find(
			(organization) => String(organization.id) === storedActiveOrgId,
		)
			? storedActiveOrgId
			: String(organizations[0]?.id ?? "");

		if (!nextActiveOrgId) {
			return;
		}

		setActiveOrgId(nextActiveOrgId);
		persistActiveOrg(nextActiveOrgId);
	}, [activeOrgId, organizations]);

	const activeOrg = useMemo(
		() =>
			organizations.find(
				(organization) => String(organization.id) === activeOrgId,
			) ?? null,
		[activeOrgId, organizations],
	);

	const handleOrgSelect = (organizationId: string) => {
		setActiveOrgId(organizationId);
		persistActiveOrg(organizationId);
		void queryClient.invalidateQueries();
	};

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
					{activeOrg?.name ?? "Workspace"}
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
								onClick={() => handleOrgSelect(organizationId)}
							>
								<span className="flex-1">{organization.name}</span>
								{organizationId === activeOrgId ? (
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
