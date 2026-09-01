"use client";

import type { ReactNode } from "react";

type FunnelStartLinkProps = {
  children: ReactNode;
  className?: string;
  href: string;
};

export function FunnelStartLink({ children, className, href }: FunnelStartLinkProps) {
  return (
    <a
      className={className}
      href={href}
      onClick={() => window.dispatchEvent(new CustomEvent("small-funnel-start"))}
    >
      {children}
    </a>
  );
}
