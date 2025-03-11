import type { JSX } from "react";

import { useComboboxFilter, useId } from "@lib-hooks";
import { Combobox, Flex } from "@lib-components";
import type { TComboboxProps } from "@lib-components";

import { OptionLayoutTemplate } from "../../templates";
import useClasses from "./styles";

type TProps = {};

export default function OptionTrace({}: TProps): JSX.Element {
  const classes = useClasses();
  return (
    <OptionLayoutTemplate
      header="Trace a Word"
      subtitle="Use a word as a anchor and find words that are related to it."
      onClick={() => {}}
      isLoading={false}
      disableClick={false}
      buttonLabel="Construct trace tree"
    ></OptionLayoutTemplate>
  );
}
