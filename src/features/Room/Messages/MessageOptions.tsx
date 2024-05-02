import { confirmAlert } from "@/components/Alert/alertStore";
import { DeleteIcon, PencilIcon } from "@/components/Icons";
import { modal } from "@/components/VModal";
import {
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Portal,
} from "@chakra-ui/react";
import {
  ArrowUturnRightIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/20/solid";
import { ClipboardIcon } from "@heroicons/react/24/outline";
import ForwardMessagesModal from "../ForwardMessagesModal";
import EditMessageForm from "./EditMessageModal";
import { useMessageContext } from "./Message";

const MessageOptions = () => {
  const { handleDelete, message, setShowHoverCard, setShowMenu } =
    useMessageContext();
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
        <MenuList>
          <MenuItem
            icon={<ClipboardIcon className="h-4 w-4" />}
            command="⌘C"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(message.body);
            }}
          >
            Copy Message
          </MenuItem>

          <MenuItem
            icon={<PencilIcon className="h-4 w-4" />}
            command="⌘E"
            onClick={(e) => {
              e.stopPropagation();
              modal(<EditMessageForm message={message} />);
            }}
          >
            Edit Message
          </MenuItem>
          <MenuItem
            icon={<ArrowUturnRightIcon className="h-4 w-4" />}
            command="⌘F"
            onClick={(e) => {
              e.stopPropagation();
              modal(<ForwardMessagesModal selectedMessages={[message]} />);
            }}
          >
            Forward Message
          </MenuItem>
          <MenuDivider />
          <MenuItem
            icon={<DeleteIcon className="h-4 w-4" />}
            command="⌘D"
            onClick={(e) => {
              confirmAlert({
                message: "Delete this message? This action is irreversible",
                title: "Delete message",
                confirmText: "Delete",
                onConfirm: () => handleDelete(message.$id),
              });
              e.stopPropagation();
            }}
            color={"red.500"}
          >
            Delete
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
  );
};

export default MessageOptions;
