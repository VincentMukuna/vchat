import { ChatMessage } from "@/interfaces";

export default function SystemMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="max-w-[min(90vw,24rem)]  py-2 text-center w-fit px-4 mx-auto my-1 text-xs italic rounded-full dark:text-gray-300 bg-dark-tomato11/60 dark:bg-dark-grass8/70">
      {message.body}
    </div>
  );
}
