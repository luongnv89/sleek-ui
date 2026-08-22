import { cn } from "./utils"

describe("cn()", () => {
  test("merges conflicting Tailwind classes with the last one winning (px-2 + px-4 → px-4)", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4")
  })

  test("joins non-conflicting classes from all inputs", () => {
    expect(cn("flex", "items-center", "gap-2")).toBe("flex items-center gap-2")
  })

  test("handles conditional values via falsy filtering (clsx behavior)", () => {
    const isActive = false
    expect(cn("base-class", isActive && "active-class", null, undefined)).toBe("base-class")
    expect(cn("base-class", true && "active-class")).toBe("base-class active-class")
  })

  test("later class group overrides earlier ones per property axis independently", () => {
    expect(cn("p-6 pt-0", "p-8")).toBe("p-8")
    expect(cn("h-10 px-3", "h-9 px-3")).toBe("h-9 px-3")
  })

  test("button variant overrides: caller className wins over base/variant classes", () => {
    const base =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors"
    expect(cn(base, "rounded-full w-full")).not.toContain("rounded-md ")
    expect(cn(base, "bg-primary hover:bg-primary/90", "bg-blue-500")).toBe(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-primary/90 bg-blue-500"
    )
  })

  test("merges rounded, ring, and text size groups used by shadcn-style components", () => {
    expect(cn("rounded-md", "rounded-lg")).toBe("rounded-lg")
    expect(cn("ring-2 ring-ring ring-offset-2", "ring-4")).toBe("ring-ring ring-offset-2 ring-4")
    expect(cn("text-sm text-muted-foreground", "text-xs")).toBe(
      "text-muted-foreground text-xs"
    )
  })

  test("keeps state-variant classes separate from their base counterparts (Tailwind v3 output)", () => {
    expect(cn("bg-primary", "hover:bg-primary/90")).toBe("bg-primary hover:bg-primary/90")
    expect(cn("w-4 h-4", "dark:w-5 dark:h-5")).toBe("w-4 h-4 dark:w-5 dark:h-5")
  })

  test("resolves conflicts inside variants with the later value winning", () => {
    expect(cn("hover:px-2", "hover:px-4")).toBe("hover:px-4")
    expect(cn("dark:bg-black", "dark:bg-white")).toBe("dark:bg-white")
  })

  test("preserves arbitrary-value classes and merges them with named-scale siblings", () => {
    expect(cn("w-[120px]", "w-8")).toBe("w-8")
    expect(cn("w-8", "w-[120px]")).toBe("w-[120px]")
    expect(cn("grid gap-1.5", "grid-cols-3 gap-4")).toBe("grid grid-cols-3 gap-4")
  })
})
