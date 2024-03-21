import { Input, InputGroup } from "@chakra-ui/react";
import { useRef } from "react";

interface PasswordInputProps {
  value: string;
  onChange: (e: any) => void;
}

const PasswordInput = ({ value, onChange }: PasswordInputProps) => {
  const inputRef = useRef(null);
  return (
    <InputGroup>
      <Input
        ref={inputRef}
        autoComplete="true"
        required
        min={"8"}
        id="password"
        value={value}
        onChange={onChange}
        type="password"
      />
    </InputGroup>
  );
};

export default PasswordInput;
