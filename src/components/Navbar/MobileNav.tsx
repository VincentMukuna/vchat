import { useAuth } from "@/context/AuthContext";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { navLinks } from "./links";

function MobileNav() {
  const { pathname } = useLocation();
  const { currentUserDetails } = useAuth();
  if (!currentUserDetails) return null;

  const mobileNavLinks = [
    ...navLinks,
    {
      value: "/profile",
      icon: <UserCircleIcon className="size-6" />,
      title: "Profile",
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray5 bg-gray2 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_20px_rgba(15,23,42,0.08)] dark:border-dark-slate4 dark:bg-dark-blue2 md:hidden">
      <div className="grid grid-cols-4 gap-1">
        {mobileNavLinks.map((link) => {
          const isActive = pathname
            .split("/")
            .includes(link.value.substring(1));

          return (
            <Link
              to={link.value}
              key={link.value}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-md px-1 text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-indigo4 text-indigo11 dark:bg-dark-indigo4 dark:text-dark-indigo11"
                  : "text-gray11 hover:bg-gray4 hover:text-indigo11 dark:text-gray7 dark:hover:bg-dark-slate4 dark:hover:text-dark-indigo11"
              }`}
            >
              {link.icon}
              <span>{link.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default memo(MobileNav);
