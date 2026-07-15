export function createReportOnlyContentSecurityPolicy({
  providerOrigins,
}: {
  providerOrigins?: Readonly<{ connect: readonly string[]; script: readonly string[] }>;
} = {}) {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    `connect-src 'self'${providerOrigins ? ` ${providerOrigins.connect.join(" ")}` : ""}`,
    "font-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data:",
    "object-src 'none'",
    `script-src 'self' 'unsafe-inline'${providerOrigins ? ` ${providerOrigins.script.join(" ")}` : ""}`,
    "style-src 'self' 'unsafe-inline'",
  ].join("; ");
}
