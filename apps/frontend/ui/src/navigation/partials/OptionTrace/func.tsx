import type { JSX } from "react";

import { useId } from "@lib-hooks";
import { Combobox, Field, Option, Spinner, Flex } from "@lib-components";
import type { TComboboxProps } from "@lib-components";

import { OptionLayoutTemplate } from "../../templates";
import useClasses from "./styles";

type TProps = {
  options: string[];
  disableInput: boolean;
  showIsSearching: boolean;
  showNoOptionsFound: boolean;
  showResults: boolean;
  disableResults: boolean;
  showIsSubmitting: boolean;
  onChange: TComboboxProps["onChange"];
  onOptionSelect: (word: string) => void;
};

export default function OptionTrace({
  options,
  disableInput,
  showIsSearching,
  showNoOptionsFound,
  showResults,
  disableResults,
  showIsSubmitting,
  onChange,
  onOptionSelect,
}: TProps): JSX.Element {
  const classes = useClasses();
  const comboId = useId("combobox");

  return (
    <OptionLayoutTemplate
      header="Trace a Word"
      subtitle="Use a word as a anchor and find words that are related to it."
      withoutButton
    >
      <Flex gap="M" justifyContent="spaceBetween" alignItems="end">
        <Field
          id={comboId}
          label="Select a known word"
          className={classes.field}
        >
          <Combobox
            aria-labelledby={comboId}
            placeholder="Start typing for suggestions"
            onChange={onChange}
            disabled={disableInput}
          >
            <div className={classes.optionList}>
              {showIsSearching && (
                <Flex padding={["S"]} justifyContent="center">
                  <Spinner size="extra-small" label="Searching, hold on..." />
                </Flex>
              )}

              {showResults &&
                options.map((word) => (
                  <Option
                    key={word}
                    text={word}
                    disabled={disableResults}
                    onClick={() => {
                      onOptionSelect(word);
                    }}
                  >
                    {word}
                  </Option>
                ))}

              {showNoOptionsFound && (
                <Flex padding={["S"]}>No matching words found...</Flex>
              )}
            </div>
          </Combobox>
        </Field>
        {showIsSubmitting && (
          <Spinner className={classes.spinner} aria-label="Submitting..." />
        )}
      </Flex>
    </OptionLayoutTemplate>
  );
}
