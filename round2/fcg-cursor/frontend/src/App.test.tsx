import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("renders controls", () => {
    render(<App />);
    expect(screen.getByText("Generate print-ready card backs")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Surprise Me" })).toBeInTheDocument();
  });
});
