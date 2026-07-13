import Link from "next/link";
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";

type ButtonVariant = "primary" | "secondary" | "quiet";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button button--${variant} ${className}`.trim()}
      {...props}
    />
  );
}

interface TextLinkProps {
  children: ReactNode;
  href: string;
}

export function TextLink({ children, href }: TextLinkProps) {
  return (
    <Link className="text-link" href={href}>
      {children}
    </Link>
  );
}

interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  label: string;
}

export function IconButton({ label, ...props }: IconButtonProps) {
  return <button className="icon-button" aria-label={label} {...props} />;
}

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <section className={`card ${className}`.trim()} {...props}>
      {children}
    </section>
  );
}

interface AlertProps {
  children: ReactNode;
  title: string;
  tone?: "info" | "success" | "warning" | "error";
}

export function Alert({ children, title, tone = "info" }: AlertProps) {
  const role = tone === "error" ? "alert" : "status";
  return (
    <div className={`alert alert--${tone}`} role={role}>
      <strong>{title}</strong>
      <div>{children}</div>
    </div>
  );
}

interface DisclosureProps {
  children: ReactNode;
  summary: string;
}

export function Disclosure({ children, summary }: DisclosureProps) {
  return (
    <details className="disclosure">
      <summary>{summary}</summary>
      <div className="disclosure__content">{children}</div>
    </details>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty-state">{children}</div>;
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="loading-state" aria-busy="true" aria-live="polite">
      <span className="loading-state__mark" aria-hidden="true" />
      {label}
    </div>
  );
}
