import type { JSX } from "react";

import { OptionLayoutTemplate } from "@app-ui/navigation/templates";

type TProps = {
  onRequestCatalogue: () => void;
  isRequestingCatalogue: boolean;
  disableButton: boolean;
};

export default function OptionEntireCatalogue({
  onRequestCatalogue,
  isRequestingCatalogue,
  disableButton,
}: TProps): JSX.Element {
  return (
    <OptionLayoutTemplate
      header="Fetch the entire catalogue"
      onClick={onRequestCatalogue}
      disableClick={disableButton}
      isLoading={isRequestingCatalogue}
    />
  );
}
