import type { Meta, StoryObj } from "@storybook/react";

import OptionConcepts from "@app-ui/navigation/partials/OptionConcepts";

const meta: Meta = {
  title: "App/UI/Navigation/Partials/OptionConcepts",
  component: OptionConcepts,
  args: {
    concepts: ["Partiality", "Signaling", "Connectivity", "Transformativity"],
    onSearch: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof OptionConcepts>;

export const Index: Story = {};

export const WithOverflow: Story = {
  args: {
    concepts: [
      "Partiality",
      "Signaling",
      "Connectivity",
      "Transformativity",
      "Adaptability",
      "Inclusivity",
      "Interactivity",
      "Reactivity",
      "Sustainability",
    ],
  },
};
