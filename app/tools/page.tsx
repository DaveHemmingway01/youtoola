import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/site-shell";
import { Card, EmptyState, TextLink } from "@/components/ui";
import {
  getPublicDiscoveryTools,
  PUBLIC_DISCOVERY_ROUTES,
} from "@/lib/discovery";

import styles from "../discovery.module.css";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Browse practical Youtoola tools that have completed review and are ready for public use.",
  alternates: {
    canonical: "/tools",
  },
};

export default function ToolsPage() {
  const tools = getPublicDiscoveryTools();

  return (
    <div className={styles.page}>
      <section className={styles.directoryHeader} aria-labelledby="tools-heading">
        <Breadcrumbs
          items={[
            { href: PUBLIC_DISCOVERY_ROUTES.home, label: "Home" },
            { label: "Tools" },
          ]}
        />
        <p className="eyebrow">Youtoola directory</p>
        <h1 id="tools-heading">Practical tools, reviewed before release</h1>
        <p className="lede">
          This directory is the permanent home for Youtoola’s focused online tools.
          Only tools that have completed review and are ready for public use appear here.
        </p>
      </section>

      {tools.length === 0 ? (
        <EmptyState>
          <div className={styles.emptyDirectory}>
            <h2>Public tools are being prepared</h2>
            <p>
              Our first tools are being prepared and reviewed. We’ll publish them here
              when they’re ready.
            </p>
            <TextLink href={PUBLIC_DISCOVERY_ROUTES.home}>Return to the homepage</TextLink>
          </div>
        </EmptyState>
      ) : (
        <section aria-label="Available tools" className={styles.directoryList}>
          {tools.map((tool) => (
            <Card className={styles.directoryItem} key={tool.utilityId}>
              <p className={styles.categoryLabel}>{tool.categoryName}</p>
              <h2>
                <Link href={`/${tool.slug}`}>{tool.name}</Link>
              </h2>
              <p>{tool.description}</p>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
