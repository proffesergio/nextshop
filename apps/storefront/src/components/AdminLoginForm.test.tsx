import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AdminLoginForm } from "./AdminLoginForm";

describe("AdminLoginForm", () => {
  it("renders email + password fields and a sign-in button", () => {
    render(<AdminLoginForm action={async () => {}} />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows an error message when given", () => {
    render(<AdminLoginForm action={async () => {}} error="Invalid email or password" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid email or password");
  });
});
