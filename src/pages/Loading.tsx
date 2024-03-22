import { blueDark } from "@radix-ui/colors";
import { ClipLoader } from "react-spinners";

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <ClipLoader color={blueDark.blue6} size={40} speedMultiplier={0.9} />
    </div>
  );
};

export default Loading;
