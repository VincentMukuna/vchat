import React, { useState } from "react";
import VButton from "../../../components/button/VButton";

interface FormStepperProps {
  children: React.ReactNode[];
  handleSubmit: React.FormEventHandler<HTMLFormElement>;
}

const FormStepper = ({ children, handleSubmit }: FormStepperProps) => {
  const childrenArray = React.Children.toArray(children);
  const [step, setStep] = useState(0);
  const currentChild = childrenArray[step];

  function isLast() {
    return step === childrenArray.length - 1;
  }
  function isFirst() {
    return step === 0;
  }

  function next() {
    if (isLast()) {
      return;
    } else {
      setStep((step) => step + 1);
    }
  }

  function prev() {
    if (step === 0) {
      return;
    } else {
      setStep((step) => step - 1);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-16">
      {currentChild}
      <div className="flex flex-row-reverse gap-4">
        <VButton type={isLast() ? "submit" : "button"} onClick={() => next()}>
          {isLast() ? "Create" : "Add Members"}
        </VButton>
        {!isFirst() && (
          <VButton variant="ghost" onClick={() => prev()}>
            Change Details
          </VButton>
        )}
      </div>
    </form>
  );
};

export default FormStepper;
