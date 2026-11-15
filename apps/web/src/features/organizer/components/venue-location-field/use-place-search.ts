import { useEffect, useRef, useState } from 'react';
import type { PlaceResult } from '@/shared/api/geocoding';

export type PlaceSearch = (
  query: string,
  signal: AbortSignal
) => Promise<PlaceResult[]>;

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; results: PlaceResult[] }
  | { status: 'error' };

/**
 * Runs one address search at a time (a newer search aborts the older one)
 * and ignores answers that arrive after the component unmounted.
 */
export const usePlaceSearch = (search: PlaceSearch) => {
  const [state, setState] = useState<SearchState>({ status: 'idle' });
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const run = async (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      return;
    }
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState({ status: 'loading' });
    try {
      const results = await search(trimmed, controller.signal);
      if (!controller.signal.aborted) {
        setState({ status: 'done', results });
      }
    } catch {
      if (!controller.signal.aborted) {
        setState({ status: 'error' });
      }
    }
  };

  const reset = () => {
    controllerRef.current?.abort();
    setState({ status: 'idle' });
  };

  return { state, run, reset };
};
