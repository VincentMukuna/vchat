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
import { useRef, useState } from "react";
import User from "../features/UsersList/User";
import { blue, gray, slateDark } from "@radix-ui/colors";
import { CircleLoader, ClipLoader } from "react-spinners";

function Search() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [filteredUsers, setFilteredUsers] = useState<IUserDetails[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e?: any) {
    e.preventDefault();
    setLoading(true);
    onOpen();
    let users = await filterUsers(search);
    setLoading(false);
    setFilteredUsers(users);
  }

  async function filterUsers(name: string) {
    if (search.trim().length > 0) {
      try {
        const { documents } = await api.listDocuments(
          SERVER.DATABASE_ID,
          SERVER.COLLECTION_ID_USERS,
          [Query.search("name", search), Query.limit(4)],
        );
        return documents as IUserDetails[];
      } catch (error) {
        toast.error("Something went wrong");
        return [];
      }
    } else return [];
  }

  return (
    <form action="" className="w-full mb-4" onSubmit={handleSubmit}>
      <Popover
        isLazy={true}
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        placement="bottom"
        closeOnBlur={false}
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
            rounded: "none",
          }}
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
          ) : filteredUsers.length > 0 ? (
            <FocusLock>
              {filteredUsers.map((user, i) => {
                if (i === 0) {
                  return (
                    <User key={user.$id} user={user} onCloseModal={onClose} />
                  );
                }
                return <User key={user.$id} user={user} />;
              })}
            </FocusLock>
          ) : (
            <span className="p-4">No user found</span>
          )}
        </PopoverContent>
      </Popover>
    </form>
  );
}

export default Search;
