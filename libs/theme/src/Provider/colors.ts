import type { BrandVariants, Theme } from "@fluentui/react-components";
import { createLightTheme, createDarkTheme } from "@fluentui/react-components";

// const myNewTheme: BrandVariants = {
//   10: "#020403",
//   20: "#111B19",
//   30: "#172E2A",
//   40: "#1C3B36",
//   50: "#1F4942",
//   60: "#23574F",
//   70: "#26665C",
//   80: "#297569",
//   90: "#2C8477",
//   100: "#2E9485",
//   110: "#30A493",
//   120: "#31B4A2",
//   130: "#56C2B0",
//   140: "#7CCEBF",
//   150: "#9DDACE",
//   160: "#BDE6DD",
// };

const myNewTheme: BrandVariants = {
  10: "#000405",
  20: "#011B21",
  30: "#002B36",
  40: "#003746",
  50: "#004558",
  60: "#00526A",
  70: "#00607E",
  80: "#006E92",
  90: "#007CA8",
  100: "#008BBF",
  110: "#0099D7",
  120: "#31A7EA",
  130: "#55B5F9",
  140: "#7CC2FF",
  150: "#A2CEFF",
  160: "#C1DBFF",
};

const lightTheme: Theme = {
  ...createLightTheme(myNewTheme),
};

const darkTheme: Theme = {
  ...createDarkTheme(myNewTheme),
};

[darkTheme.colorBrandForeground1] = [myNewTheme[110]];
[darkTheme.colorBrandForeground2] = [myNewTheme[120]];

export default { light: lightTheme, dark: darkTheme };
