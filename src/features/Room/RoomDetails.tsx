import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useChatsContext } from "../../context/ChatsContext";
import Avatar from "../../components/Avatar";
import { IUserDetails } from "../../interfaces";
import User from "../UsersList/User";
import { useEffect } from "react";
import { getGroupDetails } from "../../services/groupMessageServices";
import useSWR from "swr";
import { getChatDoc } from "../../services/chatMessageServices";
import api from "../../services/api";
import { Server } from "../../utils/config";

const RoomDetails = () => {
  const { selectedChat } = useChatsContext();
  if (selectedChat === undefined) return null;
  const isGroup = !!(selectedChat?.$collectionId === "groups");

  async function getRoomDetails() {
    if (isGroup) {
      let doc = await getGroupDetails(selectedChat.$id);
      return doc;
    } else if (selectedChat) {
      return await getChatDoc(selectedChat.$id);
    }
  }

  const { data: roomDetails } = useSWR(
    `details ${selectedChat.$id}`,
    getRoomDetails,
  );

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full dark:text-white">
      <div className="absolute top-0 left-0 flex items-center w-full gap-3 p-2 ">
        <button
          title="Close details panel"
          className="p-1 rounded-full hover:scale-95 hover:shadow-[0_0_0_1px] focus:text-black focus:shadow-[0_0_0_1px] active:scale-110 transition-all"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        Chat Details
      </div>
      <div className="flex flex-col items-center w-full gap-8">
        <div className="flex flex-col items-center w-full text-sm">
          <span className="inline-flex gap-2">
            Participants :
            <span className="font-bold">{` ${
              isGroup && roomDetails?.members.length
            }`}</span>
          </span>
          <div className="flex w-full max-w-[80%] overflow-x-hidden  items-center justify-center">
            {isGroup
              ? roomDetails?.members?.map((member: IUserDetails) => {
                  return (
                    <Avatar
                      src={
                        member.avatarID &&
                        api
                          .getFile(Server.bucketIDUserAvatars, member?.avatarID)
                          .toString()
                      }
                      name={member.name}
                      key={member.$id}
                      className="relative shrink-0 flex justify-center items-center w-10 h-10  -mx-[4px] rounded-full shadow-gray3 dark:shadow-dark-blue2  shadow-[0_0_0_3px] first:mx-0 text-lg font-bold"
                    />
                  );
                })
              : roomDetails?.participants?.map((participant: IUserDetails) => (
                  <Avatar
                    name={participant.name}
                    key={participant.$id}
                    className="relative shrink-0 flex justify-center items-center w-10 h-10  -mx-[4px] rounded-full shadow-gray3 dark:shadow-black shadow-[0_0_0_3px] first:mx-0 text-lg font-bold"
                  />
                ))}
          </div>
        </div>
        {isGroup && (
          <>
            Admins
            <div className="flex">
              {roomDetails?.member
                ?.filter((member: IUserDetails) =>
                  roomDetails.admins.includes(member.$id),
                )
                .map((member: IUserDetails) => {
                  return (
                    <Avatar
                      src={
                        member.avatarID &&
                        api
                          .getFile(Server.bucketIDUserAvatars, member?.avatarID)
                          .toString()
                      }
                      name={member.name}
                      key={member.$id}
                      className="relative shrink-0 flex justify-center items-center w-10 h-10  -mx-[4px] rounded-full shadow-gray3 shadow-[0_0_0_3px] first:mx-0 text-lg font-bold"
                    />
                  );
                })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RoomDetails;
