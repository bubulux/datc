import type { Meta, StoryObj } from "@storybook/react";

import { useState } from "react";

import { useDebounce } from "@lib-hooks";
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

async function fakeApi(query: string) {
  const possibleQueries = {
    a: [
      "apple",
      "avocado",
      "apricot",
      "asparagus",
      "artichoke",
      "arugula",
      "almond",
    ],
    ar: ["artichoke", "arugula"],
    aru: ["arugula"],
    arti: ["artichoke"],
    b: ["banana", "blueberry", "blackberry", "broccoli", "beet", "bean"],
    ba: ["banana", "blueberry", "blackberry"],
    ban: ["banana"],
    c: ["cherry", "cantaloupe", "carrot", "cucumber", "celery", "corn"],
    ch: ["cherry"],
    ca: ["cantaloupe", "carrot"],
    can: ["cantaloupe"],
  };

  // @ts-expect-error - This is a fake API
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const response: string[] | false = possibleQueries[query] ?? false;

  return new Promise<string[] | false>((resolve) => {
    setTimeout(() => {
      resolve(response);
    }, 1000);
  });
}

export const Flow: Story = {
  render: () => {
    const [queryToOptionsCache, setQueryToOptionsCache] = useState<
      Record<string, string[]>
    >({});
    const [options, setOptions] = useState<string[]>([]);
    const [query, setQuery] = useState<string>("");
    const [debouncedQuery, isBouncing] = useDebounce(query, 2000);

    return (
      <OptionTrace
        options={[]}
        disableInput={false}
        showIsSearching={false}
        disableResults={isBouncing}
        showNoOptionsFound={options.length === 0}
        showResults={options.length > 0}
        onChange={(e) => {
          setQuery(e.target.value);
        }}
        onOptionSelect={() => {}}
      />
    );
  },
};
