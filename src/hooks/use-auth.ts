import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { isDemoMode, isConvexConfigured, DEMO_USER, enableDemoMode } from "@/lib/demo-data";

export function useAuth() {
  // Auto-enable demo mode if Convex is not configured
  if (!isConvexConfigured() && !isDemoMode()) {
    enableDemoMode();
  }

  // Always call hooks to satisfy Rules of Hooks
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const { signIn, signOut } = useAuthActions();

  const demoMode = isDemoMode();

  // In demo mode, override with demo data
  if (demoMode) {
    return {
      isLoading: false,
      isAuthenticated: true,
      user: DEMO_USER,
      signIn: async () => ({ signingIn: true }),
      signOut: async () => {},
    };
  }

  // Real Convex auth path
  const isLoading = isAuthLoading || user === undefined;

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn,
    signOut,
  };
}
