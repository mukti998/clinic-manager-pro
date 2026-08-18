import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Mock all external dependencies
vi.mock("convex/react", () => ({
  useQuery: vi.fn(() => undefined),
  useMutation: vi.fn(() => vi.fn()),
  ConvexProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: vi.fn(() => ({
    user: { name: "Dr. Sarah Chen", email: "sarah@hospital.org", role: "doctor" },
    signOut: vi.fn(),
    isLoading: false,
    isAuthenticated: true,
  })),
}));

vi.mock("react-router", () => ({
  useNavigate: vi.fn(() => vi.fn()),
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />,
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useLocation: vi.fn(() => ({ pathname: "/dashboard" })),
  useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    patients: {
      list: "patients.list",
      getStats: "patients.getStats",
      getById: "patients.getById",
      getVitals: "patients.getVitals",
      create: "patients.create",
      deactivate: "patients.deactivate",
      reactivate: "patients.reactivate",
    },
    vitals: { add: "vitals.add" },
    orders: {
      create: "orders.create",
      listByDepartment: "orders.listByDepartment",
    },
  },
}));

vi.mock("@/convex/_generated/dataModel", () => ({
  type: {},
}));

vi.mock("@/components/RequireAuth", () => ({
  RequireAuth: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...filterDomProps(props)}>{children}</div>,
    nav: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <nav {...filterDomProps(props)}>{children}</nav>,
    section: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <section {...filterDomProps(props)}>{children}</section>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function filterDomProps(props: Record<string, unknown>) {
  const dom: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) {
    if (k === "children" || k === "initial" || k === "animate" || k === "exit" || k === "transition" || k === "variants" || k === "whileInView" || k === "viewport") continue;
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean" || typeof v === "function") {
      dom[k] = v;
    }
  }
  return dom;
}

import Dashboard from "../pages/Dashboard";

describe("Dashboard", () => {
  it("renders the sidebar branding", () => {
    render(<Dashboard />);
    expect(screen.getByText("rayan")).toBeTruthy();
  });

  it("renders navigation items", () => {
    render(<Dashboard />);
    expect(screen.getByText("Overview")).toBeTruthy();
    expect(screen.getByText("Patients")).toBeTruthy();
    expect(screen.getByText("Orders")).toBeTruthy();
  });

  it("displays user name from auth", () => {
    render(<Dashboard />);
    expect(screen.getByText("Dr. Sarah Chen")).toBeTruthy();
  });

  it("shows doctor role badge", () => {
    render(<Dashboard />);
    expect(screen.getAllByText("doctor").length).toBeGreaterThan(0);
  });

  it("shows quick route section for doctors", () => {
    render(<Dashboard />);
    expect(screen.getByText("Quick Route")).toBeTruthy();
  });

  it("renders quick route action cards for doctors", () => {
    render(<Dashboard />);
    expect(screen.getAllByText("Laboratory").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pharmacy").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Radiology").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Nursing").length).toBeGreaterThan(0);
  });

  it("shows greeting with user name", () => {
    render(<Dashboard />);
    expect(screen.getByText(/Sarah/)).toBeTruthy();
  });

  it("renders sign out button", () => {
    render(<Dashboard />);
    expect(screen.getByTitle("Sign out")).toBeTruthy();
  });
});
