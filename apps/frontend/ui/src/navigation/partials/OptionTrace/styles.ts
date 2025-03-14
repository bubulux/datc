import { makeStyles, EThemeDimensions } from "@lib-theme";

const useClasses = makeStyles({
  optionList: {
    maxHeight: EThemeDimensions.L6,
    overflowY: "auto",
    overflowX: "hidden",
  },
  spinner: {
    padding: "2px",
  },
  field: {
    width: "100%",
  },
});

export default useClasses;
