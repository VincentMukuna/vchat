import React from "react";
import Navbar from "../features/Navbar/Navbar";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <div className="fixed inset-0 flex flex-col-reverse md:flex-row">
      <Navbar />
      {children}
    </div>
  );
}

export default AuthenticatedLayout;
