import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

const control =
  "h-12 w-full rounded-[2px] border bg-white px-4 text-base text-ink placeholder:text-ink-subtle focus:border-ink-subtle focus:outline-none sm:text-sm";

type Common = { label: string; name: string; error?: string; hint?: string };

export function Field({ label, name, error, hint, className = "", ...props }: Common & InputHTMLAttributes<HTMLInputElement>) {
  const id = props.id ?? `f-${name}`;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="eyebrow mb-1.5 block">{label}</label>
      <input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${control} ${error ? "border-sale" : "border-line"}`}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-sale">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-ink-subtle">{hint}</p>
      ) : null}
    </div>
  );
}

export function SelectField({
  label,
  name,
  error,
  options,
  placeholder,
  className = "",
  ...props
}: Common & { options: readonly string[]; placeholder: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = props.id ?? `f-${name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="eyebrow mb-1.5 block">{label}</label>
      <select
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${control} ${error ? "border-sale" : "border-line"}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <p id={`${id}-error`} className="mt-1 text-xs text-sale">{error}</p>}
    </div>
  );
}

export function FormMessage({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;
  return (
    <p role={error ? "alert" : "status"} className={`border px-4 py-3 text-sm ${error ? "border-sale/30 bg-sale/5 text-sale" : "border-forest/30 bg-forest/5 text-forest"}`}>
      {error ?? success}
    </p>
  );
}
