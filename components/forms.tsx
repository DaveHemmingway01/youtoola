import {
  cloneElement,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  type SelectHTMLAttributes,
} from "react";

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor: string }) {
  return <label htmlFor={htmlFor}>{children}</label>;
}

export function HelpText({ children, id }: { children: ReactNode; id: string }) {
  return (
    <span className="field__help" id={id}>
      {children}
    </span>
  );
}

export function ErrorMessage({ children, id }: { children: ReactNode; id: string }) {
  return (
    <span className="field__error" id={id}>
      <span aria-hidden="true">!</span> {children}
    </span>
  );
}

interface FieldProps {
  children: ReactElement<Record<string, unknown>>;
  error?: string;
  helpText?: string;
  id: string;
  label: string;
  required?: boolean;
  unit?: string;
}

export function Field({
  children,
  error,
  helpText,
  id,
  label,
  required = false,
  unit,
}: FieldProps) {
  const helpId = helpText ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;
  const control = cloneElement(children, {
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : undefined,
    id,
    required,
  });

  return (
    <div className="field">
      <div className="field__label-row">
        <Label htmlFor={id}>{label}</Label>
        {unit ? <span className="field__unit">{unit}</span> : null}
      </div>
      {control}
      {helpText && helpId ? <HelpText id={helpId}>{helpText}</HelpText> : null}
      {error && errorId ? <ErrorMessage id={errorId}>{error}</ErrorMessage> : null}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="text" {...props} />;
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> };

export function NumberInput(props: InputProps) {
  return <input type="number" inputMode="decimal" {...props} />;
}

export function CurrencyInput(props: InputProps) {
  return <input type="number" inputMode="decimal" {...props} />;
}

export function PercentageInput(props: InputProps) {
  return <input type="number" inputMode="decimal" {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} />;
}

interface ChoiceProps extends InputHTMLAttributes<HTMLInputElement> {
  children: ReactNode;
}

export function Checkbox({ children, ...props }: ChoiceProps) {
  return (
    <label className="choice">
      <input type="checkbox" {...props} />
      <span>{children}</span>
    </label>
  );
}

interface RadioOption {
  label: string;
  value: string;
}

interface RadioGroupProps {
  legend: string;
  name: string;
  options: RadioOption[];
}

export function RadioGroup({ legend, name, options }: RadioGroupProps) {
  return (
    <fieldset className="field choice-group">
      <legend>{legend}</legend>
      {options.map((option) => (
        <label className="choice" key={option.value}>
          <input type="radio" name={name} value={option.value} />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}

export function Toggle({ children, ...props }: ChoiceProps) {
  return (
    <label className="toggle">
      <input role="switch" type="checkbox" {...props} />
      <span className="toggle__track" aria-hidden="true" />
      <span>{children}</span>
    </label>
  );
}

interface ErrorSummaryIssue {
  fieldId?: string;
  message: string;
}

interface ErrorSummaryProps {
  issues: readonly ErrorSummaryIssue[];
  summaryRef?: Ref<HTMLDivElement>;
  title?: string;
}

export function ErrorSummary({
  issues,
  summaryRef,
  title = "Check the form",
}: ErrorSummaryProps) {
  if (issues.length === 0) return null;
  return (
    <div className="error-summary" ref={summaryRef} role="alert" tabIndex={-1}>
      <strong>{title}</strong>
      <ul>
        {issues.map((issue, index) => (
          <li key={`${issue.fieldId ?? "form"}-${index}`}>
            {issue.fieldId ? <a href={`#${issue.fieldId}`}>{issue.message}</a> : issue.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
