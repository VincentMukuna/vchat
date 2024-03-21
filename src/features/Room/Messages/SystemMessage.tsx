import { ChatMessage } from "@/interfaces";

export default function SystemMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="self-center p-3 px-4 my-1 text-xs italic rounded-full dark:text-gray-300 bg-dark-tomato11/60 dark:bg-dark-tomato7">
      {message.body}
    </div>
  );
}
