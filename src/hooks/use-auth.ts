import {
  isDemoMode,
  isConvexConfigured,
  getDemoUser,
  enableDemoMode,
} from "@/lib/demo-data";

// ═══════════════════════════════════════════════════════════
// CONVEX HOOKS — loaded dynamically only when Convex is available
// ═══════════════════════════════════════════════════════════
let _convexHooks: {
  useConvexAuth: () => { isLoading: boolean; isAuthenticated: boolean };
  useQuery: (query: any, ...args: any[]) => any;
  useAuthActions: () => { signIn: any; signOut: any };
} | null = null;

let _convexReady = false;

/**
 * Called once by boot() after confirming Convex imports work.
 * Must be called BEFORE any component renders.
 */
export function initConvexHooks(hooks: typeof _convexHooks) {
  _convexHooks = hooks;
  _convexReady = true;
}

export function isConvexReady() {
  return _convexReady;
}

// ═══════════════════════════════════════════════════════════
// useAuth — works in both Convex and demo mode
// ═══════════════════════════════════════════════════════════
export function useAuth() {
  // Auto-enable demo mode if Convex is not configured
  if (!isConvexConfigured() && !isDemoMode()) {
    enableDemoMode();
  }

  const demoMode = isDemoMode();

  // ═══ Demo path: return mock data, no Convex hooks needed ═══
  if (demoMode || !_convexReady) {
    const demoUser = getDemoUser();
    return {
      isLoading: false,
      isAuthenticated: true,
      user: demoUser,
      signIn: async () => ({ signingIn: true }),
      signOut: async () => {},
    };
  }

  // ═══ Real Convex path: use Convex hooks ═══
  if (!_convexHooks) {
    throw new Error("useAuth: Convex hooks not initialized");
  }

  const convexAuth = _convexHooks.useConvexAuth();
  const user = _convexHooks.useQuery(
    "users.currentUser"
  );
  const authActions = _convexHooks.useAuthActions();

  const isLoading = convexAuth.isLoading || user === undefined;

  return {
    isLoading,
    isAuthenticated: convexAuth.isAuthenticated,
    user,
    signIn: authActions.signIn,
    signOut: authActions.signOut,
  };
}
