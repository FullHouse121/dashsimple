import React from "react";

// Chip/tag input — Enter or comma commits a value, Backspace on empty pops.
export function TagInput({ values, onChange, placeholder, options }) {
  const [draft, setDraft] = React.useState("");
  const commit = (raw) => {
    const parts = String(raw).split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    const next = [...values];
    parts.forEach((p) => {
      if (!next.includes(p)) next.push(p);
    });
    onChange(next);
    setDraft("");
  };
  return (
    <div className="tag-input">
      {values.map((v) => (
        <span className="tag-chip" key={v}>
          {v}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label="Remove">
            ×
          </button>
        </span>
      ))}
      <input
        className="tag-input-field"
        value={draft}
        list={options ? "tag-opts" : undefined}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit(draft);
          } else if (e.key === "Backspace" && !draft && values.length) {
            onChange(values.slice(0, -1));
          }
        }}
        onBlur={() => commit(draft)}
        placeholder={values.length ? "" : placeholder}
      />
      {options ? (
        <datalist id="tag-opts">
          {options.map((o) => (
            <option value={o} key={o} />
          ))}
        </datalist>
      ) : null}
    </div>
  );
}
