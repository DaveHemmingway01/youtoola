import type { JsonValue } from "@/lib/seo/types";
import { serializeJsonLd } from "@/lib/seo/structured-data";

interface JsonLdProps {
  data: JsonValue;
  id: string;
}

export function JsonLd({ data, id }: JsonLdProps) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
      id={id}
      type="application/ld+json"
    />
  );
}
