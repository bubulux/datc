import type { JSX } from "react";

import { TabList } from "@lib-components";

import type { TUiBrowseMenuOption } from "@app-ui/navigation/partials/BrowseMenu/types";
import constants from "@app-ui/navigation/partials/BrowseMenu/constants";

import useBrowseListClasses from "@app-ui/navigation/partials/BrowseMenu/shards/BrowseList/styles";
import { TabTemplate } from "@app-ui/navigation/partials/BrowseMenu/shards/BrowseList/templates";

type TProps = {
  currentSelection: TUiBrowseMenuOption;
  setCurrentSelection: (selection: TUiBrowseMenuOption) => void;
};

export default function BrowseList({
  currentSelection,
  setCurrentSelection,
}: TProps): JSX.Element {
  const classes = useBrowseListClasses();
  return (
    <TabList
      vertical
      size="large"
      selectedValue={currentSelection}
      className={classes.root}
    >
      <TabTemplate
        value="Catalogue"
        onClick={setCurrentSelection}
        dataTestId={constants.testIdCatalogueTab}
      />
      <TabTemplate
        value="Concepts"
        onClick={setCurrentSelection}
        dataTestId={constants.testIdConceptsTab}
      />
      <TabTemplate
        value="Trace"
        onClick={setCurrentSelection}
        dataTestId={constants.testIdRandomTab}
      />
      <TabTemplate
        value="Word"
        onClick={setCurrentSelection}
        dataTestId={constants.testIdWordTab}
      />
      <TabTemplate
        value="Filter"
        onClick={setCurrentSelection}
        dataTestId={constants.testIdFilterTab}
      />
    </TabList>
  );
}
