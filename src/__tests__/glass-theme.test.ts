import { describe, it, expect, beforeAll } from "vitest";
import fs from "fs";
import path from "path";

// Read the CSS file once for all tests
let cssContent: string;

beforeAll(() => {
  const cssPath = path.resolve(__dirname, "../index.css");
  cssContent = fs.readFileSync(cssPath, "utf-8");
});

describe("Glassmorphism theme CSS", () => {
  it("contains the glass utility class with dark translucent background", () => {
    expect(cssContent).toContain(".glass {");
    expect(cssContent).toContain("backdrop-filter: blur(16px)");
    expect(cssContent).toContain("rgba(255, 255, 255, 0.035)");
  });

  it("contains the glass-strong utility class", () => {
    expect(cssContent).toContain(".glass-strong {");
    expect(cssContent).toContain("backdrop-filter: blur(24px)");
  });

  it("contains the glass-subtle utility class", () => {
    expect(cssContent).toContain(".glass-subtle {");
    expect(cssContent).toContain("backdrop-filter: blur(12px)");
  });

  it("contains the glass-hover utility class", () => {
    expect(cssContent).toContain(".glass-hover:hover {");
  });

  it("uses a dark background color (oklch with low lightness)", () => {
    // Background should be dark: oklch with L around 0.11-0.13
    expect(cssContent).toMatch(/--background:\s*oklch\(0\.1[0-9]/);
  });

  it("uses a cool blue primary color", () => {
    expect(cssContent).toMatch(/--primary:\s*oklch\(0\.70\s+0\.16\s+240\)/);
  });

  it("uses translucent dark card background", () => {
    expect(cssContent).toMatch(/--card:\s*oklch\(0\.15\s+0\.016\s+255/);
  });

  it("contains the background gradient mesh", () => {
    expect(cssContent).toContain(".bg-gradient-mesh {");
    expect(cssContent).toContain("radial-gradient(ellipse at 15% 10%");
  });

  it("contains the dot pattern background", () => {
    expect(cssContent).toContain(".bg-dots {");
    expect(cssContent).toContain("radial-gradient");
  });

  it("preserves required Tailwind directives", () => {
    expect(cssContent).toContain('@import "tailwindcss"');
    expect(cssContent).toContain('@import "tw-animate-css"');
  });

  it("has subtle inset highlights for glass depth", () => {
    expect(cssContent).toContain("inset 0 1px 0 rgba(255, 255, 255, 0.04)");
  });

  it("uses dark border color", () => {
    expect(cssContent).toMatch(/--border:\s*oklch\(0\.25\s+0\.012\s+255\)/);
  });
});
