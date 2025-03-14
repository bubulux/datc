import { useState, useEffect } from "react";

export default function useDebounce<T>(value: T, delay: number): [T, boolean] {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isBouncing, setIsBouncing] = useState(false);

  useEffect(() => {
    setIsBouncing(true);
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
      setIsBouncing(false);
    };
  }, [value, delay]);

  return [debouncedValue, isBouncing];
}
