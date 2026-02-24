"use client";

import { useAppStateStore } from "@som-brain-turbo/state";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef } from "react";
import { queryClient, trpc } from "./trpc-client";

export function useOrgSwitcherState() {
  const organizationsQuery = useQuery(
    trpc.workspace.organizations.queryOptions(),
  );
  const organizations = organizationsQuery.data ?? [];

  const activeOrganizationId = useAppStateStore(
    (state) => state.activeOrganizationId,
  );
  const setActiveOrganizationId = useAppStateStore(
    (state) => state.setActiveOrganizationId,
  );

  const resolvedActiveOrganizationId = useMemo(() => {
    if (organizations.length === 0) {
      return "";
    }

    const hasSelectedOrganization = organizations.some(
      (organization) => String(organization.id) === activeOrganizationId,
    );

    if (hasSelectedOrganization) {
      return activeOrganizationId;
    }

    return String(organizations[0]?.id ?? "");
  }, [activeOrganizationId, organizations]);
  const syncedOrganizationIdRef = useRef("");

  if (
    resolvedActiveOrganizationId &&
    activeOrganizationId !== resolvedActiveOrganizationId &&
    syncedOrganizationIdRef.current !== resolvedActiveOrganizationId
  ) {
    syncedOrganizationIdRef.current = resolvedActiveOrganizationId;
    queueMicrotask(() => {
      setActiveOrganizationId(resolvedActiveOrganizationId);
    });
  }

  const activeOrganization = useMemo(
    () =>
      organizations.find(
        (organization) =>
          String(organization.id) === resolvedActiveOrganizationId,
      ) ?? null,
    [organizations, resolvedActiveOrganizationId],
  );

  const selectOrganization = (organizationId: string) => {
    setActiveOrganizationId(organizationId);
    void queryClient.invalidateQueries();
  };

  return {
    organizations,
    organizationsQuery,
    activeOrganization: activeOrganization,
    activeOrganizationId: resolvedActiveOrganizationId,
    selectOrganization,
  } as const;
}
