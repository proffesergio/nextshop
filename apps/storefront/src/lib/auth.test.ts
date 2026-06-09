import { describe, it, expect, vi, afterEach } from "vitest";
import { authorizeOwner } from "./owner-auth";

afterEach(() => vi.unstubAllEnvs());

describe("authorizeOwner", () => {
  it("accepts the env-configured owner", () => {
    vi.stubEnv("ADMIN_EMAIL", "owner@shop.fi");
    vi.stubEnv("ADMIN_PASSWORD", "s3cret");
    expect(authorizeOwner({ email: "owner@shop.fi", password: "s3cret" })).toEqual(
      expect.objectContaining({ id: "owner" }),
    );
  });

  it("rejects bad credentials", () => {
    vi.stubEnv("ADMIN_EMAIL", "owner@shop.fi");
    vi.stubEnv("ADMIN_PASSWORD", "s3cret");
    expect(authorizeOwner({ email: "owner@shop.fi", password: "wrong" })).toBeNull();
  });

  it("falls back to dev credentials outside production when env is unset", () => {
    expect(authorizeOwner({ email: "owner@nextshop.dev", password: "nextshop-dev" })).toEqual(
      expect.objectContaining({ id: "owner" }),
    );
  });

  it("rejects everything in production when env is unset", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(authorizeOwner({ email: "owner@nextshop.dev", password: "nextshop-dev" })).toBeNull();
  });
});
