import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn (className merger)", () => {
  it("merges two class names", () => {
    const result = cn("foo", "bar");
    expect(result).toBe("foo bar");
  });

  it("deduplicates conflicting Tailwind classes", () => {
    const result = cn("px-4 px-8");
    expect(result).toBe("px-8");
  });

  it("handles conditional classes", () => {
    const showHidden = false;
    const showVisible = true;
    const result = cn("base", showHidden && "hidden", showVisible && "visible");
    expect(result).toContain("base");
    expect(result).toContain("visible");
    expect(result).not.toContain("hidden");
  });

  it("handles undefined and empty inputs", () => {
    const result = cn(undefined, "", null);
    expect(typeof result).toBe("string");
  });
});
