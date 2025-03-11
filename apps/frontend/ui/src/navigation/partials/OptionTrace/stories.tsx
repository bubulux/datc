import type { Meta, StoryObj } from "@storybook/react";
import OptionTrace from "./func";

const meta: Meta = {
  title: "app/ui/navigation/partials/OptionTrace",
  component: OptionTrace,
  args: {},
};

export default meta;

type Story = StoryObj<typeof OptionTrace>;

export const Index: Story = {};
