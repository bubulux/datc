import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import OptionEntireCatalogue from "./func";

const meta: Meta = {
  title: "app/ui/navigation/partials/OptionEntireCatalogue",
  component: OptionEntireCatalogue,
  args: {},
};

export default meta;

type Story = StoryObj<typeof OptionEntireCatalogue>;

export const Index: Story = {
  args: {
    isRequestingCatalogue: false,
    disableButton: false,
  },
};

export const Flow: Story = {
  render: () => {
    const [isRequestingCatalogue, setIsRequestingCatalogue] = useState(false);

    return (
      <OptionEntireCatalogue
        onRequestCatalogue={() => {
          setIsRequestingCatalogue(true);
          setTimeout(() => {
            setIsRequestingCatalogue(false);
          }, 3000);
        }}
        isRequestingCatalogue={isRequestingCatalogue}
        disableButton={isRequestingCatalogue}
      />
    );
  },
};
