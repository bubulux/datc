import { useState } from "react";

import { render, screen, fireEvent } from "@tests-unit-browser";
import "@testing-library/jest-dom";

import OptionConcepts from "@app-ui/navigation/partials/OptionConcepts";

function Wrapper() {
  const [checkedValues, setCheckedValues] = useState<Record<string, string[]>>({
    concept: [],
  });
  const [isFetching, setIsFetching] = useState(false);

  return (
    <OptionConcepts
      concepts={["concept1", "concept2", "concept3"]}
      onSearch={() => {
        setIsFetching(true);
        setTimeout(() => {
          setIsFetching(false);
        }, 3000);
      }}
      isReqestingConcepts={isFetching}
      disableButton={checkedValues.concept.length === 0 || isFetching}
      checkedValuesState={checkedValues}
      setCheckedValuesState={setCheckedValues}
    />
  );
}

describe("OptionConcepts", () => {
  it("should render with given concepts", () => {
    render(<Wrapper />);

    const menuList = screen.getByRole("menu");
    expect(menuList).toBeInTheDocument();

    const concept1 = screen.getByText("concept1");
    expect(concept1).toBeInTheDocument();
    const concept2 = screen.getByText("concept2");
    expect(concept2).toBeInTheDocument();
    const concept3 = screen.getByText("concept3");
    expect(concept3).toBeInTheDocument();
  });

  it("should be able to select different concepts", () => {
    render(<Wrapper />);

    const concept1 = screen.getByText("concept1");
    const concept2 = screen.getByText("concept2");
    const concept3 = screen.getByText("concept3");

    const searchButton = screen.getByRole("button", { name: "Search" });
    expect(searchButton).toBeInTheDocument();
    expect(searchButton).toBeDisabled();

    fireEvent.click(concept1);
    // has aria-checked attribute, when checked
    expect(concept1.parentElement).toHaveAttribute("aria-checked", "true");
    expect(searchButton).toBeEnabled();

    fireEvent.click(concept2);
    expect(concept2.parentElement).toHaveAttribute("aria-checked", "true");
    // concept1 should be unchecked -> exclusitivity
    expect(concept1.parentElement).toHaveAttribute("aria-checked", "false");

    fireEvent.click(concept3);
    expect(concept3.parentElement).toHaveAttribute("aria-checked", "true");
    expect(concept2.parentElement).toHaveAttribute("aria-checked", "false");
  });

  it("should show loading state and disable search button", () => {
    render(<Wrapper />);

    const concept1 = screen.getByText("concept1");
    const searchButton = screen.getByRole("button", { name: "Search" });

    fireEvent.click(concept1);
    expect(searchButton).toBeEnabled();

    fireEvent.click(searchButton);
    expect(searchButton).toBeDisabled();

    // role progressbar is used for loading state
    const loading = screen.getByRole("progressbar");
    expect(loading).toBeInTheDocument();
  });
});
