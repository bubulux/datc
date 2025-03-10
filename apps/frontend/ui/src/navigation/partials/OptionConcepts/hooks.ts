import type { SetStateAction, Dispatch } from "react";
import type { MenuProps as TMenuProps } from "@fluentui/react-components";

function useSelectionState(
  checkedValues: Record<string, string[]>,
  setCheckedValues: Dispatch<SetStateAction<Record<string, string[]>>>,
) {
  const onChange: TMenuProps["onCheckedValueChange"] = (
    _,
    { name, checkedItems },
  ) => {
    setCheckedValues((s) => ({ ...s, [name]: checkedItems }));
  };

  return { checkedValues, onChange };
}

export { useSelectionState };
