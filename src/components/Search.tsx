import {
  FocusLock,
  Input,
  InputGroup,
  InputLeftElement,
  Popover,
  PopoverAnchor,
  PopoverContent,
  useDisclosure,
} from "@chakra-ui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { blueDark, gray } from "@radix-ui/colors";
import { useState } from "react";
import toast from "react-hot-toast";
import VSkeleton from "./VSkeleton";

function Search({
  handleSearch,
}: {
  handleSearch: (
    searchString: string,
    onCloseSearch: () => void,
  ) => Promise<any[]>;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [results, setResults] = useState<any[]>([]);

  return (
    <Popover
      isLazy={true}
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      placement="bottom"
    >
      <PopoverAnchor>
        <form
          action=""
          className="mb-4 w-full"
          onSubmit={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpen();
            setLoading(true);
            try {
              let searchResults = await handleSearch(search, onClose);

              setResults(searchResults);
            } catch (error) {
              toast.error("Something went wrong");
            } finally {
              setLoading(false);
            }
          }}
        >
          <InputGroup>
            <InputLeftElement>
              <MagnifyingGlassIcon className="ml-1 h-4 w-4 " />
            </InputLeftElement>
            <Input
              variant={"filled"}
              placeholder="Search for a user"
              rounded={"3xl"}
              onChange={(e) => {
                setSearch(e.target.value.trim());
              }}
            />
          </InputGroup>
        </form>
      </PopoverAnchor>
      <PopoverContent
        bg={gray.gray1}
        _dark={{ bg: blueDark.blue1 }}
        _focus={{
          border: "none",
          shadow: "0 0 0 1px gray",
        }}
        py={2}
        px={2}
      >
        {loading ? (
          <VSkeleton />
        ) : results.length > 0 ? (
          <FocusLock>{results}</FocusLock>
        ) : (
          <span className="p-4">No results</span>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default Search;
