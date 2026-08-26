import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import {
  isDemoMode,
  isConvexConfigured,
  getDemoUser,
  enableDemoMode,
} from "@/lib/demo-data";

export function useAuth() {
  // Auto-enable demo mode if Convex is not configured
  if (!isConvexConfigured() && !isDemoMode()) {
    enableDemoMode();
  }

  // Always call hooks to satisfy Rules of Hooks
  const convexAuth = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const authActions = useAuthActions();

  const demoMode = isDemoMode();

  // In demo mode, use the dynamically selected role + name
  if (demoMode) {
    const demoUser = getDemoUser();
    return {
      isLoading: false,
      isAuthenticated: true,
      user: demoUser,
      signIn: async () => ({ signingIn: true }),
      signOut: async () => {},
    };
  }

  // Real Convex auth path
  const isLoading = convexAuth.isLoading || user === undefined;

  return {
    isLoading,
    isAuthenticated: convexAuth.isAuthenticated,
    user,
    signIn: authActions.signIn,
    signOut: authActions.signOut,
  };
}
