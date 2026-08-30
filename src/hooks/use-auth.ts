import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useState, useEffect, useCallback } from "react";

interface StoredUser {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
}

export function useAuth() {
  const [storedUser, setStoredUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Read from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("speakup_user");
      if (raw) {
        setStoredUser(JSON.parse(raw));
      }
    } catch {}
    setIsLoading(false);
  }, []);

  // Query the actual user from Convex for fresh data
  const convexUser = useQuery(
    api.users.getUserById,
    storedUser?._id ? { userId: storedUser._id as any } : "skip"
  );

  const user = convexUser || (storedUser ? {
    _id: storedUser._id as any,
    name: storedUser.name,
    email: storedUser.email,
    role: storedUser.role,
  } : null);

  const isAuthenticated = !!storedUser?._id;

  const signOut = useCallback(() => {
    localStorage.removeItem("speakup_user");
    setStoredUser(null);
  }, []);

  return {
    isLoading,
    isAuthenticated,
    user,
    signOut,
  };
}
