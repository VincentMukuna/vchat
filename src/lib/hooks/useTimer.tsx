import { useEffect } from "react";

interface TimerProps {
  duration: number;
  onExpire: () => void;
}
export default function useTimer({ duration, onExpire }: TimerProps) {
  useEffect(() => {
    const interval = setInterval(onExpire, duration);
    return () => clearInterval(interval);
  }, [duration, onExpire]);
}
