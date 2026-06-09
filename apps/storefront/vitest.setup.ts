import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// next/navigation has no router context under jsdom — provide a no-op stub.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
