import React from "react";
import MobileNav from "../components/Navbar/MobileNav";
import Navbar from "../components/Navbar/Navbar";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  hideMobileNav?: boolean;
}

function AuthenticatedLayout({
  children,
  hideMobileNav = false,
}: AuthenticatedLayoutProps) {
  return (
    <div
      className={`fixed inset-0 flex flex-col-reverse md:flex-row md:pb-0 ${
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
