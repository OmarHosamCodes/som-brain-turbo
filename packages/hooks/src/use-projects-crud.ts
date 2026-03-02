"use client";

import {
	entityArchiveSchema,
	projectCreateSchema,
	projectUpdateSchema,
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

export function useProjectsCrudState() {
	const projectsQuery = useQuery(
		trpc.projects.list.queryOptions({ includeArchived: true }),
	);
	const clientsQuery = useQuery(
		trpc.clients.list.queryOptions({ includeArchived: false }),
	);
	const createMutation = useMutation(trpc.projects.create.mutationOptions());
	const updateMutation = useMutation(trpc.projects.update.mutationOptions());
	const archiveMutation = useMutation(trpc.projects.archive.mutationOptions());
	const unarchiveMutation = useMutation(
		trpc.projects.unarchive.mutationOptions(),
	);
	const deleteMutation = useMutation(trpc.projects.delete.mutationOptions());

	const invalidate = async () => {
		await queryClient.invalidateQueries();
	};

	const createProject = async (rawValues: unknown) => {
		try {
			const input = projectCreateSchema.parse(rawValues);
			await createMutation.mutateAsync(input as never);
			await invalidate();
			toast.success("Project created.");
		} catch (error) {
			toast.error(toErrorMessage(error));
		}
	};

	const updateProject = async (rawValues: unknown) => {
		try {
			const input = projectUpdateSchema.parse(rawValues);
			await updateMutation.mutateAsync(input as never);
			await invalidate();
			toast.success("Project updated.");
		} catch (error) {
			toast.error(toErrorMessage(error));
		}
	};

	const archiveProject = async (id: number) => {
		try {
			const input = entityArchiveSchema.parse({ id });
			await archiveMutation.mutateAsync(input as never);
			await invalidate();
			toast.success("Project archived.");
		} catch (error) {
			toast.error(toErrorMessage(error));
		}
	};

	const unarchiveProject = async (id: number) => {
		try {
			const input = entityArchiveSchema.parse({ id });
			await unarchiveMutation.mutateAsync(input as never);
			await invalidate();
			toast.success("Project restored.");
		} catch (error) {
			toast.error(toErrorMessage(error));
		}
	};

	const deleteProject = async (id: number) => {
		try {
			const input = entityArchiveSchema.parse({ id });
			await deleteMutation.mutateAsync(input as never);
			await invalidate();
			toast.success("Project deleted.");
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
		projects: projectsQuery.data ?? [],
		clients: clientsQuery.data ?? [],
		projectsQuery,
		clientsQuery,
		createProject,
		updateProject,
		archiveProject,
		unarchiveProject,
		deleteProject,
		isBusy,
	} as const;
}
