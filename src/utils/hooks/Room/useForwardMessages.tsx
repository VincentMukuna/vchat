import { useState } from "react";
import { useRoomContext } from "../../../context/RoomContext";

export default function useForwardMessages() {
  const [showChats, setShowChats] = useState(false);
  const { selectedMessages } = useRoomContext();

  function forwardSelectedMessages() {}
}
