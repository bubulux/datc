import type { JSX, ReactNode } from "react";

import { Flex, Button, Spinner } from "@lib-components";
import { Subtitle2, Caption2 } from "@lib-theme";

import useOptionLayoutClasses from "@app-ui/navigation/templates/OptionLayout/styles";

type TProps = {
  header: string;
  onClick?: () => void;
  disableClick?: boolean;
  buttonLabel?: string;
  isLoading?: boolean;
  subtitle?: string;
  children?: ReactNode;
  withoutButton?: boolean;
};

export default function OptionLayout({
  header,
  buttonLabel = "Search",
  onClick = () => {},
  subtitle = undefined,
  children = undefined,
  disableClick = false,
  isLoading = false,
  withoutButton = false,
}: TProps): JSX.Element {
  const classes = useOptionLayoutClasses();
  return (
    <Flex className={classes.root} direction="column" padding={["M"]} gap="L">
      <Flex direction="column" gap="XS">
        <Subtitle2>{header}</Subtitle2>
        {subtitle && <Caption2>{subtitle}</Caption2>}
      </Flex>
      {children}

      {!withoutButton && (
        <Button appearance="primary" disabled={disableClick} onClick={onClick}>
          {isLoading ? (
            <Spinner size="tiny" appearance="inverted" />
          ) : (
            buttonLabel
          )}
        </Button>
      )}
    </Flex>
  );
}
