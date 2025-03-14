import { makeStyles, EThemeDimensions } from "@lib-theme";

const useClasses = makeStyles({
  optionList: {
    maxHeight: EThemeDimensions.L6,
    overflowY: "auto",
    overflowX: "hidden",
  },
});

export default useClasses;
