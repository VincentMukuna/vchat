import { ChatMessage } from "@/types/interfaces";

export default function SystemMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="mx-auto  my-1 w-fit max-w-[min(90vw,24rem)] rounded-full bg-dark-grass11/80 px-4 py-2 text-center text-xs italic dark:bg-dark-grass8/70 dark:text-gray-300">
      {message.body}
    </div>
  );
}
