import { useState } from "react";
import { render, screen, fireEvent } from "@tests-unit-browser";
import "@testing-library/jest-dom";

import { BrowseMenuPartial } from "@app-ui/navigation/partials";
import type { TUiBrowseMenuOption } from "@app-ui/navigation/partials/BrowseMenu/types";
import constants from "@app-ui/navigation/partials/BrowseMenu/constants";

function Wrapper() {
  const optionSlot = <div>Option Slot</div>;

  const [currentSelection, setCurrentSelection] =
    useState<TUiBrowseMenuOption>("None");
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <BrowseMenuPartial
      optionSlot={currentSelection === "None" ? null : optionSlot}
      currentSelection={currentSelection}
      setCurrentSelection={(self) => {
        setCurrentSelection(self);
      }}
      isExpanded={isExpanded}
      toggleExpand={() => {
        setIsExpanded((prev) => !prev);
      }}
    />
  );
}

describe("BrowseMenu", () => {
  it("should render without a selection and without any slot", () => {
    render(<Wrapper />);
    expect(screen.queryByText("Option Slot")).not.toBeInTheDocument();

    const catalogueTab = screen.getByTestId(constants.testIdCatalogueTab);
    const conceptsTab = screen.getByTestId(constants.testIdConceptsTab);
    const traceTab = screen.getByTestId(constants.testIdTraceTab);
    const wordTab = screen.getByTestId(constants.testIdWordTab);
    const filterTab = screen.getByTestId(constants.testIdFilterTab);
    expect(catalogueTab).toHaveAttribute("aria-selected", "false");
    expect(conceptsTab).toHaveAttribute("aria-selected", "false");
    expect(traceTab).toHaveAttribute("aria-selected", "false");
    expect(wordTab).toHaveAttribute("aria-selected", "false");
    expect(filterTab).toHaveAttribute("aria-selected", "false");
  });
  it("should render with any selection and with a slot", () => {
    render(<Wrapper />);
    const conceptsTab = screen.getByTestId(constants.testIdConceptsTab);

    fireEvent.click(conceptsTab);
    expect(screen.queryByText("Option Slot")).toBeInTheDocument();
    expect(conceptsTab).toHaveAttribute("aria-selected", "true");
  });
  it("should toggle the expansion", () => {
    render(<Wrapper />);
    const toggleButton = screen.getByTestId(constants.testIdExpandButton);
    const catalogueTab = screen.getByTestId(constants.testIdCatalogueTab);
    const conceptsTab = screen.getByTestId(constants.testIdConceptsTab);
    const traceTab = screen.getByTestId(constants.testIdTraceTab);
    const wordTab = screen.getByTestId(constants.testIdWordTab);
    const filterTab = screen.getByTestId(constants.testIdFilterTab);

    fireEvent.click(wordTab);

    expect(catalogueTab).toBeVisible();
    expect(conceptsTab).toBeVisible();
    expect(traceTab).toBeVisible();
    expect(wordTab).toBeVisible();
    expect(filterTab).toBeVisible();
    expect(screen.queryByText("Option Slot")).toBeInTheDocument();

    fireEvent.click(toggleButton);

    expect(catalogueTab).not.toBeVisible();
    expect(conceptsTab).not.toBeVisible();
    expect(traceTab).not.toBeVisible();
    expect(wordTab).not.toBeVisible();
    expect(filterTab).not.toBeVisible();
    expect(screen.queryByText("Option Slot")).toBeInTheDocument();
  });
});
