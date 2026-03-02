"use client";

import {
	entityArchiveSchema,
	sprintCreateSchema,
	sprintUpdateSchema,
} from "@som-brain-turbo/validators";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient, trpc } from "./trpc-client";

function toErrorMessage(error: unknown) {
	if (error instanceof Error && error.message.trim()) {
		return error.message;
	}

	return "Something went wrong.";
}

export function useSprintsCrudState() {
	const sprintsQuery = useQuery(
		trpc.sprints.list.queryOptions({ includeArchived: true }),
	);
	const projectsQuery = useQuery(
		trpc.projects.list.queryOptions({ includeArchived: false }),
	);
	const createMutation = useMutation(trpc.sprints.create.mutationOptions());
	const updateMutation = useMutation(trpc.sprints.update.mutationOptions());
	const archiveMutation = useMutation(trpc.sprints.archive.mutationOptions());
	const unarchiveMutation = useMutation(
		trpc.sprints.unarchive.mutationOptions(),
	);
	const deleteMutation = useMutation(trpc.sprints.delete.mutationOptions());

	const invalidate = async () => {
		await queryClient.invalidateQueries();
	};

	const createSprint = async (rawValues: unknown) => {
		try {
			const input = sprintCreateSchema.parse(rawValues);
			await createMutation.mutateAsync(input as never);
			await invalidate();
			toast.success("Sprint created.");
		} catch (error) {
			toast.error(toErrorMessage(error));
		}
	};

	const updateSprint = async (rawValues: unknown) => {
		try {
			const input = sprintUpdateSchema.parse(rawValues);
			await updateMutation.mutateAsync(input as never);
			await invalidate();
			toast.success("Sprint updated.");
		} catch (error) {
			toast.error(toErrorMessage(error));
		}
	};

	const archiveSprint = async (id: number) => {
		try {
			const input = entityArchiveSchema.parse({ id });
			await archiveMutation.mutateAsync(input as never);
			await invalidate();
			toast.success("Sprint archived.");
		} catch (error) {
			toast.error(toErrorMessage(error));
		}
	};

	const unarchiveSprint = async (id: number) => {
		try {
			const input = entityArchiveSchema.parse({ id });
			await unarchiveMutation.mutateAsync(input as never);
			await invalidate();
			toast.success("Sprint restored.");
		} catch (error) {
			toast.error(toErrorMessage(error));
		}
	};

	const deleteSprint = async (id: number) => {
		try {
			const input = entityArchiveSchema.parse({ id });
			await deleteMutation.mutateAsync(input as never);
			await invalidate();
			toast.success("Sprint deleted.");
		} catch (error) {
			toast.error(toErrorMessage(error));
		}
	};

	const isBusy =
		createMutation.isPending ||
		updateMutation.isPending ||
		archiveMutation.isPending ||
		unarchiveMutation.isPending ||
		deleteMutation.isPending;

	return {
		sprints: sprintsQuery.data ?? [],
		projects: projectsQuery.data ?? [],
		sprintsQuery,
		projectsQuery,
		createSprint,
		updateSprint,
		archiveSprint,
		unarchiveSprint,
		deleteSprint,
		isBusy,
	} as const;
}
