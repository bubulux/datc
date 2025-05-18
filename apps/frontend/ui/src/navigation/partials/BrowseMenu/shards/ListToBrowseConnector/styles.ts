import { EThemeDimensions, makeStyles } from "@lib-theme";
import shared from "@app-ui/navigation/partials/BrowseMenu/shared";

const useListToBrowseConnectorClasses = makeStyles({
  root: {},
  backboneContainer: {
    transform: "translateX(-4px)",
  },
  horizontalShift: {
    transform: "translateX(-8px)",
  },
  connectorContainer: {
    gap: shared.connectorGap,
    width: shared.connectorMinLength,
  },
  connectorVerticalBase: {
    width: shared.connectorThickness,
    height: "68px",
  },
  connectorHorizontalBase: {
    height: shared.connectorThickness,
    minWidth: shared.connectorMinLength,
    borderRadius: shared.connectorBorderRadius,
  },

  activeLine: {
    backgroundColor: shared.connectorColor,
  },

  connectorCatalogue: {
    width: EThemeDimensions.S3,
  },
  connectorConcepts: {
    width: EThemeDimensions.S4,
  },
  connectorTrace: {
    width: EThemeDimensions.M1,
  },
  connectorWord: {
    width: EThemeDimensions.M1,
  },
  connectorFilter: {
    width: "124px",
  },
});

export default useListToBrowseConnectorClasses;
