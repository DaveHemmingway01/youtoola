"use client";

import Link from "next/link";
import { useRef, useState } from "react";

interface NavigationItem {
  href: string;
  label: string;
}

export function MobileNavigation({ items }: { items: NavigationItem[] }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  if (items.length === 0) return null;

  function closeAndRestoreFocus() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className="mobile-navigation">
      <button
        ref={triggerRef}
        className="mobile-navigation__trigger"
        type="button"
        aria-controls="mobile-navigation-panel"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        Menu
      </button>
      {open ? (
        <nav
          id="mobile-navigation-panel"
          className="mobile-navigation__panel"
          aria-label="Mobile navigation"
          onKeyDown={(event) => {
            if (event.key === "Escape") closeAndRestoreFocus();
          }}
        >
          {items.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
