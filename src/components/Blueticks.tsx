import { CheckIcon } from "@heroicons/react/20/solid";

const Blueticks = ({
  read,
  className,
}: {
  read: boolean;
  className?: string;
}) => {
  return (
    <div
      className={`flex  ${read ? "text-dark-blue7" : ""} ${
        className && className
      }`}
    >
      <CheckIcon className="w-3 h-3 -mr-2 transition-colors" />
      <CheckIcon className="w-3 h-3 transition-colors" />
    </div>
  );
};

export default Blueticks;
