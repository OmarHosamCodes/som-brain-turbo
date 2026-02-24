import {
	BarChart3Icon,
	BrainIcon,
	BriefcaseIcon,
	ClipboardCheckIcon,
	ClockIcon,
	CreditCardIcon,
	FileTextIcon,
	FolderIcon,
	GaugeIcon,
	LayoutTemplateIcon,
	LibraryIcon,
	ReceiptIcon,
	SettingsIcon,
	TargetIcon,
	UsersIcon,
	WalletIcon,
} from "lucide-react";
import type { NavGroup, NavItem } from "@/types/layout";

export const navGroups: NavGroup[] = [
	{
		label: "Track",
		defaultOpen: true,
		items: [
			{
				href: "/dashboard",
				label: "Time Tracker",
				icon: <ClockIcon className="size-4" />,
			},
			{
				href: "/dashboard/analytics",
				label: "Analytics",
				icon: <GaugeIcon className="size-4" />,
			},
			{
				href: "/dashboard/micro-brain",
				label: "Micro Brain",
				icon: <BrainIcon className="size-4" />,
			},
		],
	},
	{
		label: "Plan",
		defaultOpen: true,
		items: [
			{
				href: "/dashboard/projects",
				label: "Projects",
				icon: <FolderIcon className="size-4" />,
			},
			{
				href: "/dashboard/clients",
				label: "Clients",
				icon: <BriefcaseIcon className="size-4" />,
			},
			{
				href: "/dashboard/tasks",
				label: "Tasks",
				icon: <ClipboardCheckIcon className="size-4" />,
			},
			{
				href: "/dashboard/sprints",
				label: "Sprints",
				icon: <TargetIcon className="size-4" />,
			},
		],
	},
	{
		label: "Review",
		defaultOpen: true,
		items: [
			{
				href: "/dashboard/for-review",
				label: "For Review",
				icon: <FileTextIcon className="size-4" />,
			},
		],
	},
	{
		label: "Report",
		defaultOpen: true,
		items: [
			{
				href: "/dashboard/reports",
				label: "Reports",
				icon: <BarChart3Icon className="size-4" />,
			},
		],
	},
	{
		label: "Finance",
		defaultOpen: true,
		items: [
			{
				href: "/dashboard/expenses",
				label: "Expenses",
				icon: <ReceiptIcon className="size-4" />,
			},
			{
				href: "/dashboard/salaries",
				label: "Salaries",
				icon: <WalletIcon className="size-4" />,
			},
		],
	},
];

export const settingsItems: NavItem[] = [
	{
		href: "/dashboard/settings",
		label: "General",
		icon: <SettingsIcon className="size-4" />,
	},
	{
		href: "/dashboard/settings/members",
		label: "Members",
		icon: <UsersIcon className="size-4" />,
	},
	{
		href: "/dashboard/settings/departments",
		label: "Departments",
		icon: <LayoutTemplateIcon className="size-4" />,
	},
	{
		href: "/dashboard/settings/templates",
		label: "Templates",
		icon: <LibraryIcon className="size-4" />,
	},
	{
		href: "/dashboard/settings/rates",
		label: "Rates",
		icon: <CreditCardIcon className="size-4" />,
	},
	{
		href: "/dashboard/settings/financial",
		label: "Financial",
		icon: <BarChart3Icon className="size-4" />,
	},
];
