import { useSWRConfig } from "swr";

const useSWROptimistic = (key: string) => {
  const { mutate } = useSWRConfig();

  const optimisticUpdate = (
    data: any,
    {
      revalidate,
      optimisticData,
    }: {
      revalidate?: boolean;
      optimisticData?: (data: any) => any;
    } = {
      revalidate: false,
      optimisticData: (data: any) => data,
    },
  ) => {
    return mutate(key, data, { revalidate, optimisticData });
  };

  return {
    update: optimisticUpdate,
  };
};

export default useSWROptimistic;
