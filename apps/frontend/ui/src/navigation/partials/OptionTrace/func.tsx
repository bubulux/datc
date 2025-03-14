import type { JSX } from "react";

import { useId } from "@lib-hooks";
import { Combobox, Field, Option, Spinner, Flex } from "@lib-components";
import type { TComboboxProps } from "@lib-components";

import { OptionLayoutTemplate } from "../../templates";
import useClasses from "./styles";

type TProps = {
  results: string[];
  isBouncing: boolean;
  isFetching: boolean;
  requestSubmitted: boolean;
  onChange: TComboboxProps["onChange"];
  onOptionSelect: (word: string) => void;
};

export default function OptionTrace({
  results,
  isBouncing,
  isFetching,
  requestSubmitted,
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
          disabled={requestSubmitted}
        >
          <div className={classes.optionList}>
            {isFetching ? (
              <Flex padding={["S"]} justifyContent="center">
                <Spinner size="extra-small" label="Searching, hold on..." />
              </Flex>
            ) : (
              results.map((word) => (
                <Option
                  key={word}
                  text={word}
                  disabled={isBouncing}
                  onClick={() => {
                    onOptionSelect(word);
                  }}
                >
                  {word}
                </Option>
              ))
            )}

            {results.length === 0 && (
              <Flex padding={["S"]}>No matching words found...</Flex>
            )}
          </div>
        </Combobox>
      </Field>
    </OptionLayoutTemplate>
  );
}
