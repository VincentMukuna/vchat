import React from "react";
import MobileNav from "../components/Navbar/MobileNav";
import Navbar from "../components/Navbar/Navbar";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <div className="fixed inset-0 flex flex-col-reverse pb-[5.75rem] md:flex-row md:pb-0">
      <Navbar />
      {children}
      <MobileNav />
    </div>
  );
}

export default AuthenticatedLayout;
