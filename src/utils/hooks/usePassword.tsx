import { useState } from "react";

export default function usePassword() {
  const [show, setShow] = useState(false);

  function toggle() {
    setShow((prev) => !prev);
  }

  return { show, toggle };
}
