import React, { useEffect, useRef } from "react";

type UseIntersectionProps = {
  root: React.RefObject<HTMLElement>;
  target: React.RefObject<HTMLElement>;
  onInView: () => void;
  threshold?: number | number[];
  rootMargin?: string;
  time?: number;
  observe?: boolean;
};

export default function useIntersectionObserver({
  root,
  target,
  onInView,
  threshold = 1.0,
  rootMargin = "0px",
  time = 0,
  observe = true,
}: UseIntersectionProps) {
  const intersectionTimeoutId = useRef<number | null>(null);
  useEffect(() => {
    if (!observe) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          intersectionTimeoutId.current = setTimeout(() => {
            onInView();
          }, time);
        } else {
          clearTimeout(intersectionTimeoutId.current as number);
        }
      },
      {
        root: root.current,
        rootMargin,
        threshold,
      },
    );

    const targetEl = target.current;

    if (targetEl) {
      observer.observe(targetEl);
    }

    return () => {
      observer.disconnect();
    };
  }, [root, target, onInView, threshold, rootMargin, time, observe]);
}
