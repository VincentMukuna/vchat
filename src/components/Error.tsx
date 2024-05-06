import React from "react";

// ErrorProps extends normal props for div element with an error message
interface ErrorProps extends React.HTMLProps<HTMLDivElement> {
  message: string;
}

export default function Error({ message, children }: ErrorProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <h1 className="text-xl font-bold ">Whoops! Something went wrong</h1>
      <h1 className="">{message}</h1>
      {children}
    </div>
  );
}
