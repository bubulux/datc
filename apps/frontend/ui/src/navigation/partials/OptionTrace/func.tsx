import { useState } from "react";
import type { JSX } from "react";

import { useComboboxFilter, useId } from "@lib-hooks";
import { Combobox, Flex } from "@lib-components";
import type { TComboboxProps } from "@lib-components";

import { OptionLayoutTemplate } from "../../templates";
import useClasses from "./styles";

const options = [
  { children: "Alligator", value: "Alligator" },
  { children: "Bee", value: "Bee" },
  { children: "Bird", value: "Bird" },
  { children: "Cheetah", disabled: true, value: "Cheetah" },
  { children: "Dog", value: "Dog" },
  { children: "Dolphin", value: "Dolphin" },
  { children: "Ferret", value: "Ferret" },
  { children: "Firefly", value: "Firefly" },
  { children: "Fish", value: "Fish" },
  { children: "Goat", value: "Goat" },
  { children: "Horse", value: "Horse" },
  { children: "Lion", value: "Lion" },
];

type TProps = {};

export default function OptionTrace({}: TProps): JSX.Element {
  const classes = useClasses();
  const comboId = useId();
  const [query, setQuery] = useState<string>("");

  const children = useComboboxFilter(query, options, {
    noOptionsMessage: "No animals match your search.",
  });
  const onOptionSelect: TComboboxProps["onOptionSelect"] = (e, data) => {
    setQuery(data.optionText ?? "");
  };

  return (
    <OptionLayoutTemplate
      header="Trace a Word"
      subtitle="Use a word as a anchor and find words that are related to it."
      onClick={() => {}}
      isLoading={false}
      disableClick={false}
      buttonLabel="Construct trace tree"
    >
      <Flex direction="column" gap="SNudge">
        <label id={comboId}>Search</label>
        <Combobox
          onOptionSelect={onOptionSelect}
          aria-labelledby={comboId}
          placeholder="Select a known word from the dictionary"
          onChange={(ev) => setQuery(ev.target.value)}
          value={query}
        >
          {children}
        </Combobox>
      </Flex>
    </OptionLayoutTemplate>
  );
}
