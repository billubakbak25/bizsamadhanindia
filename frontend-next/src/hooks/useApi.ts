"use client";

import { useEffect, useState } from "react";

export type UseApiState<T> = {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  reload: () => void;
};

export function useApi<T>(loader: () => Promise<T>, deps: readonly unknown[] = []): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadIndex, setReloadIndex] = useState(0);

  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setError(null);

    loader()
      .then((response) => {
        if (!isActive) {
          return;
        }

        setData(response);
        setIsLoading(false);
      })
      .catch((nextError) => {
        if (!isActive) {
          return;
        }

        setError(nextError instanceof Error ? nextError : new Error(String(nextError)));
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [...deps, reloadIndex]);

  return {
    data,
    error,
    isLoading,
    reload: () => setReloadIndex((current) => current + 1),
  };
}
