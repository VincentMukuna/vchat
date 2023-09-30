import { blueDark } from "@radix-ui/colors";
import React from "react";
import { BeatLoader, ClipLoader } from "react-spinners";

import { motion } from "framer-motion";

const Loading = () => {
  return (
    <motion.div className="flex flex-col items-center gap-4">
      <ClipLoader color={blueDark.blue6} size={40} speedMultiplier={0.9} />
    </motion.div>
  );
};

export default Loading;
