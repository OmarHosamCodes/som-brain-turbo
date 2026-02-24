import { cn } from "@/lib/utils";

export const GridBackground = () => {
	return (
		<div
			className={cn(
				"absolute inset-0 -z-10",
				"bg-size-[40px_40px]",
				"bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
				"dark:bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
			)}
		/>
	);
};
