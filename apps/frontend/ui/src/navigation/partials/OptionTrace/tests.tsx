import { render, screen, fireEvent } from "@tests-unit-browser";
import "@testing-library/jest-dom";

import OptionTrace from "./func";

describe("OptionTrace", () => {
  describe("should render", () => {
    it("a list of options", () => {
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

    it("a message with no words found", () => {
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

    it("a spinner when searching for words", () => {
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

    it("results that are disabled (for cache bouncing)", () => {
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
      expect(screen.getByText("apple")).toHaveAttribute(
        "aria-disabled",
        "true",
      );
      expect(screen.getByText("banana")).toBeVisible();
      expect(screen.getByText("banana")).toHaveAttribute(
        "aria-disabled",
        "true",
      );
      expect(screen.getByText("cherry")).toBeVisible();
      expect(screen.getByText("cherry")).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    });

    it("a spinner next to the input and blocking the input", () => {
      render(
        <OptionTrace
          options={[]}
          disableInput
          showIsSearching={false}
          showNoOptionsFound={false}
          showResults={false}
          disableResults={false}
          showIsSubmitting
          onChange={() => {}}
          onOptionSelect={() => {}}
        />,
      );
      expect(screen.getByLabelText("Submitting...")).toBeVisible();
      expect(screen.getByRole("combobox")).toBeDisabled();
    });
  });

  describe("should call", () => {
    it("onChange when the input changes", () => {
      const handleChange = jest.fn();
      render(
        <OptionTrace
          options={["apple", "banana", "cherry"]}
          disableInput={false}
          showIsSearching={false}
          showNoOptionsFound={false}
          showResults={false}
          disableResults={false}
          showIsSubmitting={false}
          onChange={handleChange}
          onOptionSelect={() => {}}
        />,
      );

      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "apple" },
      });
      expect(handleChange).toHaveBeenCalled();
    });

    it("onOptionSelect when an option is clicked", () => {
      const handleOptionSelect = jest.fn();
      render(
        <OptionTrace
          options={["apple", "banana", "cherry"]}
          disableInput={false}
          showIsSearching={false}
          showNoOptionsFound={false}
          showResults
          disableResults={false}
          showIsSubmitting={false}
          onChange={() => {}}
          onOptionSelect={handleOptionSelect}
        />,
      );

      fireEvent.click(screen.getByRole("combobox"));

      fireEvent.click(screen.getByText("apple"));
      expect(handleOptionSelect).toHaveBeenCalledWith("apple");
    });
  });
});
