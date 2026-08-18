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
  it("contains the glass utility class", () => {
    expect(cssContent).toContain(".glass {");
    expect(cssContent).toContain("backdrop-filter: blur(16px)");
    expect(cssContent).toContain("rgba(255, 255, 255, 0.6)");
  });

  it("contains the glass-strong utility class", () => {
    expect(cssContent).toContain(".glass-strong {");
    expect(cssContent).toContain("backdrop-filter: blur(24px)");
    expect(cssContent).toContain("rgba(255, 255, 255, 0.75)");
  });

  it("contains the glass-subtle utility class", () => {
    expect(cssContent).toContain(".glass-subtle {");
    expect(cssContent).toContain("backdrop-filter: blur(12px)");
  });

  it("contains the glass-hover utility class", () => {
    expect(cssContent).toContain(".glass-hover:hover {");
  });

  it("contains the background gradient mesh", () => {
    expect(cssContent).toContain(".bg-gradient-mesh {");
    expect(cssContent).toContain("radial-gradient(ellipse at 20% 20%");
  });

  it("contains the dot pattern background", () => {
    expect(cssContent).toContain(".bg-dots {");
    expect(cssContent).toContain("radial-gradient");
  });

  it("uses cool-toned primary color in oklch", () => {
    // Primary should be a blue-ish cool tone
    expect(cssContent).toMatch(/--primary:\s*oklch\([\d.]+\s+[\d.]+\s+250\)/);
  });

  it("uses light translucent card background", () => {
    expect(cssContent).toMatch(/--card:\s*oklch\(1 0 0 \/ 65%\)/);
  });

  it("includes inset highlight for glass depth", () => {
    expect(cssContent).toContain("inset 0 1px 0 rgba(255, 255, 255, 0.6)");
  });

  it("preserves required Tailwind directives", () => {
    expect(cssContent).toContain('@import "tailwindcss"');
    expect(cssContent).toContain('@import "tw-animate-css"');
  });
});
