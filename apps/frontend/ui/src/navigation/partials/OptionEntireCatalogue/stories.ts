import type { Meta, StoryObj } from "@storybook/react";

import OptionEntireCatalogue from "./func";

const meta: Meta = {
  title: "app/ui/navigation/partials/OptionEntireCatalogue",
  component: OptionEntireCatalogue,
  args: {},
};

export default meta;

type Story = StoryObj<typeof OptionEntireCatalogue>;

export const Index: Story = {};
