import { makeStyles, tokens } from "@lib-theme";

const useClasses = makeStyles({
  root: {},
  optionReadOnly: {
    color: tokens.colorNeutralForeground1,
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "-12px",
  },
});

export default useClasses;
