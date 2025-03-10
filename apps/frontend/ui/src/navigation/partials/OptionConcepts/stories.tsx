import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import OptionConcepts from "@app-ui/navigation/partials/OptionConcepts";

const meta: Meta = {
  title: "App/UI/Navigation/Partials/OptionConcepts",
  component: OptionConcepts,
};

export default meta;

type Story = StoryObj<typeof OptionConcepts>;

export const Index: Story = {
  argTypes: {
    concepts: { control: false },
    onSearch: { control: false },
    checkedValuesState: { control: false },
    setCheckedValuesState: { control: false },
  },
  render: (props) => {
    const [checkedValues, setCheckedValues] = useState<
      Record<string, string[]>
    >({
      concept: [],
    });

    return (
      <OptionConcepts
        concepts={[
          "Partiality",
          "Signaling",
          "Connectivity",
          "Transformativity",
        ]}
        onSearch={() => {}}
        isReqestingConcepts={props.isReqestingConcepts}
        disableButton={props.disableButton}
        checkedValuesState={checkedValues}
        setCheckedValuesState={setCheckedValues}
      />
    );
  },
};

export const FlowWithoutOverflow: Story = {
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

export const FlowWithOverflow: Story = {
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
