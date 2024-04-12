import { SolarCheckReadLinear } from "./Icons";

const Blueticks = ({
  read,
  className,
}: {
  read: boolean;
  className?: string;
}) => {
  return (
    <SolarCheckReadLinear
      className={`h-4 w-4 ${read ? "text-blue-700" : "text-gray-500 "}`}
    />
  );
};

export default Blueticks;
