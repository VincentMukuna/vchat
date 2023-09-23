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
        return "px-12 py-2 rounded text-tomato10 hover:border-[1px] border-tomato11 transition-all hover:bg-tomato12/20";
      default:
        return "px-12 py-2 rounded bg-dark-blue6 w-fit";
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
