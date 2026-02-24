"use client";
import { usePrivateDataQuery, type AuthSession } from "@som-brain-turbo/hooks";

export default function Dashboard({ session }: { session: AuthSession }) {
  const privateData = usePrivateDataQuery();

  return <p>API: {privateData.data?.message}</p>;
}
