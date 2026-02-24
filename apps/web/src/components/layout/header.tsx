"use client";

import { authClient } from "@som-brain-turbo/hooks";
import { LogOutIcon, SettingsIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrgSwitcher } from "./org-switcher";

interface HeaderProps {
	user: {
		name?: string | null;
		email: string;
	};
}

export function Header({ user }: HeaderProps) {
	const router = useRouter();

	const userName = user.name?.trim() || user.email;
	const userInitial = userName.charAt(0).toUpperCase();

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push("/auth");
	};

	return (
		<header className="flex h-16 items-center justify-between border-border border-b bg-card px-4 md:px-6">
			<div className="flex items-center gap-3 md:gap-4">
				<OrgSwitcher />
			</div>

			<div className="flex items-center gap-2 md:gap-4">
				<ModeToggle />
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<Button className="flex items-center gap-2 p-1" variant="ghost" />
						}
					>
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-medium text-primary text-sm">
							{userInitial}
						</div>
						<span className="hidden max-w-48 truncate font-medium text-foreground text-sm sm:block">
							{userName}
						</span>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-56 bg-card">
						<DropdownMenuGroup>
							<DropdownMenuLabel className="font-normal">
								<div className="flex flex-col gap-1">
									<p className="font-medium text-sm">{userName}</p>
									<p className="truncate text-muted-foreground text-xs">
										{user.email}
									</p>
								</div>
							</DropdownMenuLabel>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => window.location.assign("/settings")}
						>
							<SettingsIcon className="size-4" />
							Settings
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => void handleSignOut()}
							variant="destructive"
						>
							<LogOutIcon className="size-4" />
							Sign out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	);
}
