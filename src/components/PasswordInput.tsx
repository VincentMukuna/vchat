import {
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/20/solid";
import React, { useRef } from "react";
import usePassword from "../hooks/usePassword";
import { tomatoDark } from "@radix-ui/colors";
import { motion } from "framer-motion";

interface PasswordInputProps {
  value: string;
  onChange: (e: any) => void;
}

const PasswordInput = ({ value, onChange }: PasswordInputProps) => {
  const { show, toggle } = usePassword();
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
        type={show ? "text" : "password"}
      />
      <InputRightElement cursor={"pointer"}>
        <IconButton
          as={motion.button}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          aria-label="show password"
          onClick={() => toggle()}
          bg={"none"}
        >
          {show ? (
            <EyeSlashIcon className="w-4 h-4" />
          ) : (
            <EyeIcon className="w-4 h-4" />
          )}
        </IconButton>
      </InputRightElement>
    </InputGroup>
  );
};

export default PasswordInput;
