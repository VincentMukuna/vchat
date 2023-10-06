import { CheckIcon } from "@heroicons/react/20/solid";

const Blueticks = ({ read }: { read: boolean }) => {
  return (
    <div
      className={`flex self-end absolute bottom-1 right-1 ${
        read ? "text-dark-blue7" : ""
      }`}
    >
      <CheckIcon className="w-3 h-3 -mr-2 transition-colors" />
      <CheckIcon className="w-3 h-3 transition-colors" />
    </div>
  );
};

export default Blueticks;
