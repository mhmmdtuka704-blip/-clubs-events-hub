export default function FormField({ label, name, error, hint, as: Tag = 'input', ...props }) {
  const description =
    [hint && `${name}-hint`, error && `${name}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <Tag
        id={name}
        name={name}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={description}
        {...props}
      />
      {hint && (
        <small id={`${name}-hint`} className="field-hint">
          {hint}
        </small>
      )}
      {error && (
        <p id={`${name}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function focusInvalid(form) {
  requestAnimationFrame(() => form?.querySelector('[aria-invalid="true"]')?.focus());
}
