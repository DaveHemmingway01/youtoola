import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { MobileNavigation } from "@/components/mobile-navigation";
import { PrivacyPreferencesButton } from "@/components/consent/privacy-preferences-button";

export function SkipLink() {
  return (
    <a className="skip-link" href="#main-content">
      Skip to main content
    </a>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand-link" href="/" aria-label="Youtoola home">
          <Image
            className="brand-link__full"
            src="/brand/youtoola-logo-750.png"
            alt="Youtoola"
            width={190}
            height={52}
            priority
          />
          <Image
            className="brand-link__compact"
            src="/brand/favicon-64x64.png"
            alt=""
            width={44}
            height={44}
            priority
          />
        </Link>
        <MobileNavigation items={[{ href: "/", label: "Home" }]} />
      </div>
    </header>
  );
}

export function MainContent({ children }: { children: ReactNode }) {
  return (
    <main id="main-content" className="site-main" tabIndex={-1}>
      {children}
    </main>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <Image
          src="/brand/youtoola-logo-750.png"
          alt="Youtoola"
          width={164}
          height={45}
        />
        <p>Useful tools. No account. No nonsense.</p>
        <nav aria-label="Youtoola information">
          <ul className="site-footer__links">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/methodology">Methodology</Link></li>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><PrivacyPreferencesButton /></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}

export interface BreadcrumbItem {
  href?: string;
  label: string;
}

export function Breadcrumbs({ items }: { items: readonly BreadcrumbItem[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`}>
              {item.href && !current ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <span aria-current={current ? "page" : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
