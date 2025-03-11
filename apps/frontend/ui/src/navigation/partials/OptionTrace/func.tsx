import type { JSX } from "react";

import useOptionTraceClasses from "./styles";

type TProps = {};

export default function OptionTrace({}: TProps): JSX.Element {
  const classes = useOptionTraceClasses();
  return <div className={classes.root}>OptionTrace</div>;
}
