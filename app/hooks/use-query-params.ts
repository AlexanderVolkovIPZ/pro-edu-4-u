'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';

type QueryParams = Record<string, string | number | undefined | boolean>;

export const useQueryParams = <T extends QueryParams>(defaults: T) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const params: T = useMemo(() => {
    const result: Record<string, unknown> = { ...defaults };

    if (!searchParams) return result as T;

    for (const key of Object.keys(defaults)) {
      const param = searchParams.get(key);
      result[key] = param !== null ? param : defaults[key];
    }

    return result as T;
  }, [searchParams, defaults]);

  useEffect(() => {
    if (!searchParams) return;

    const urlParams = new URLSearchParams(searchParams.toString());
    let changed = false;

    Object.entries(defaults).forEach(([key, value]) => {
      if (!searchParams.has(key)) {
        urlParams.set(key, String(value));
        changed = true;
      }
    });

    if (changed) {
      router.replace(`?${urlParams.toString()}`);
    }
  }, [searchParams, defaults, router]);

  const setParams = useCallback(
    (newParams: Partial<T>) => {
      if (!searchParams) return;

      const urlParams = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          urlParams.set(key, String(value));
        } else {
          urlParams.delete(key);
        }
      });

      router.push(`?${urlParams.toString()}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [router, searchParams]
  );

  return { params, setParams };
};
