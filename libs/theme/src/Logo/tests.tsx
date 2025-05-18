/* eslint-disable jest/expect-expect */
import { render, screen } from "@tests-unit-browser";
import "@testing-library/jest-dom";

import { Logo } from "@lib-theme";
import logoConst from "@lib-theme/Logo/constants";

function defaultMediumExpect(LogoElement: HTMLElement) {
  expect(LogoElement).toHaveStyle("width: 32px");
  expect(LogoElement).toHaveStyle("height: 32px");
}

function defaultFilledExpect(svgString: string) {
  expect(svgString).toContain(`fill="#2BA5E7"`);
  expect(svgString).toContain(`fill="#EF5198"`);
  expect(svgString).toContain(`fill="#32B9A6"`);
  expect(svgString).toContain(`fill="#FAC710"`);
}

describe("Logo", () => {
  describe("with no props", () => {
    render(<Logo />);
    it("should render with medium dimensions and as filled", () => {
      const LogoElement = screen.getByTestId(logoConst.dataTestId);
      const svgString = LogoElement.innerHTML;

      defaultMediumExpect(LogoElement);
      defaultFilledExpect(svgString);
    });
  });
  describe("with size prop", () => {
    it("should render with extraSmall dimensions", () => {
      render(<Logo size="extraSmall" />);
      const LogoElement = screen.getByTestId(logoConst.dataTestId);

      expect(LogoElement).toHaveStyle("width: 16px");
      expect(LogoElement).toHaveStyle("height: 16px");
    });
    it("should render with small dimensions", () => {
      render(<Logo size="small" />);
      const LogoElement = screen.getByTestId(logoConst.dataTestId);

      expect(LogoElement).toHaveStyle("width: 24px");
      expect(LogoElement).toHaveStyle("height: 24px");
    });
    it("should render with medium dimensions", () => {
      render(<Logo size="medium" />);
      const LogoElement = screen.getByTestId(logoConst.dataTestId);

      defaultMediumExpect(LogoElement);
    });
    it("should render with large dimensions", () => {
      render(<Logo size="large" />);
      const LogoElement = screen.getByTestId(logoConst.dataTestId);

      expect(LogoElement).toHaveStyle("width: 64px");
      expect(LogoElement).toHaveStyle("height: 64px");
    });
    it("should render with extraLarge dimensions", () => {
      render(<Logo size="extraLarge" />);
      const LogoElement = screen.getByTestId(logoConst.dataTestId);

      expect(LogoElement).toHaveStyle("width: 96px");
      expect(LogoElement).toHaveStyle("height: 96px");
    });
  });
  describe("with appearance prop", () => {
    it("should render as filled", () => {
      render(<Logo appereance="filled" />);
      const LogoElement = screen.getByTestId(logoConst.dataTestId);
      const svgString = LogoElement.innerHTML;
      defaultFilledExpect(svgString);
    });
    it("should render as outlined", () => {
      render(<Logo appereance="outlined" />);
      const LogoElement = screen.getByTestId(logoConst.dataTestId);
      const svgString = LogoElement.innerHTML;
      expect(svgString).toContain(`stroke="#2BA5E7"`);
      expect(svgString).toContain(`stroke="#EF5198"`);
      expect(svgString).toContain(`stroke="#32B9A6"`);
      expect(svgString).toContain(`stroke="#FAC710"`);
    });
    it("should render as outlined-neutral", () => {
      render(<Logo appereance="outlined-neutral" />);
      const LogoElement = screen.getByTestId(logoConst.dataTestId);
      const svgString = LogoElement.innerHTML;
      expect(svgString).toContain(`stroke="#F5F5F5"`);
    });
  });
});
