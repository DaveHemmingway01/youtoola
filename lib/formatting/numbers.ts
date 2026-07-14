interface NumberFormatOptions extends Intl.NumberFormatOptions {
  locale: string;
}

export function formatNumber(value: number, { locale, ...options }: NumberFormatOptions) {
  if (!Number.isFinite(value)) throw new Error("Formatted value must be finite.");
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatCurrency(value: number, currency: string, locale: string) {
  return formatNumber(value, { currency, locale, style: "currency" });
}

export function formatPercentage(value: number, locale: string, maximumFractionDigits = 2) {
  return formatNumber(value, {
    locale,
    maximumFractionDigits,
    style: "percent",
  });
}
