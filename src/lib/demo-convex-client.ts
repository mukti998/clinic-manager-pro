import { getDemoQueryResult } from "./demo-query-resolver";

// Extract function name from query reference
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractQueryName(query: any): string {
  if (typeof query === "string") return query;
  if (query && typeof query === "object") {
    if (query._functionName) return query._functionName;
    if (query.name) return query.name;
    if (query.path) return query.path;
    const str = String(query);
    return str.replace(/^.*?api\./, "").replace(/['"]/g, "");
  }
  return String(query);
}

/**
 * A mock ConvexReactClient for demo mode that implements the minimum
 * interface required by ConvexAuthProvider and ConvexProviderWithAuth.
 *
 * This allows the full Convex provider chain to mount without crashing,
 * while returning demo data instead of making real API calls.
 */
export class DemoConvexClient {
  address = "https://demo.convex.cloud";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any = { verbose: false };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logger: any = undefined;

  // No-op auth methods required by ConvexProviderWithAuth
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setAuth(_fetchAccessToken: any, _onAuthenticated: any, _onRefreshing: any) {
    // In demo mode, report as authenticated after a tick
    setTimeout(() => _onAuthenticated?.(true), 0);
  }

  clearAuth() {
    // No-op in demo mode
  }

  setApiUrl(_url: string) {
    // No-op in demo mode
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action(_actionPath: string, _args?: any): Promise<any> {
    return Promise.resolve({ success: true });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watchQuery(query: any, ...argsAndOptions: any[]) {
    const [args] = argsAndOptions;
    const queryName = extractQueryName(query);
    const demoResult = getDemoQueryResult(queryName, args);

    // Track subscribers for manual updates
    const subscribers = new Set<() => void>();
    let currentResult = demoResult;

    return {
      onUpdate: (callback: () => void) => {
        subscribers.add(callback);
        // Fire callback once asynchronously so useSubscription picks up the demo data
        const id = setTimeout(() => callback(), 0);
        return () => {
          clearTimeout(id);
          subscribers.delete(callback);
        };
      },
      localQueryResult: () => currentResult,
      localQueryLogs: () => undefined,
      journal: () => undefined,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watchPaginatedQuery(query: any, args: any, opts: any) {
    return this.watchQuery(query, args, opts);
  }

  subscribe(_name: string, _args: any, _opts: any) {
    return { queryToken: "demo", unsubscribe: () => {} };
  }

  connectionState() {
    return {
      connectionStatus: "connected" as const,
      lastSentTouchEventTimestamp: Date.now(),
    };
  }

  subscribeToConnectionState(_cb: () => void) {
    return () => {};
  }

  close() {}
}
