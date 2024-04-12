import { Button } from "@chakra-ui/react";
import { motion } from "framer-motion";

interface OauthSignUpProps {
  loading: boolean;
  onClick: (provider: string) => void;
}

const OauthSignUp = ({ loading, onClick }: OauthSignUpProps) => {
  return (
    <div className="mt-2 grid gap-2">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 items-center">
          <div className="w-full border-t "></div>
        </div>

        <div className="relative -top-2 text-xs font-medium text-gray9">
          <div className="rounded-full bg-gray1 px-4 uppercase dark:bg-dark-blue1">
            Or Continue With
          </div>
        </div>
      </div>
      <div className="grid gap-2 transition-all md:grid-cols-2">
        <Button
          as={motion.button}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          variant={"outline"}
          rounded={"full"}
          leftIcon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M3.064 7.51A9.996 9.996 0 0 1 12 2c2.695 0 4.959.991 6.69 2.605l-2.867 2.868C14.786 6.482 13.468 5.977 12 5.977c-2.605 0-4.81 1.76-5.595 4.123c-.2.6-.314 1.24-.314 1.9c0 .66.114 1.3.314 1.9c.786 2.364 2.99 4.123 5.595 4.123c1.345 0 2.49-.355 3.386-.955a4.6 4.6 0 0 0 1.996-3.018H12v-3.868h9.418c.118.654.182 1.336.182 2.045c0 3.046-1.09 5.61-2.982 7.35C16.964 21.105 14.7 22 12 22A9.996 9.996 0 0 1 2 12c0-1.614.386-3.14 1.064-4.49Z"
              />
            </svg>
          }
          px={"12"}
          isLoading={loading}
          loadingText={"Verifying"}
          onClick={() => onClick("google")}
        >
          Google
        </Button>

        <Button
          as={motion.button}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          rounded={"full"}
          variant={"outline"}
          leftIcon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12 .999c-6.074 0-11 5.05-11 11.278c0 4.983 3.152 9.21 7.523 10.702c.55.104.727-.246.727-.543v-2.1c-3.06.683-3.697-1.33-3.697-1.33c-.5-1.304-1.222-1.65-1.222-1.65c-.998-.7.076-.686.076-.686c1.105.08 1.686 1.163 1.686 1.163c.98 1.724 2.573 1.226 3.201.937c.098-.728.383-1.226.698-1.508c-2.442-.286-5.01-1.253-5.01-5.574c0-1.232.429-2.237 1.132-3.027c-.114-.285-.49-1.432.107-2.985c0 0 .924-.303 3.026 1.156c.877-.25 1.818-.375 2.753-.38c.935.005 1.876.13 2.755.38c2.1-1.459 3.023-1.156 3.023-1.156c.598 1.554.222 2.701.108 2.985c.706.79 1.132 1.796 1.132 3.027c0 4.332-2.573 5.286-5.022 5.565c.394.35.754 1.036.754 2.088v3.095c0 .3.176.652.734.542C19.852 21.484 23 17.258 23 12.277C23 6.048 18.075.999 12 .999Z"
              />
            </svg>
          }
          px={"12"}
          isLoading={loading}
          loadingText={"Verifying"}
          onClick={() => onClick("github")}
        >
          GitHub
        </Button>
      </div>
    </div>
  );
};

export default OauthSignUp;
