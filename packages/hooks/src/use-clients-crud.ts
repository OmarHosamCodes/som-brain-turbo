"use client";

import {
	clientCreateSchema,
	clientUpdateSchema,
	entityArchiveSchema,
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

export function useClientsCrudState() {
	const clientsQuery = useQuery(
		trpc.clients.list.queryOptions({ includeArchived: true }),
	);
	const createMutation = useMutation(trpc.clients.create.mutationOptions());
	const updateMutation = useMutation(trpc.clients.update.mutationOptions());
	const archiveMutation = useMutation(trpc.clients.archive.mutationOptions());
	const unarchiveMutation = useMutation(
		trpc.clients.unarchive.mutationOptions(),
	);
	const deleteMutation = useMutation(trpc.clients.delete.mutationOptions());

	const invalidate = async () => {
		await queryClient.invalidateQueries();
	};

	const createClient = async (rawValues: unknown) => {
		try {
			const input = clientCreateSchema.parse(rawValues);
			await createMutation.mutateAsync(input as never);
			await invalidate();
			toast.success("Client created.");
		} catch (error) {
			toast.error(toErrorMessage(error));
		}
	};

	const updateClient = async (rawValues: unknown) => {
		try {
			const input = clientUpdateSchema.parse(rawValues);
			await updateMutation.mutateAsync(input as never);
			await invalidate();
			toast.success("Client updated.");
		} catch (error) {
			toast.error(toErrorMessage(error));
		}
	};

	const archiveClient = async (id: number) => {
		try {
			const input = entityArchiveSchema.parse({ id });
			await archiveMutation.mutateAsync(input as never);
			await invalidate();
			toast.success("Client archived.");
		} catch (error) {
			toast.error(toErrorMessage(error));
		}
	};

	const unarchiveClient = async (id: number) => {
		try {
			const input = entityArchiveSchema.parse({ id });
			await unarchiveMutation.mutateAsync(input as never);
			await invalidate();
			toast.success("Client restored.");
		} catch (error) {
			toast.error(toErrorMessage(error));
		}
	};

	const deleteClient = async (id: number) => {
		try {
			const input = entityArchiveSchema.parse({ id });
			await deleteMutation.mutateAsync(input as never);
			await invalidate();
			toast.success("Client deleted.");
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
		clients: clientsQuery.data ?? [],
		clientsQuery,
		createClient,
		updateClient,
		archiveClient,
		unarchiveClient,
		deleteClient,
		isBusy,
	} as const;
}
