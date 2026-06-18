import { useCallback, useState } from "react";

export function useApi<TArgs extends any[], TRes>(fn: (...args: TArgs) => Promise<TRes>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TRes | null>(null);

  const call = useCallback(async (...args: TArgs) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn(...args);
      setData(res);
      return res;
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [fn]);

  return { call, loading, error, data };
}

