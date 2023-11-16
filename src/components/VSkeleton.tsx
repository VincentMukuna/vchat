import { HStack, SkeletonCircle, SkeletonText } from "@chakra-ui/react";

const VSkeleton = () => {
  return (
    <HStack className="p-4 w-full">
      <SkeletonCircle size="12" w="14" />
      <SkeletonText
        mt="2"
        noOfLines={2}
        spacing="4"
        skeletonHeight="2"
        w="full"
      />
    </HStack>
  );
};

export default VSkeleton;
