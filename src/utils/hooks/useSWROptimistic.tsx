import { useSWRConfig } from "swr";

const useSWROptimistic = (key: string) => {
  const { mutate } = useSWRConfig();

  const optimisticUpdate = (
    data: any,
    { revalidate } = { revalidate: false },
  ) => {
    return mutate(key, data, { revalidate });
  };

  return {
    update: optimisticUpdate,
  };
};

export default useSWROptimistic;
