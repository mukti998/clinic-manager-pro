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
    user: { name: "Dr. Sarah Chen", email: "sarah@hospital.org", role: "doctor", _id: "user123" },
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
  NavLink: ({ children, to, className }: { children: React.ReactNode; to: string; className?: string | Function }) => (
    <a href={to} className={typeof className === "function" ? "sidebar-link active" : className}>
      {children}
    </a>
  ),
  Outlet: () => <div data-testid="outlet" />,
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
    vitals: { add: "vitals.add", getHistory: "vitals.getHistory", getLatest: "vitals.getLatest" },
    orders: {
      create: "orders.create",
      listByDepartment: "orders.listByDepartment",
      getStats: "orders.getStats",
    },
    visits: {
      create: "visits.create",
      markPaid: "visits.markPaid",
      updateStatus: "visits.updateStatus",
      getDoctorQueue: "visits.getDoctorQueue",
      getWaitingQueue: "visits.getWaitingQueue",
      getActiveVisits: "visits.getActiveVisits",
      getTodayCount: "visits.getTodayCount",
      getTodayRevenue: "visits.getTodayRevenue",
      getVisit: "visits.getVisit",
    },
    prescriptions: {
      create: "prescriptions.create",
      approve: "prescriptions.approve",
      dispense: "prescriptions.dispense",
      reject: "prescriptions.reject",
      getPharmacyQueue: "prescriptions.getPharmacyQueue",
      listByStatus: "prescriptions.listByStatus",
      listByVisit: "prescriptions.listByVisit",
    },
    lab: {
      create: "lab.create",
      accept: "lab.accept",
      collectSample: "lab.collectSample",
      enterResults: "lab.enterResults",
      reject: "lab.reject",
      getLabQueue: "lab.getLabQueue",
      getPendingCount: "lab.getPendingCount",
      getByVisit: "lab.getByVisit",
    },
    billing: {
      processPayment: "billing.processPayment",
      createInvoice: "billing.createInvoice",
      markInvoicePaid: "billing.markInvoicePaid",
      getTodayRevenue: "billing.getTodayRevenue",
      getTotalRevenue: "billing.getTotalRevenue",
      getRevenueByRange: "billing.getRevenueByRange",
      getRecentPayments: "billing.getRecentPayments",
      getDailyRevenueChart: "billing.getDailyRevenueChart",
      getDepartmentSummary: "billing.getDepartmentSummary",
      getAllInvoices: "billing.getAllInvoices",
    },
    staff: {
      listByDepartment: "staff.listByDepartment",
      listActive: "staff.listActive",
      getCount: "staff.getCount",
      getByRole: "staff.getByRole",
    },
    users: {
      createUser: "users.createUser",
      currentUser: "users.currentUser",
      listAll: "users.listAll",
      updateRole: "users.updateRole",
      deactivateUser: "users.deactivateUser",
      getStats: "users.getStats",
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

// Import the Sidebar component directly — it contains branding, nav, and user section
import Sidebar from "@/components/dashboard/Sidebar";

describe("Sidebar", () => {
  it("renders the sidebar branding", () => {
    render(<Sidebar />);
    expect(screen.getByText("Rayan")).toBeTruthy();
  });

  it("renders navigation items for doctor role", () => {
    render(<Sidebar />);
    expect(screen.getByText("Overview")).toBeTruthy();
    expect(screen.getByText("My Queue")).toBeTruthy();
    expect(screen.getByText("Patient Records")).toBeTruthy();
  });

  it("displays user name from auth", () => {
    render(<Sidebar />);
    expect(screen.getByText("Dr. Sarah Chen")).toBeTruthy();
  });

  it("shows doctor role in sidebar", () => {
    render(<Sidebar />);
    expect(screen.getAllByText("doctor").length).toBeGreaterThan(0);
  });

  it("shows user role label", () => {
    render(<Sidebar />);
    // The sidebar shows the role or department name for the user
    expect(screen.getByText("doctor")).toBeTruthy();
  });

  it("renders sign out button", () => {
    render(<Sidebar />);
    expect(screen.getByTitle("Sign out")).toBeTruthy();
  });
});

// Test HomeView separately
import HomeView from "@/pages/dashboard/HomeView";

describe("HomeView", () => {
  it("shows greeting with user name", () => {
    render(<HomeView />);
    // The greeting uses first name only, split across whitespace
    expect(screen.getByText(/Good day/)).toBeTruthy();
    expect(screen.getByText(/Dr\./)).toBeTruthy();
  });

  it("shows quick actions section for doctors", () => {
    render(<HomeView />);
    expect(screen.getByText("Quick Actions")).toBeTruthy();
  });

  it("shows doctor-specific action items", () => {
    render(<HomeView />);
    expect(screen.getAllByText("My Queue").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Patient Records").length).toBeGreaterThan(0);
  });
});
