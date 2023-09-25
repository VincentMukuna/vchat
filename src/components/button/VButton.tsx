import React, { ButtonHTMLAttributes, ReactNode } from "react";

type VButtonProps = {
  children: any;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  type?: "submit" | "reset" | "button";
  variant?: "filled" | "ghost" | "text";
};

const VButton = ({
  children,
  disabled = false,
  className = "",
  onClick,
  type = "button",
  variant = "filled",
}: VButtonProps) => {
  function getButtonStyles() {
    switch (variant) {
      case "ghost":
        return "px-4 py-2 rounded text-tomato10 font-bold tracking-wider   transition-all ";
      default:
        return "px-8 py-2 rounded bg-dark-indigo5 font-bold tracking-wider text-[13px] w-fit text-white dark-text-gray1";
    }
  }
  return (
    <button
      className={getButtonStyles()}
      disabled={disabled}
      type={type}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
export default VButton;
