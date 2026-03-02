"use client";

import {
	entityArchiveSchema,
	taskCreateSchema,
	taskUpdateSchema,
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

export function useTasksCrudState() {
	const tasksQuery = useQuery(
		trpc.tasks.list.queryOptions({ includeArchived: true }),
	);
	const projectsQuery = useQuery(
		trpc.projects.list.queryOptions({ includeArchived: false }),
	);
	const createMutation = useMutation(trpc.tasks.create.mutationOptions());
	const updateMutation = useMutation(trpc.tasks.update.mutationOptions());
	const archiveMutation = useMutation(trpc.tasks.archive.mutationOptions());
	const unarchiveMutation = useMutation(trpc.tasks.unarchive.mutationOptions());
	const deleteMutation = useMutation(trpc.tasks.delete.mutationOptions());

	const invalidate = async () => {
		await queryClient.invalidateQueries();
	};

	const createTask = async (rawValues: unknown) => {
		try {
			const input = taskCreateSchema.parse(rawValues);
			await createMutation.mutateAsync(input as never);
			await invalidate();
			toast.success("Task created.");
		} catch (error) {
			toast.error(toErrorMessage(error));
		}
	};

	const updateTask = async (rawValues: unknown) => {
		try {
			const input = taskUpdateSchema.parse(rawValues);
			await updateMutation.mutateAsync(input as never);
			await invalidate();
			toast.success("Task updated.");
		} catch (error) {
			toast.error(toErrorMessage(error));
		}
	};

	const archiveTask = async (id: number) => {
		try {
			const input = entityArchiveSchema.parse({ id });
			await archiveMutation.mutateAsync(input as never);
			await invalidate();
			toast.success("Task archived.");
		} catch (error) {
			toast.error(toErrorMessage(error));
		}
	};

	const unarchiveTask = async (id: number) => {
		try {
			const input = entityArchiveSchema.parse({ id });
			await unarchiveMutation.mutateAsync(input as never);
			await invalidate();
			toast.success("Task restored.");
		} catch (error) {
			toast.error(toErrorMessage(error));
		}
	};

	const deleteTask = async (id: number) => {
		try {
			const input = entityArchiveSchema.parse({ id });
			await deleteMutation.mutateAsync(input as never);
			await invalidate();
			toast.success("Task deleted.");
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
		tasks: tasksQuery.data ?? [],
		projects: projectsQuery.data ?? [],
		tasksQuery,
		projectsQuery,
		createTask,
		updateTask,
		archiveTask,
		unarchiveTask,
		deleteTask,
		isBusy,
	} as const;
}
