import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { CountryFlag } from "./flags.jsx";

export function CountryDropdownPicker({
  value,
  onChange,
  options,
  placeholder,
  allOption = null,
  searchPlaceholder = "Type to find countries",
  emptyResultsLabel = "No countries found.",
  multiple = false,
  values = [],
  onToggle = null,
  maxVisibleChips = 2,
  // When true (multi mode), the open menu shows a bar of the currently
  // selected values, each with a ✕ to remove it directly.
  removable = false,
  // Combobox mode: when true, a non-matching search query can be committed
  // as a custom value (used by the UTM domain field for pasted URLs).
  allowCustom = false,
}) {
  const [query, setQuery] = React.useState("");
  const normalizedValue = String(value ?? "");
  const normalizedValues = React.useMemo(() => {
    if (!multiple) return [];
    const source = Array.isArray(values)
      ? values
      : values === null || values === undefined || values === ""
        ? []
        : [values];
    return Array.from(
      new Set(
        source
          .map((item) => String(item ?? "").trim())
          .filter(Boolean)
      )
    );
  }, [multiple, values]);
  const normalizedOptions = React.useMemo(
    () => {
      if (!Array.isArray(options)) return [];
      return options
        .map((item) => {
          if (item && typeof item === "object") {
            const optionValue = String(item.value ?? item.label ?? "");
            if (!optionValue) return null;
            const optionLabel = String(item.label ?? optionValue);
            const optionSearch = String(item.search ?? `${optionLabel} ${optionValue}`);
            return { value: optionValue, label: optionLabel, search: optionSearch, dot: item.dot || null };
          }
          const raw = String(item ?? "");
          if (!raw) return null;
          return { value: raw, label: raw, search: raw };
        })
        .filter(Boolean);
    },
    [options]
  );
  const optionList = React.useMemo(() => {
    const list = [...normalizedOptions];
    if (allOption && !multiple) {
      list.unshift({
        value: String(allOption.value ?? ""),
        label: String(allOption.label ?? allOption.value ?? ""),
        search: String(allOption.search ?? allOption.label ?? allOption.value ?? ""),
      });
    }
    return list;
  }, [normalizedOptions, allOption]);
  const selectedOption = optionList.find((item) => item.value === normalizedValue) || null;
  const selectedOptions = multiple
    ? optionList.filter((item) => normalizedValues.includes(item.value))
    : [];
  const displayLabel = selectedOption?.label || normalizedValue || placeholder;
  const hasSelection = multiple ? selectedOptions.length > 0 : Boolean(selectedOption || normalizedValue);
  const normalizedQuery = String(query || "").trim().toLowerCase();
  const filteredOptions = optionList.filter((item) =>
    String(item.search ?? item.label).toLowerCase().includes(normalizedQuery)
  );

  const [dropUp, setDropUp] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);
  const searchRef = React.useRef(null);
  const instanceId = React.useId();

  const closeMenu = React.useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);
  const openMenu = React.useCallback(() => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < 300 && rect.top > spaceBelow);
    }
    if (typeof window !== "undefined") {
      // Only one dropdown open at a time — notify the others to close.
      window.dispatchEvent(new CustomEvent("cs-open", { detail: instanceId }));
    }
    setOpen(true);
  }, [instanceId]);

  React.useEffect(() => {
    const onOtherOpen = (event) => {
      if (event.detail !== instanceId) setOpen(false);
    };
    window.addEventListener("cs-open", onOtherOpen);
    return () => window.removeEventListener("cs-open", onOtherOpen);
  }, [instanceId]);
  React.useEffect(() => {
    if (!open) return undefined;
    const onDocDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) closeMenu();
    };
    const onKey = (event) => {
      if (event.key === "Escape") closeMenu();
    };
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, closeMenu]);
  React.useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={`country-select-picker${dropUp ? " drop-up" : ""}${open ? " is-open" : ""}`}
    >
      <button
        type="button"
        className={`country-select-trigger${multiple ? " is-multi" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? closeMenu() : openMenu())}
      >
        {multiple ? (
          <span className="country-select-multi-values">
            {selectedOptions.length ? (
              <>
                {selectedOptions.slice(0, maxVisibleChips).map((item) => (
                  <span key={`country-chip-${item.value}`} className="country-select-chip">
                    <CountryFlag value={item.value} />
                    {item.label}
                  </span>
                ))}
                {selectedOptions.length > maxVisibleChips ? (
                  <span className="country-select-chip country-select-chip-muted">
                    +{selectedOptions.length - maxVisibleChips}
                  </span>
                ) : null}
              </>
            ) : (
              <span className="country-select-value is-placeholder">{placeholder}</span>
            )}
          </span>
        ) : (
          <span className={`country-select-value${hasSelection ? "" : " is-placeholder"}`}>
            {hasSelection && selectedOption?.dot ? (
              <span className="cs-dot" style={{ background: selectedOption.dot }} />
            ) : hasSelection ? <CountryFlag value={normalizedValue} /> : null}
            {displayLabel || placeholder}
          </span>
        )}
        {multiple && selectedOptions.length ? (
          <span className="country-select-count">{selectedOptions.length}</span>
        ) : null}
        <span className="country-select-arrow" aria-hidden="true">
          ▾
        </span>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            className="country-select-menu"
            role="listbox"
            initial={{ opacity: 0, y: dropUp ? 8 : -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: dropUp ? 6 : -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
        <div className="country-select-search-wrap">
          <input
            ref={searchRef}
            className="country-select-search"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
          />
          {query ? (
            <button
              type="button"
              className="country-select-search-clear"
              onClick={() => setQuery("")}
              aria-label="Clear country search"
            >
              ×
            </button>
          ) : null}
        </div>
        {multiple && removable && selectedOptions.length ? (
          <div className="country-select-selected-bar">
            <div className="country-select-selected-head">
              <span>{selectedOptions.length} selected</span>
              <button
                type="button"
                className="country-select-clear-all"
                onClick={() => selectedOptions.forEach((item) => onToggle?.(item.value))}
              >
                Clear all
              </button>
            </div>
            <div className="country-select-selected-chips">
              {selectedOptions.map((item) => (
                <span key={`sel-chip-${item.value}`} className="country-select-selected-chip">
                  {item.dot ? (
                    <span className="cs-dot" style={{ background: item.dot }} />
                  ) : (
                    <CountryFlag value={item.value} />
                  )}
                  <span className="country-select-selected-chip-label">{item.label}</span>
                  <button
                    type="button"
                    className="country-select-selected-chip-remove"
                    aria-label={`Remove ${item.label}`}
                    onClick={() => onToggle?.(item.value)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        ) : null}
        <div className="country-select-options">
          {filteredOptions.length ? (
            filteredOptions.map((item) => {
              const selected = multiple
                ? normalizedValues.includes(item.value)
                : item.value === normalizedValue;
              return (
                <button
                  key={`country-select-${item.value || "all"}`}
                  type="button"
                  className={`country-select-option${selected ? " is-selected" : ""}`}
                  role="option"
                  aria-selected={selected}
                  onClick={(event) => {
                    if (multiple) {
                      if (typeof onToggle === "function") {
                        onToggle(item.value);
                      } else if (typeof onChange === "function") {
                        onChange(item.value);
                      }
                    } else {
                      onChange(item.value);
                      closeMenu();
                    }
                  }}
                >
                  <span className="country-select-name">
                    {item.dot ? (
                      <span className="cs-dot" style={{ background: item.dot }} />
                    ) : (
                      <CountryFlag value={item.value} />
                    )}
                    {item.label}
                  </span>
                  <span className="country-select-check">{selected ? "✓" : ""}</span>
                </button>
              );
            })
          ) : allowCustom && query.trim() ? null : (
            <div className="country-select-empty-results">{emptyResultsLabel}</div>
          )}
          {allowCustom && query.trim() &&
          !optionList.some((o) => o.value.toLowerCase() === query.trim().toLowerCase()) ? (
            <button
              type="button"
              className="country-select-option country-select-custom"
              onClick={() => {
                onChange(query.trim());
                closeMenu();
              }}
            >
              <span className="country-select-name">Use “{query.trim()}”</span>
              <span className="country-select-check">↵</span>
            </button>
          ) : null}
        </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function DeusDatePicker({ value, onChange, placeholder = "Pick a date" }) {
  const fmt = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };
  const parse = (s) => {
    if (!s) return null;
    const d = new Date(`${s}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const selected = parse(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewMonth, setViewMonth] = React.useState(() => {
    const base = selected || today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  React.useEffect(() => {
    if (selected) {
      setViewMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const detailsRef = React.useRef(null);
  const close = () => {
    if (detailsRef.current) detailsRef.current.open = false;
  };

  const displayValue = selected
    ? selected.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
    : "";

  const prevMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  const nextMonth = () => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));

  // Build 6-week grid starting from Monday
  const firstDayOffset = (viewMonth.getDay() + 6) % 7;
  const gridStart = new Date(viewMonth);
  gridStart.setDate(gridStart.getDate() - firstDayOffset);
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  const selectDate = (d) => {
    onChange(fmt(d));
    close();
  };

  const weekdays = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <details ref={detailsRef} className="deus-date-picker">
      <summary className="deus-date-trigger">
        <CalendarIcon size={14} className="deus-date-trigger-icon" />
        <span className={`deus-date-trigger-value${selected ? "" : " is-placeholder"}`}>
          {displayValue || placeholder}
        </span>
        <span className="deus-date-trigger-arrow" aria-hidden="true">▾</span>
      </summary>
      <div className="deus-date-menu">
        <div className="deus-date-head">
          <span className="deus-date-month-label">
            {viewMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </span>
          <div className="deus-date-nav">
            <button type="button" className="deus-date-nav-btn" onClick={prevMonth} aria-label="Previous month">
              <ChevronLeft size={14} />
            </button>
            <button type="button" className="deus-date-nav-btn" onClick={nextMonth} aria-label="Next month">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        <div className="deus-date-weekdays">
          {weekdays.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="deus-date-grid">
          {days.map((d, i) => {
            const inMonth = d.getMonth() === viewMonth.getMonth();
            const dStr = fmt(d);
            const isToday = dStr === fmt(today);
            const isSelected = selected && dStr === fmt(selected);
            const classes = ["deus-date-day"];
            if (!inMonth) classes.push("is-out");
            if (isToday) classes.push("is-today");
            if (isSelected) classes.push("is-selected");
            return (
              <button
                key={i}
                type="button"
                className={classes.join(" ")}
                onClick={() => selectDate(d)}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
        <div className="deus-date-foot">
          <button
            type="button"
            className="deus-date-link"
            onClick={() => {
              onChange("");
              close();
            }}
          >
            Clear
          </button>
          <button
            type="button"
            className="deus-date-link"
            onClick={() => selectDate(new Date())}
          >
            Today
          </button>
        </div>
      </div>
    </details>
  );
}

export function Select({ value, onChange, options, placeholder = "Select…", searchPlaceholder = "Search…", emptyResultsLabel = "No results.", allOption = null, className }) {
  const normalized = Array.isArray(options) ? options : [];
  return (
    <div className={className || undefined}>
      <CountryDropdownPicker
        value={value ?? ""}
        onChange={onChange}
        options={normalized}
        placeholder={placeholder}
        allOption={allOption}
        searchPlaceholder={searchPlaceholder}
        emptyResultsLabel={emptyResultsLabel}
      />
    </div>
  );
}

