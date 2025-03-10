import { useState } from "react";
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

export const Index: Story = {
  render: () => {
    const [checkedValues, setCheckedValues] = useState<
      Record<string, string[]>
    >({
      concept: [],
    });
    const [isFetching, setIsFetching] = useState(false);

    return (
      <OptionConcepts
        concepts={[
          "Partiality",
          "Signaling",
          "Connectivity",
          "Transformativity",
        ]}
        onSearch={() => {
          setIsFetching(true);
          setTimeout(() => {
            setIsFetching(false);
          }, 2000);
        }}
        isReqestingConcepts={isFetching}
        disableButton={checkedValues.concept.length === 0 || isFetching}
        checkedValuesState={checkedValues}
        setCheckedValuesState={setCheckedValues}
      />
    );
  },
};

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
  render: () => {
    const [checkedValues, setCheckedValues] = useState<
      Record<string, string[]>
    >({
      concept: [],
    });
    const [isFetching, setIsFetching] = useState(false);

    return (
      <OptionConcepts
        concepts={[
          "Partiality",
          "Signaling",
          "Connectivity",
          "Transformativity",
          "Adaptability",
          "Inclusivity",
          "Interactivity",
          "Reactivity",
          "Sustainability",
        ]}
        onSearch={() => {
          setIsFetching(true);
          setTimeout(() => {
            setIsFetching(false);
          }, 2000);
        }}
        isReqestingConcepts={isFetching}
        disableButton={checkedValues.concept.length === 0 || isFetching}
        checkedValuesState={checkedValues}
        setCheckedValuesState={setCheckedValues}
      />
    );
  },
};
