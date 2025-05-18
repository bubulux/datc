import type { Meta, StoryObj } from "@storybook/react";

import { useState, useEffect } from "react";

import { useDebounce } from "@lib-hooks";
import { Flex } from "@lib-components";
import OptionTrace from "./func";

const meta: Meta = {
  title: "app/ui/navigation/partials/OptionTrace",
  component: OptionTrace,
  args: {
    options: ["apple", "banana", "cherry"],
    disableInput: false,
    showIsSearching: false,
    showNoResults: false,
    showResults: true,
    disableResults: false,
    showIsSubmitting: false,
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
    showResults: false,
  },
};

export const IsBouncingCache: Story = {
  args: {
    disableResults: true,
  },
};

export const IsSubmittingAndBlockingInput: Story = {
  args: {
    showIsSubmitting: true,
    disableInput: true,
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
  const response: string[] = possibleQueries[query] ?? [];

  return new Promise<string[]>((resolve) => {
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
    const [isSearching, setIsSearching] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);
    const [currentRequest, setCurrentRequest] = useState("");

    useEffect(() => {
      // first check if the debounced query exists in the cache
      // if yes apply the cache to the current options
      // if not fetch from the fake api, apply query to cache and set then to current options list

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (queryToOptionsCache[debouncedQuery]) {
        setOptions(queryToOptionsCache[debouncedQuery]);
      } else {
        setIsSearching(true);
        // eslint-disable-next-line no-void, promise/always-return
        void fakeApi(debouncedQuery).then((response) => {
          setOptions(response);
          setQueryToOptionsCache({
            ...queryToOptionsCache,
            [debouncedQuery]: response,
          });
          setIsSearching(false);
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedQuery]);

    return (
      <Flex gap="XXL" alignItems="center">
        <OptionTrace
          options={options}
          disableInput={isRequesting}
          showIsSearching={isSearching}
          disableResults={isBouncing}
          showNoOptionsFound={!isSearching && options.length === 0}
          showResults={!isSearching && options.length > 0}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          onOptionSelect={(word) => {
            setCurrentRequest(word);
            setIsRequesting(true);
            setTimeout(() => {
              setIsRequesting(false);
            }, 3000);
          }}
          showIsSubmitting={isRequesting}
        />
        <span>{`Current request: ${currentRequest || "none"}`}</span>
      </Flex>
    );
  },
};
