import React from "react";
import {
  indigo,
  teal,
  jade,
  lime,
  gold,
  bronze,
  brown,
  yellow,
  amber,
  orange,
  tomato,
  red,
  blue,
  mint,
  sky,
} from "@radix-ui/colors";

// Define BG_COLORS without imported colors
const BG_COLORS = [
  indigo.indigo11,
  teal.teal11,
  jade.jade11,
  lime.lime11,
  gold.gold11,
  bronze.bronze11,
  brown.brown11,
  yellow.yellow11,
  amber.amber11,
  orange.orange11,
  tomato.tomato11,
  red.red11,
  blue.blue11,
  mint.mint11,
  sky.sky11,
];

function calculateBackgroundColor(name: string = "NU"): string {
  // Simple algorithm to map initials to a color
  const initials = name
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  const charCodeSum = initials
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return BG_COLORS[charCodeSum % BG_COLORS.length] as string;
}

function getCapitalizedInitials(input: string = "No User"): string {
  const names = input.trim().split(" ");

  if (names.length === 0) {
    return "";
  }

  if (names.length === 1) {
    return names[0]!.charAt(0).toUpperCase();
  }

  return `${names[0]!.charAt(0).toUpperCase()}${names[1]!
    .charAt(0)
    .toUpperCase()}`;
}

function getSize(size: string) {
  switch (size) {
    case "small":
      return "w-8 h-8 text-xl";
    case "large":
      return "w-36 h-36 text-[4.5rem] left-1 ";
    default:
      return "w-12 h-12 text-3xl";
  }
}

type AvatarProps = {
  name: string;
  src?: string;
  className?: string;
  size?: "small" | "medium" | "large";
};

const Avatar = ({ src, name, className, size = "medium" }: AvatarProps) => {
  const initials = getCapitalizedInitials(name);

  if (src) {
    return (
      <img
        src={src}
        alt={`${name}'s profile picture`}
        className={`${getSize(size)} rounded-full`}
      />
    );
  } else {
    const bgColor = calculateBackgroundColor(name);
    return (
      <div
        style={{ backgroundColor: bgColor }}
        className={
          className
            ? className
            : `p-3 rounded-full ${getSize(
                size,
              )} flex items-center justify-center  font-mono text-gray-100 text-center`
        }
      >
        <span className="relative leading-6 ">{initials}</span>
      </div>
    );
  }
};

export default React.memo(Avatar);
