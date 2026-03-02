import { and, asc, eq } from "drizzle-orm";

import { db } from "./index";
import { organizationMembers, organizations } from "./schema";

interface EnsureOwnedWorkspaceOptions {
	userId: string;
	userName?: string | null;
}

interface ResolveOrganizationIdOptions extends EnsureOwnedWorkspaceOptions {
	requestedOrganizationId: number | null;
}

function normalizeWorkspaceName(userName?: string | null) {
	const trimmedName = userName?.trim();
	if (!trimmedName) {
		return "My Workspace";
	}

	return `${trimmedName}'s Workspace`;
}

function toSlugSegment(value: string) {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 48);
}

function buildWorkspaceSlug(
	workspaceName: string,
	userId: string,
	attempt: number,
) {
	const namePart = toSlugSegment(workspaceName) || "workspace";
	const userPart = toSlugSegment(userId).slice(0, 12) || "user";
	const suffix = attempt === 0 ? "" : `-${attempt + 1}`;

	return `${namePart}-${userPart}${suffix}`.slice(0, 64);
}

function isUniqueConstraintError(error: unknown) {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		(error as { code?: string }).code === "23505"
	);
}

async function findOwnedOrganizationId(userId: string) {
	const [ownedMembership] = await db
		.select({ organizationId: organizationMembers.organizationId })
		.from(organizationMembers)
		.where(
			and(
				eq(organizationMembers.userId, userId),
				eq(organizationMembers.role, "owner"),
			),
		)
		.orderBy(asc(organizationMembers.createdAt))
		.limit(1);

	return ownedMembership?.organizationId ?? null;
}

export async function ensureOwnedWorkspaceForUser({
	userId,
	userName,
}: EnsureOwnedWorkspaceOptions) {
	const existingOwnedOrganizationId = await findOwnedOrganizationId(userId);
	if (existingOwnedOrganizationId) {
		return existingOwnedOrganizationId;
	}

	const workspaceName = normalizeWorkspaceName(userName);

	for (let attempt = 0; attempt < 6; attempt += 1) {
		const workspaceSlug = buildWorkspaceSlug(workspaceName, userId, attempt);

		try {
			const createdOrganizationId = await db.transaction(async (tx) => {
				const [ownedMembership] = await tx
					.select({ organizationId: organizationMembers.organizationId })
					.from(organizationMembers)
					.where(
						and(
							eq(organizationMembers.userId, userId),
							eq(organizationMembers.role, "owner"),
						),
					)
					.limit(1);

				if (ownedMembership) {
					return ownedMembership.organizationId;
				}

				const [organization] = await tx
					.insert(organizations)
					.values({
						name: workspaceName,
						slug: workspaceSlug,
					})
					.returning({ id: organizations.id });

				if (!organization) {
					throw new Error("Failed to create workspace.");
				}

				await tx.insert(organizationMembers).values({
					userId,
					organizationId: organization.id,
					role: "owner",
				});

				return organization.id;
			});

			return createdOrganizationId;
		} catch (error) {
			if (isUniqueConstraintError(error)) {
				continue;
			}

			throw error;
		}
	}

	throw new Error("Failed to provision owned workspace.");
}

export async function resolveOrganizationIdForUser({
	userId,
	userName,
	requestedOrganizationId,
}: ResolveOrganizationIdOptions) {
	await ensureOwnedWorkspaceForUser({ userId, userName });

	if (requestedOrganizationId !== null) {
		const [requestedMembership] = await db
			.select({ organizationId: organizationMembers.organizationId })
			.from(organizationMembers)
			.where(
				and(
					eq(organizationMembers.userId, userId),
					eq(organizationMembers.organizationId, requestedOrganizationId),
				),
			)
			.limit(1);

		if (requestedMembership) {
			return requestedMembership.organizationId;
		}
	}

	const [fallbackMembership] = await db
		.select({ organizationId: organizationMembers.organizationId })
		.from(organizationMembers)
		.where(eq(organizationMembers.userId, userId))
		.orderBy(asc(organizationMembers.createdAt))
		.limit(1);

	if (!fallbackMembership) {
		return ensureOwnedWorkspaceForUser({ userId, userName });
	}

	return fallbackMembership.organizationId;
}
