import { useRef } from "react";
import useSWRInfinite from "swr/infinite";

export function useInfinite<T>(
  paginatedFetcher: (...args: any[]) => Promise<[results: T[], total: number]>,
  baseKey: string | undefined,
  re: RegExp,
  fetcherArgs: any[],
) {
  const totalRef = useRef(0);
  function getKey(pageIndex: number, previousPageData: any) {
    if (!baseKey) return undefined;
    if (previousPageData && !previousPageData.length) return null;
    if (pageIndex === 0) {
      return baseKey;
    }
    return baseKey + "-" + previousPageData.at(-1).$id;
  }

  async function fetcher(key: string) {
    let match = key.match(re);
    if (match) {
      const [results, total] = await paginatedFetcher(...fetcherArgs, match[1]);
      totalRef.current = total;
      return results;
    }
    const [results, total] = await paginatedFetcher(...fetcherArgs);
    totalRef.current = total;
    return results;
  }

  const res = useSWRInfinite(getKey, fetcher);
  return { ...res, totalRef };
}
