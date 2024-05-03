import { confirmAlert } from "@/components/Alert/alertStore";
import { DeleteIcon, PencilIcon } from "@/components/Icons";
import { modal } from "@/components/VModal";
import { removeDuplicates } from "@/utils/utils";
import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
} from "@chakra-ui/react";
import {
  ArrowUturnRightIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/20/solid";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import { blueDark } from "@radix-ui/colors";
import ForwardMessagesModal from "../ForwardMessagesModal";
import EditMessageForm from "./EditMessageModal";
import { useMessageContext } from "./Message";

export type AllowedMessageActions =
  | "message.copy"
  | "message.edit"
  | "message.forward"
  | "message.delete";

interface MessageOptionsProps {
  allowedActions: AllowedMessageActions[];
}

const MessageOptions = ({
  allowedActions = ["message.copy", "message.edit", "message.forward"],
}: MessageOptionsProps) => {
  const { handleDelete, message, setShowHoverCard, setShowMenu } =
    useMessageContext();
  const messageOptionsItem: {
    key: AllowedMessageActions;
    icon: JSX.Element;
    label: string;
    action: () => void;
    props?: Record<string, unknown>;
  }[] = [
    {
      key: "message.copy",
      icon: <ClipboardIcon className="h-4 w-4" />,
      label: "Copy Message",
      action: () => navigator.clipboard.writeText(message.body),
    },
    {
      key: "message.edit",
      icon: <PencilIcon className="h-4 w-4" />,
      label: "Edit Message",
      action: () => modal(<EditMessageForm message={message} />),
    },
    {
      key: "message.forward",
      icon: <ArrowUturnRightIcon className="h-4 w-4" />,
      label: "Forward Message",
      action: () =>
        modal(<ForwardMessagesModal selectedMessages={[message]} />),
    },
    {
      key: "message.delete",
      icon: <DeleteIcon className="h-4 w-4" />,
      label: "Delete",
      props: { color: "red.500" },
      action: () => {
        confirmAlert({
          message: "Delete this message? This action is irreversible",
          title: "Delete message",
          confirmText: "Delete",
          onConfirm: () => handleDelete(message.$id),
        });
      },
    },
  ];
  return (
    <Menu
      isLazy
      onOpen={() => {
        setShowMenu(true);
        setShowHoverCard(true);
      }}
      onClose={() => {
        setShowHoverCard(false);
        setShowMenu(false);
      }}
    >
      <MenuButton
        as={IconButton}
        aria-label="message options"
        variant={"ghost"}
        size={"xs"}
        icon={<EllipsisHorizontalIcon className="h-4 w-4" />}
      />
      <Portal>
        <MenuList bg={blueDark.blue2} p={1}>
          {removeDuplicates(messageOptionsItem)
            .filter((item) => allowedActions.includes(item.key))
            .map((item) => (
              <MenuItem
                bg={blueDark.blue2}
                _hover={{
                  bg: blueDark.blue3,
                }}
                key={item.key}
                icon={item.icon}
                onClick={item.action}
                {...(item?.props || {})}
              >
                {item.label}
              </MenuItem>
            ))}
        </MenuList>
      </Portal>
    </Menu>
  );
};

export default MessageOptions;
