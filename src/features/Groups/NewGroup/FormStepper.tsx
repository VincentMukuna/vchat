import React, { createContext, useContext, useState } from "react";
import {
  Box,
  Button,
  Input,
  Stack,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
} from "@chakra-ui/react";

interface FormStepperProps {
  children: React.ReactNode[];
  handleSubmit: () => void;
}

const steps = [
  { title: "First", description: "Group Info", id: "add details" },
  { title: "Second", description: "Add Members", id: "add members" },
  { title: "Create" },
];

interface IStepperContext {
  next: () => void;
  prev: () => void;
  // isLast: ()=>boolean;
  // isFirst: ()=>boolean;
}

const StepperContext = createContext<IStepperContext | null>(null);
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
      handleSubmit();
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
  let contextValue = { next, prev };

  return (
    <Stack gap={2} h={"full"}>
      <Stepper size={["xs"]} colorScheme="blue" index={step} gap={2}>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepIndicator>
              <StepStatus
                complete={<StepIcon />}
                incomplete={<StepNumber />}
                active={<StepNumber />}
              />
            </StepIndicator>

            <Box flexShrink="0">
              <StepTitle>{step.title}</StepTitle>
              <StepDescription>{step.description}</StepDescription>
            </Box>

            <StepSeparator />
          </Step>
        ))}
      </Stepper>
      <StepperContext.Provider value={contextValue}>
        {currentChild}
      </StepperContext.Provider>
    </Stack>
  );
};

export default FormStepper;

export const useStepper = () => {
  let context = useContext(StepperContext);
  return context as IStepperContext;
};
