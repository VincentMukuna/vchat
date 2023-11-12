import {
  Button,
  FocusLock,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
  SkeletonCircle,
  SkeletonText,
  useDisclosure,
} from "@chakra-ui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import UsersList from "../features/UsersList/UsersList";
import toast from "react-hot-toast";
import api from "../services/api";
import { SERVER } from "../utils/config";
import { Query } from "appwrite";
import { IUserDetails } from "../interfaces";
import React, { Children, useRef, useState } from "react";
import User from "../features/UsersList/User";
import { blue, gray, slateDark } from "@radix-ui/colors";
import { CircleLoader, ClipLoader } from "react-spinners";

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
    <form
      action=""
      className="w-full mb-4"
      onSubmit={async (e) => {
        e.preventDefault();
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
      <Popover
        isLazy={true}
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        placement="bottom"
      >
        <PopoverAnchor>
          <InputGroup>
            <InputLeftElement>
              <MagnifyingGlassIcon className="w-4 h-4 ml-1 " />
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
        </PopoverAnchor>
        <PopoverContent
          bg={gray.gray1}
          _dark={{ bg: slateDark.slate1 }}
          _focus={{
            border: "none",
            shadow: "0 0 0 1px gray",
          }}
          py={4}
          px={2}
        >
          {loading ? (
            <HStack className="p-4">
              <SkeletonCircle size="12" w="14" />
              <SkeletonText
                mt="2"
                noOfLines={2}
                spacing="4"
                skeletonHeight="2"
                w="full"
              />
            </HStack>
          ) : results.length > 0 ? (
            <FocusLock>{results}</FocusLock>
          ) : (
            <span className="p-4">No results</span>
          )}
        </PopoverContent>
      </Popover>
    </form>
  );
}

export default Search;
