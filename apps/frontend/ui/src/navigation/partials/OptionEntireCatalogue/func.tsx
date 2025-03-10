import type { JSX } from "react";

import { OptionLayoutTemplate } from "@app-ui/navigation/templates";

type TProps = {
  onRequestCatalogue: () => void;
};

export default function OptionEntireCatalogue({
  onRequestCatalogue,
}: TProps): JSX.Element {
  return (
    <OptionLayoutTemplate
      header="Catalogue"
      subtitle="Will fetch the entire catalogue"
      onSearch={onRequestCatalogue}
      disabledSearch={false}
    />
  );
}
