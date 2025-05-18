import { useState } from "react";

import { render, screen, fireEvent } from "@tests-unit-browser";
import "@testing-library/jest-dom";

import OptionTrace from "./func";

describe("OptionTrace", () => {
  it("should render a list of options", () => {
    // Overflow cant be properly tested, will be with playwright
    render(
      <OptionTrace
        options={[
          "apple",
          "banana",
          "cherry",
          "date",
          "fig",
          "grape",
          "kiwi",
          "lemon",
          "mango",
        ]}
        disableInput={false}
        showIsSearching={false}
        showNoOptionsFound={false}
        showResults
        disableResults={false}
        showIsSubmitting={false}
        onChange={() => {}}
        onOptionSelect={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("apple")).toBeVisible();
    expect(screen.getByText("banana")).toBeVisible();
    expect(screen.getByText("cherry")).toBeVisible();
    expect(screen.getByText("date")).toBeVisible();
    expect(screen.getByText("fig")).toBeVisible();
    expect(screen.getByText("grape")).toBeVisible();
    expect(screen.getByText("kiwi")).toBeVisible();
    expect(screen.getByText("lemon")).toBeVisible();
    expect(screen.getByText("mango")).toBeVisible();
  });

  it("should render a message with no words found", () => {
    render(
      <OptionTrace
        options={[]}
        disableInput={false}
        showIsSearching={false}
        showNoOptionsFound
        showResults
        disableResults={false}
        showIsSubmitting={false}
        onChange={() => {}}
        onOptionSelect={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("No matching words found...")).toBeVisible();
  });

  it("should render a spinner when searching for words", () => {
    render(
      <OptionTrace
        options={[]}
        disableInput={false}
        showIsSearching
        showNoOptionsFound={false}
        showResults={false}
        disableResults={false}
        showIsSubmitting={false}
        onChange={() => {}}
        onOptionSelect={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.getByText("Searching, hold on...")).toBeVisible();
  });

  it("should render results that are disabled (for cache bouncing)", () => {
    render(
      <OptionTrace
        options={["apple", "banana", "cherry"]}
        disableInput={false}
        showIsSearching={false}
        showNoOptionsFound={false}
        showResults
        disableResults
        showIsSubmitting={false}
        onChange={() => {}}
        onOptionSelect={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("apple")).toBeVisible();
    expect(screen.getByText("apple")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("banana")).toBeVisible();
    expect(screen.getByText("banana")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("cherry")).toBeVisible();
    expect(screen.getByText("cherry")).toHaveAttribute("aria-disabled", "true");
  });
});
