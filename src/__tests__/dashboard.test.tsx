import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// ─── Mock Convex hooks ──────────────────────────────────
vi.mock("convex/react", () => ({
  useQuery: vi.fn(() => undefined),
  useMutation: vi.fn(() => vi.fn()),
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    patients: {
      list: "patients:list",
      getById: "patients:getById",
      getStats: "patients:getStats",
      create: "patients:create",
      update: "patients:update",
      deactivate: "patients:deactivate",
      reactivate: "patients:reactivate",
      getVitals: "patients:getVitals",
    },
    vitals: {
      add: "vitals:add",
      getHistory: "vitals:getHistory",
      getLatest: "vitals:getLatest",
    },
    users: {
      currentUser: "users:currentUser",
    },
  },
}));

// ─── Mock Auth hook ─────────────────────────────────────
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    isLoading: false,
    isAuthenticated: true,
    user: { name: "Dr. Smith", email: "smith@rayan.com", image: undefined },
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

// ─── Mock react-router ──────────────────────────────────
const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ─── Mock sonner toast ──────────────────────────────────
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import Dashboard from "@/pages/Dashboard";

describe("Dashboard component", () => {
  it("renders the sidebar with Rayan branding", () => {
    render(<Dashboard />);
    expect(screen.getByText("rayan")).toBeInTheDocument();
  });

  it("displays the sidebar navigation items", () => {
    render(<Dashboard />);
    expect(screen.getByText("Patients")).toBeInTheDocument();
    expect(screen.getByText("Appointments")).toBeInTheDocument();
    expect(screen.getByText("Staff")).toBeInTheDocument();
    expect(screen.getByText("Billing")).toBeInTheDocument();
  });

  it("shows the user name in the sidebar", () => {
    render(<Dashboard />);
    expect(screen.getByText("Dr. Smith")).toBeInTheDocument();
  });

  it("displays the Patient Records heading", () => {
    render(<Dashboard />);
    expect(screen.getByText("Patient Records")).toBeInTheDocument();
  });

  it("has a New Profile button", () => {
    render(<Dashboard />);
    expect(screen.getByText("New Profile")).toBeInTheDocument();
  });

  it("has a search input", () => {
    render(<Dashboard />);
    expect(
      screen.getByPlaceholderText("Search by name, medical ID, or phone..."),
    ).toBeInTheDocument();
  });
});
