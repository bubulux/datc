import type { JSX } from "react";

import { useFuiProviderNode } from "fluentui-helpers";

import { Combobox as UmountedCombobox } from "@fluentui/react-components";
import type { ComboboxProps } from "@fluentui/react-components";

type TProps = Exclude<ComboboxProps, "mountNode">;

export default function Combobox(props: TProps): JSX.Element {
  const { fuiProviderNode } = useFuiProviderNode();
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <UmountedCombobox {...props} mountNode={fuiProviderNode} />;
}
