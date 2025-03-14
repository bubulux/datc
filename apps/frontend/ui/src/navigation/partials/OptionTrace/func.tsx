import { useState } from "react";
import type { JSX } from "react";

import { useId } from "@lib-hooks";
import { Combobox, Field, Option, Spinner } from "@lib-components";
import type { TComboboxProps } from "@lib-components";

import { OptionLayoutTemplate } from "../../templates";
import useClasses from "./styles";

type TProps = {
  results: string[];
  isBouncing: boolean;
  isFetching: boolean;
  onChange: TComboboxProps["onChange"];
  onOptionSelect: () => void;
};

export default function OptionTrace({
  results,
  isBouncing,
  isFetching,
  onChange,
  onOptionSelect,
}: TProps): JSX.Element {
  const classes = useClasses();
  const comboId = useId("combobox");

  return (
    <OptionLayoutTemplate
      header="Trace a Word"
      subtitle="Use a word as a anchor and find words that are related to it."
      isLoading={false}
      withoutButton
    >
      <Field id={comboId} label="Select a known word">
        <Combobox
          aria-labelledby={comboId}
          placeholder="Start typing for suggestions"
          onChange={onChange}
        >
          {isFetching ? (
            <Option text="" disabled className={classes.loading}>
              <Spinner size="extra-small" label="Searching, hold on..." />
            </Option>
          ) : (
            results.map((word) => (
              <Option
                key={word}
                text={word}
                disabled={isBouncing}
                onClick={onOptionSelect}
              >
                {word}
              </Option>
            ))
          )}

          {results.length === 0 && (
            <Option text="" disabled className={classes.optionReadOnly}>
              No matching words found...
            </Option>
          )}
        </Combobox>
      </Field>
    </OptionLayoutTemplate>
  );
}
