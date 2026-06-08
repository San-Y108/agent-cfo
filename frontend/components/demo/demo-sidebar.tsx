"use client";

import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ClipboardList,
  ShieldCheck,
  UserCheck,
  Wallet,
  FileText,
  Menu,
  X,
} from "lucide-react";

interface SidebarLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const primaryLinks: SidebarLink[] = [
  {
    label: "Payment Plan",
    href: "#plan",
    icon: <ClipboardList className="h-5 w-5 flex-shrink-0 text-neutral-300" />,
  },
  {
    label: "Risk Check",
    href: "#risk",
    icon: <ShieldCheck className="h-5 w-5 flex-shrink-0 text-neutral-300" />,
  },
  {
    label: "Approval",
    href: "#approval",
    icon: <UserCheck className="h-5 w-5 flex-shrink-0 text-neutral-300" />,
  },
  {
    label: "Execution",
    href: "#execution",
    icon: <Wallet className="h-5 w-5 flex-shrink-0 text-neutral-300" />,
  },
  {
    label: "Audit Report",
    href: "#audit",
    icon: <FileText className="h-5 w-5 flex-shrink-0 text-neutral-300" />,
  },
];

export function DemoSidebar({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden rounded-md border border-neutral-800 bg-neutral-950 md:flex-row",
        "h-screen",
        className
      )}
    >
      <Sidebar>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <Logo />
            <div className="mt-8 flex flex-col">
              {primaryLinks.map((link, idx) => (
                <SidebarLink key={idx} link={link} id={`primary-link-${idx}`} />
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      {children}
    </div>
  );
}

const Logo = () => {
  return (
    <div className="relative z-20 flex items-center space-x-2 px-4 py-1 text-sm font-normal">
      <div className="h-5 w-6 flex-shrink-0 rounded-bl-sm rounded-br-lg rounded-tl-lg rounded-tr-sm bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="whitespace-pre font-medium text-white"
      >
        AgentCFO
      </motion.span>
    </div>
  );
};

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  return (
    <motion.div
      className={cn(
        "hidden h-full w-[260px] flex-shrink-0 bg-neutral-900 px-4 py-4 md:flex md:flex-col",
        className
      )}
      animate={{ width: "260px" }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        className={cn(
          "flex h-10 w-full flex-row items-center justify-between bg-neutral-900 px-4 py-4 md:hidden"
        )}
        {...props}
      >
        <div className="z-20 flex w-full justify-end">
          <Menu
            className="text-neutral-200 cursor-pointer"
            onClick={() => setOpen(true)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={cn(
                "fixed inset-0 z-[100] flex h-full w-full flex-col justify-between bg-neutral-950 p-4 sm:p-10",
                className
              )}
            >
              <div
                className="absolute right-10 top-10 z-50 text-neutral-200 cursor-pointer"
                onClick={() => setOpen(false)}
              >
                <X />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

const SidebarLink = ({
  link,
  className,
  id,
  ...props
}: {
  link: SidebarLink;
  className?: string;
  id?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <a
      href={link.href}
      className={cn("group/sidebar relative px-4 py-1", className)}
      onMouseEnter={() => setHovered(id ?? null)}
      onMouseLeave={() => setHovered(null)}
      {...props}
    >
      {hovered === id && (
        <motion.div
          layoutId="hovered-sidebar-link"
          className="absolute inset-0 z-10 rounded-lg bg-neutral-800"
        />
      )}
      <div className="relative z-20 flex items-center justify-start gap-2 py-2">
        {link.icon}
        <motion.span
          animate={{ display: "inline-block", opacity: 1 }}
          className="!m-0 inline-block whitespace-pre !p-0 text-sm text-neutral-300 transition duration-150 group-hover/sidebar:translate-x-1"
        >
          {link.label}
        </motion.span>
      </div>
    </a>
  );
};
