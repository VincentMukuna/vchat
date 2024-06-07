import { useSWRConfig } from "swr";

type OptimisticUpdateOptions = {
  revalidate?: boolean;
  optimisticData?: (data: any) => any;
};

const defaultOptions: OptimisticUpdateOptions = {
  revalidate: false,
  optimisticData: (data: any) => data,
};

const useSWROptimistic = (key: string) => {
  const { mutate } = useSWRConfig();

  const optimisticUpdate = (
    data: any,
    options: OptimisticUpdateOptions = defaultOptions,
  ) => {
    const { revalidate, optimisticData } = options;
    return mutate(key, data, { revalidate, optimisticData });
  };

  return {
    update: optimisticUpdate,
  };
};

export default useSWROptimistic;
