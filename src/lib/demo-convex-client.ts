import { getDemoQueryResult } from "./demo-query-resolver";

// Extract function name from query reference without importing internal Convex code
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractQueryName(query: any): string {
  if (typeof query === "string") return query;
  // Convex query refs have a _functionName property or we can look at the path
  if (query && typeof query === "object") {
    // Try common Convex internal properties
    if (query._functionName) return query._functionName;
    if (query.name) return query.name;
    if (query.path) return query.path;
    // Stringify to extract name — looks like "users.currentUser" etc
    const str = String(query);
    // Remove "api." prefix and any quotes
    return str.replace(/^.*?api\./, "").replace(/['"]/g, "");
  }
  return String(query);
}

/**
 * A mock ConvexReactClient for demo mode.
 * Returns demo data for all queries instead of making real API calls.
 */
export class DemoConvexClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watchQuery(query: any, ...argsAndOptions: any[]) {
    const [args] = argsAndOptions;
    const queryName = extractQueryName(query);
    const demoResult = getDemoQueryResult(queryName, args);

    return {
      onUpdate: (callback: () => void) => {
        // Fire callback once asynchronously so useSubscription picks up the demo data
        const id = setTimeout(() => callback(), 0);
        return () => clearTimeout(id);
      },
      localQueryResult: () => demoResult,
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
    return { connectionStatus: "connected" as const, lastSentTouchEventTimestamp: Date.now() };
  }

  subscribeToConnectionState(_cb: () => void) {
    return () => {};
  }

  close() {}
}
