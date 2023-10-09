import { MenuItem, MenuList } from "@chakra-ui/react";
const RoomActions = () => {
  return (
    <MenuList className="px-2">
      <MenuItem py={"2.5"}>Edit Members</MenuItem>
      <MenuItem py={"2.5"}>Edit Admins</MenuItem>
      <MenuItem>Clear Messages</MenuItem>
    </MenuList>
  );
};

export default RoomActions;
