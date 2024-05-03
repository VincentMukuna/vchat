import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";

interface AlternatorProps {
  interval?: number;
  children: React.ReactNode[];
  className?: string;
}
function Alternator({ children, interval, className }: AlternatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % children.length);
    }, interval);

    return () => clearInterval(intervalId);
  }, [children, interval]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className={className}
      >
        {children[currentIndex]}
      </motion.div>
    </AnimatePresence>
  );
}

export default Alternator;
