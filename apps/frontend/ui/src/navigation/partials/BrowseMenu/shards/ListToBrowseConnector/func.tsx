import type { JSX } from "react";

import { Flex } from "@lib-components";
import { mergeClasses } from "@lib-theme";

import type { TUiBrowseMenuOption } from "@app-ui/navigation/partials/BrowseMenu/types";

import { useEnhancedConnectorClass } from "@app-ui/navigation/partials/BrowseMenu/shards/ListToBrowseConnector/hooks";

import useListToBrowseConnectorClasses from "@app-ui/navigation/partials/BrowseMenu/shards/ListToBrowseConnector/styles";

type TProps = {
  currentSelection: TUiBrowseMenuOption;
};

export default function ListToBrowseConnector({
  currentSelection,
}: TProps): JSX.Element {
  const classes = useListToBrowseConnectorClasses();
  const createHorConnClass = useEnhancedConnectorClass(
    classes.connectorHorizontalBase,
    classes.activeLine,
  );
  const createVerConnClass = useEnhancedConnectorClass(
    classes.connectorVerticalBase,
    classes.activeLine,
  );
  return (
    <Flex>
      <Flex
        direction="column"
        alignItems="end"
        className={classes.connectorContainer}
      >
        <div
          className={createHorConnClass(
            currentSelection === "Catalogue",
            classes.connectorCatalogue,
          )}
        />
        <div
          className={createHorConnClass(
            currentSelection === "Concepts",
            classes.connectorConcepts,
          )}
        />
        <div
          className={createHorConnClass(
            currentSelection === "Trace",
            classes.connectorTrace,
          )}
        />
        <div
          className={createHorConnClass(
            currentSelection === "Word",
            classes.connectorWord,
          )}
        />
        <div
          className={createHorConnClass(
            currentSelection === "Filter",
            classes.connectorFilter,
          )}
        />
      </Flex>
      <Flex className={classes.backboneContainer} direction="column">
        <div className={createVerConnClass(currentSelection === "Catalogue")} />
        <div
          className={createVerConnClass(
            currentSelection === "Concepts" || currentSelection === "Catalogue",
          )}
        />
        <div
          className={createVerConnClass(
            currentSelection === "Word" || currentSelection === "Filter",
          )}
        />
        <div className={createVerConnClass(currentSelection === "Filter")} />
      </Flex>
      {currentSelection !== "None" && (
        <Flex alignItems="center">
          <div
            className={mergeClasses(
              classes.connectorHorizontalBase,
              classes.horizontalShift,
              classes.activeLine,
            )}
          />
        </Flex>
      )}
    </Flex>
  );
}
