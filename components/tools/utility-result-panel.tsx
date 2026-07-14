import type { ReactNode } from "react";

import { ResultPanel } from "@/components/tool-patterns";
import type { UtilityResult } from "@/lib/utilities/contracts";

interface UtilityResultPanelProps {
  actions?: ReactNode;
  result: UtilityResult;
}

export function UtilityResultPanel({ actions, result }: UtilityResultPanelProps) {
  return (
    <ResultPanel
      actions={actions}
      announce={false}
      answer={result.primary.formatted}
      assumptions={result.assumptions.length > 0 ? (
        <ul>{result.assumptions.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
      ) : undefined}
      label={result.primary.label}
      limitations={result.limitations.length > 0 ? (
        <ul>{result.limitations.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
      ) : undefined}
      methodology={<p>Calculation version {result.calculationVersion}; methodology version {result.methodologyReference.methodologyVersion}.</p>}
      supportingValues={result.supporting.length > 0 ? (
        <dl className="result-values">
          {result.supporting.map((item) => (
            <div key={item.id}><dt>{item.label}</dt><dd>{item.formatted}</dd></div>
          ))}
        </dl>
      ) : undefined}
      warnings={result.warnings.length > 0 ? (
        <ul>{result.warnings.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
      ) : undefined}
    />
  );
}
