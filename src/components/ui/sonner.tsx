import { Toaster as Sonner } from "sonner"

// Simple Toaster — no next-themes dependency
const Toaster = () => {
  return (
    <Sonner
      theme="dark"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
    />
  )
}

export { Toaster }
