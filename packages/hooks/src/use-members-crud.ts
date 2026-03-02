"use client";

import { workspaceInviteByEmailSchema } from "@som-brain-turbo/validators";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient, trpc } from "./trpc-client";

function toErrorMessage(error: unknown) {
	if (error instanceof Error && error.message.trim()) {
		return error.message;
	}

	return "Something went wrong.";
}

export function useMembersCrudState() {
	const membersQuery = useQuery(trpc.workspace.members.queryOptions());
	const inviteMutation = useMutation(
		trpc.workspace.inviteByEmail.mutationOptions(),
	);

	const inviteMemberByEmail = async (rawValues: unknown) => {
		try {
			const input = workspaceInviteByEmailSchema.parse(rawValues);
			await inviteMutation.mutateAsync(input as never);
			await queryClient.invalidateQueries();
			toast.success("Member added to workspace.");
		} catch (error) {
			toast.error(toErrorMessage(error));
		}
	};

	return {
		members: membersQuery.data ?? [],
		membersQuery,
		inviteMemberByEmail,
		isBusy: inviteMutation.isPending,
	} as const;
}
