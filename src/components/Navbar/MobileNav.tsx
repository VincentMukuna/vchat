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
    <nav className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-md rounded-3xl border border-white/60 bg-white/70 p-1.5 shadow-[0_18px_50px_rgba(15,23,42,0.24)] backdrop-blur-2xl dark:border-white/10 dark:bg-dark-slate3/70 md:hidden">
      <div className="grid grid-cols-4 gap-1">
        {mobileNavLinks.map((link) => {
          const isActive =
            pathname === link.value || pathname.startsWith(`${link.value}/`);

          return (
            <Link
              to={link.value}
              key={link.value}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "-translate-y-1 bg-white/85 text-indigo11 shadow-[0_10px_28px_rgba(63,81,181,0.24),inset_0_1px_0_rgba(255,255,255,0.85)] ring-1 ring-indigo6/60 dark:bg-dark-slate2/90 dark:text-dark-indigo11 dark:shadow-[0_10px_28px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] dark:ring-dark-indigo6/70"
                  : "text-gray11 hover:bg-white/45 hover:text-indigo11 dark:text-gray7 dark:hover:bg-white/10 dark:hover:text-dark-indigo11"
              }`}
            >
              <span
                className={`transition-transform duration-200 ${
                  isActive ? "scale-105" : ""
                }`}
              >
                {link.icon}
              </span>
              <span>{link.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default memo(MobileNav);
