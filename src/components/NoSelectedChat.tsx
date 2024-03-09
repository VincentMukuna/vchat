import { motion } from "framer-motion";
import chatSVG from "../assets/groupChat.svg";

export default function NoSelectedChat() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full -translate-y-[10%]">
      <motion.img
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.2 }}
        src={chatSVG}
        alt=""
        className="w-56 h-56 mb-4"
      />
      <p>Vchat</p>
      <p>Click on Chat to start messaging</p>
    </div>
  );
}
