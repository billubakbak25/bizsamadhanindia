"use client";

import { useEffect, useRef, useState } from "react";

export type PollingState<T> = {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
};

export function usePollingResource<T>(loader: () => Promise<T>, deps: readonly unknown[] = [], intervalMs = 30000): PollingState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const loaderRef = useRef(loader);

  loaderRef.current = loader;

  async function run(nextLoading = true) {
    if (nextLoading) {
      setIsLoading(true);
    }

    try {
      const response = await loaderRef.current();
      setData(response);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError : new Error(String(nextError)));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    (async () => {
      if (!active) {
        return;
      }

      await run(true);
    })();

    if (intervalMs > 0) {
      timer = setInterval(() => {
        if (document.visibilityState === "hidden") {
          return;
        }

        void run(false);
      }, intervalMs);
    }

    return () => {
      active = false;
      if (timer) {
        clearInterval(timer);
      }
    };
  }, deps);

  return {
    data,
    error,
    isLoading,
    refresh: () => run(false),
  };
}
