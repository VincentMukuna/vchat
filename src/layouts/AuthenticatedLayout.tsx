import React from "react";
import MobileNav from "../components/Navbar/MobileNav";
import Navbar from "../components/Navbar/Navbar";
import { useColorModeValue } from "@chakra-ui/react";
import { blueDark, gray } from "@radix-ui/colors";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  hideMobileNav?: boolean;
}

function AuthenticatedLayout({
  children,
  hideMobileNav = false,
}: AuthenticatedLayoutProps) {
   const navBackground = useColorModeValue(gray.gray2, blueDark.blue1);
  return (
    <div
      style={{ backgroundColor: navBackground }}
      className={`fixed inset-0 flex flex-col-reverse md:flex-row md:pb-0 bg-gray2 dark:bg-dark-blue1 ${
        hideMobileNav ? "pb-0" : "pb-[4.5rem]"
      }`}
    >
      <Navbar />
      {children}
      {!hideMobileNav && <MobileNav />}
    </div>
  );
}

export default AuthenticatedLayout;
