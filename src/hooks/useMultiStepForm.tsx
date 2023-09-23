import { ReactNode, useState } from "react";

interface MultiStepFormTypes {}

const useMultiStepForm = (steps: ReactNode[]) => {
  const [i, setI] = useState(0);

  const next = () => {
    //last step
    if (i === steps.length - 1) return;
    setI((i) => i + 1);
  };
  const prev = () => {
    //first step
    if (i === 0) return steps[i];
    setI((i) => i - 1);
  };
  return {
    next,
    prev,
    currentForm: steps[i],
    isLast: i === steps.length - 1,
    isFirst: i === 0,
  };
};

export default useMultiStepForm;
