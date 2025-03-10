import { useState } from "react";

import { render, screen, fireEvent } from "@tests-unit-browser";
import "@testing-library/jest-dom";

import OptionEntireCatalogue from "./func";

describe("OptionEntireCatalogue", () => {
  it("should apply loading and disabling logic when clicked", () => {
    function Wrapper() {
      const [isRequestingCatalogue, setIsRequestingCatalogue] = useState(false);

      return (
        <OptionEntireCatalogue
          onRequestCatalogue={() => {
            setIsRequestingCatalogue(true);
            setTimeout(() => {
              setIsRequestingCatalogue(false);
            }, 3000);
          }}
          isRequestingCatalogue={isRequestingCatalogue}
          disableButton={isRequestingCatalogue}
        />
      );
    }

    render(<Wrapper />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();

    fireEvent.click(button);
    expect(button).toBeDisabled();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
