import { useMessagesContext } from "@/context/MessagesContext";
import {
  IconButton,
  Input,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  useColorMode,
} from "@chakra-ui/react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import { blueDark, gray } from "@radix-ui/colors";
import { useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";

export default function MessageSearchBox() {
  const { colorMode } = useColorMode();
  const { handleSearch, messages, search } = useMessagesContext();

  const initialFocusRef = useRef<HTMLInputElement>(null);
  const [activeMsgIdx, setActiveMsgIdx] = useState<number | null>(null);
  const results = useMemo(() => {
    return messages
      .filter((message) => {
        if (search === "") return false;
        if (message.senderID === "system") return false;
        return message.body.toLowerCase().includes(search.toLowerCase());
      })
      .toReversed();
  }, [messages, search]);

  const handleMessageSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    flushSync(() => {
      handleSearch(e.target.value);
    });
    setActiveMsgIdx(null);
  };
  const scrollToMessage = (idx: number) => {
    const id = results[idx]?.$id;
    if (!id) return;
    const message = document.getElementById(id);
    if (message) {
      message.scrollIntoView({ behavior: "smooth", block: "center" });
      initialFocusRef.current?.focus();
    }
  };
  const handlePrevClick = () => {
    if (activeMsgIdx === 0) return;
    setActiveMsgIdx((prev) => (prev === null ? 0 : prev - 1));
    scrollToMessage(activeMsgIdx !== null ? activeMsgIdx - 1 : 0);
  };

  const handleNextClick = () => {
    if (activeMsgIdx === results.length - 1) return;
    setActiveMsgIdx((prev) => (prev === null ? 0 : prev + 1));
    scrollToMessage(activeMsgIdx !== null ? activeMsgIdx + 1 : 0);
  };
  return (
    <Popover
      initialFocusRef={initialFocusRef}
      onClose={() => {
        setActiveMsgIdx(null);
        handleSearch("");
      }}
    >
      <PopoverTrigger>
        <IconButton
          variant={"ghost"}
          size={"sm"}
          aria-label="Search for message"
          icon={<MagnifyingGlassIcon className="h-4 w-4 " />}
        />
      </PopoverTrigger>
      <PopoverContent bg={colorMode === "light" ? gray.gray2 : blueDark.blue2}>
        <PopoverBody className="flex items-center justify-between">
          <span className="flex items-baseline justify-between gap-1">
            <Input
              ref={initialFocusRef}
              rounded={"lg"}
              variant={"filled"}
              size={"sm"}
              placeholder="Search for messages"
              type="search"
              onChange={handleMessageSearch}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleNextClick();
                }
                //handle arrow up
                if (e.key === "ArrowUp") {
                  handlePrevClick();
                  e.preventDefault();
                }
                //handle arrow down
                if (e.key === "ArrowDown") {
                  handleNextClick();
                  e.preventDefault();
                }
              }}
            />
            {results.length > 0 && activeMsgIdx !== null ? (
              <span className="flex-none text-xs dark:text-gray-500">
                {activeMsgIdx + 1} of {results.length}
              </span>
            ) : null}
          </span>
          <span className="flex gap-1">
            <IconButton
              variant={"ghost"}
              size={"sm"}
              aria-label="Previous message"
              icon={<ChevronUpIcon className="h-4 w-4 " />}
              onClick={(e) => handlePrevClick()}
              isDisabled={
                activeMsgIdx === 0 ||
                activeMsgIdx === null ||
                results.length === 0
              }
            />
            <IconButton
              variant={"ghost"}
              size={"sm"}
              aria-label="Next message"
              icon={<ChevronDownIcon className="h-4 w-4 " />}
              onClick={(e) => handleNextClick()}
              isDisabled={
                results.length === 0
                  ? true
                  : activeMsgIdx === results.length - 1
              }
            />
          </span>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
