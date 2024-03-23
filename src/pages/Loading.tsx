import { Spinner } from "@chakra-ui/react";

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner color={"blue.300"} />
    </div>
  );
};

export default Loading;
