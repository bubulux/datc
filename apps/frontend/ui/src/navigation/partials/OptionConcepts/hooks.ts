import type { useState } from "react";
import type { MenuProps as TMenuProps } from "@fluentui/react-components";

/**
 * @param useCheckedValuesState needs to be initialized with { concept: [] }
 */
function useSelectionState(
  useCheckedValuesState: typeof useState<Record<string, string[]>>,
) {
  const [checkedValues, setCheckedValues] = useCheckedValuesState();

  const onChange: TMenuProps["onCheckedValueChange"] = (
    _,
    { name, checkedItems },
  ) => {
    setCheckedValues((s) => ({ ...s, [name]: checkedItems }));
  };

  return { checkedValues, onChange };
}

export { useSelectionState };
