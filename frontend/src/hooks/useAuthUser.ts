"use client";

import { useEffect, useState } from "react";
import type { AuthUser } from "@/lib/auth";
import { getAuthUser, subscribeToAuthSession } from "@/lib/auth";

export function useAuthUser(): AuthUser | null {
  const [user, setUser] = useState<AuthUser | null>(() =>
    typeof window === "undefined" ? null : getAuthUser()
  );

  useEffect(() => {
    const syncUser = () => setUser(getAuthUser());
    syncUser();
    return subscribeToAuthSession(syncUser);
  }, []);

  return user;
}
