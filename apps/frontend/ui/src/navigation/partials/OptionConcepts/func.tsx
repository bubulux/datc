import type { JSX, Dispatch, SetStateAction } from "react";

import { MenuList } from "@lib-components";

import { OptionLayoutTemplate } from "@app-ui/navigation/templates";
import useOptionConceptsClasses from "@app-ui/navigation/partials/OptionConcepts/styles";
import { MenuItemRadioTemplate } from "@app-ui/navigation/partials/OptionConcepts/template";
import { useSelectionState } from "@app-ui/navigation/partials/OptionConcepts/hooks";

type TProps = {
  concepts: string[];
  /** must be initialized with { concept: [] }, only then inner functions apply state correctly */
  checkedValuesState: Record<string, string[]>;
  setCheckedValuesState: Dispatch<SetStateAction<Record<string, string[]>>>;
  onSearch: () => void;
  isReqestingConcepts: boolean;
  disableButton: boolean;
};

export default function OptionConcepts({
  concepts,
  onSearch,
  isReqestingConcepts,
  checkedValuesState,
  setCheckedValuesState,
  disableButton,
}: TProps): JSX.Element {
  const classes = useOptionConceptsClasses();
  const { checkedValues, onChange } = useSelectionState(
    checkedValuesState,
    setCheckedValuesState,
  );
  return (
    <OptionLayoutTemplate
      header="Search through recongizable concepts"
      subtitle="Choose one from the given list below"
      onClick={onSearch}
      disableClick={disableButton}
      isLoading={isReqestingConcepts}
    >
      <MenuList
        className={classes.list}
        checkedValues={checkedValues}
        onCheckedValueChange={onChange}
      >
        {concepts.map((concept) => (
          <MenuItemRadioTemplate key={`${concept}-key`} value={concept} />
        ))}
      </MenuList>
    </OptionLayoutTemplate>
  );
}
