import {
  ChatBubbleBottomCenterTextIcon,
  Cog6ToothIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import {
  ChatBubbleBottomCenterTextIcon as ChatBubbleBottomCenterTextIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  UsersIcon as UsersIconSolid,
} from "@heroicons/react/24/solid";

export const navLinks = [
  {
    value: "/chats",
    icon: <ChatBubbleBottomCenterTextIcon className="size-6 md:size-5" />,
    activeIcon: (
      <ChatBubbleBottomCenterTextIconSolid className="size-6 md:size-5" />
    ),
    title: "Chats",
  },
  {
    value: "/users",
    icon: <UsersIcon className="size-6 md:size-5" />,
    activeIcon: <UsersIconSolid className="size-6 md:size-5" />,
    title: "Users",
  },
  {
    value: "/settings",
    icon: <Cog6ToothIcon className="size-6 md:size-5" />,
    activeIcon: <Cog6ToothIconSolid className="size-6 md:size-5" />,
    title: "Settings",
  },
];
