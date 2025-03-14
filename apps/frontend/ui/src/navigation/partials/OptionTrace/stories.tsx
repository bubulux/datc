import type { Meta, StoryObj } from "@storybook/react";
import OptionTrace from "./func";

const meta: Meta = {
  title: "app/ui/navigation/partials/OptionTrace",
  component: OptionTrace,
  args: {
    options: ["apple", "banana", "cherry"],
    disableInput: false,
    showIsSearching: false,
    showNoResults: false,
    showResults: false,
    disableResults: false,
    onChange: () => {},
    onOptionSelect: () => {},
  },
};

export default meta;

type Story = StoryObj<typeof OptionTrace>;

export const Index: Story = {
  args: {
    options: [
      "apple",
      "banana",
      "cherry",
      "date",
      "elderberry",
      "fig",
      "grape",
      "honeydew",
      "kiwi",
      "lemon",
      "mango",
      "nectarine",
      "orange",
      "pear",
      "quince",
      "raspberry",
    ],
  },
};

export const NoResults: Story = {
  args: {
    options: [],
    showNoOptionsFound: true,
  },
};

export const IsUpdatingQuery: Story = {
  args: {
    showIsSearching: true,
  },
};

export const IsBouncingCache: Story = {
  args: {
    showResults: true,
    disableResults: true,
  },
};
