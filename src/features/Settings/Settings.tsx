import {
  Card,
  FormControl,
  FormLabel,
  StackDivider,
  Switch,
  VStack,
  useColorMode,
} from "@chakra-ui/react";

const Settings = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <VStack
      divider={<StackDivider />}
      className="flex flex-col p-4 transition-opacity"
    >
      <div className="flex items-center w-full h-full max-w-sm p-3">
        <div className="flex flex-col ">
          <span className="">Toggle dark mode</span>
          <span className="text-sm italic dark:text-slate-300">
            Switch the apps theme
          </span>
        </div>

        <Switch
          className="ms-auto me-12"
          colorScheme={colorMode === "dark" ? "blue" : "blackAlpha"}
          id="dark-mode"
          onChange={toggleColorMode}
          isChecked={colorMode === "dark"}
        />
      </div>
    </VStack>
  );
};

export default Settings;
