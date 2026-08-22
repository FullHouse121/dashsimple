import React from "react";
import { periodOptions } from "../lib/constants.js";
import { normalizeDateRange, shortMonths } from "../lib/date.js";
import { useLanguage } from "../lib/i18n/language.jsx";
import { DeusDatePicker } from "./Select.jsx";

// Format utilities moved to ./lib/format.js (Phase 1 extraction — see import at top of file)
// Date utilities moved to ./lib/date.js (Phase 1 extraction)
// Permissions, filters, and sort helpers moved to ./lib/{permissions,filters,sort}.js (Phase 1)
export const formatShortDate = (value) => {
  if (!value) return "";
  const parts = value.split("-");
  if (parts.length < 3) return value;
  const monthIndex = Number(parts[1]) - 1;
  const month = shortMonths[monthIndex] ?? parts[1];
  return `${parts[2]} ${month}`;
};

// The period chip sits in the topbar, which on a phone has one row to spend on
// everything. "2026-08-01 → 2026-08-21" measures 215px there and forced the bar
// back to two rows — undoing the row it had just been given back. The parts
// that repeat are the ones dropped: a year that is the same at both ends is
// stated once, a month that is the same is stated once, and a single day is
// just a day. Nothing is lost that the full range does not still say.
export const formatPeriodChip = (from, to) => {
  if (!from || !to) return from || to || "";
  const a = String(from).split("-");
  const b = String(to).split("-");
  if (a.length < 3 || b.length < 3) return from === to ? from : `${from} → ${to}`;
  const day = (p) => String(Number(p[2]));
  const mon = (p) => shortMonths[Number(p[1]) - 1] ?? p[1];
  if (from === to) return `${day(a)} ${mon(a)} ${a[0]}`;
  if (a[0] !== b[0]) return `${day(a)} ${mon(a)} ${a[0]} → ${day(b)} ${mon(b)} ${b[0]}`;
  if (a[1] !== b[1]) return `${day(a)} ${mon(a)} → ${day(b)} ${mon(b)} ${b[0]}`;
  return `${day(a)}–${day(b)} ${mon(b)} ${b[0]}`;
};

export function PeriodSelect({ value, onChange, customRange, onCustomChange }) {
  const { t } = useLanguage();
  const [open, setOpen] = React.useState(false);
  const [showCustom, setShowCustom] = React.useState(false);
  const containerRef = React.useRef(null);
  const normalizedCustomRange = React.useMemo(
    () => normalizeDateRange(customRange?.from, customRange?.to),
    [customRange?.from, customRange?.to]
  );
  const canApplyCustomRange = Boolean(normalizedCustomRange.from && normalizedCustomRange.to);

  React.useEffect(() => {
    if (!open) return;
    const handleOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
        setShowCustom(false);
      }
    };
    window.addEventListener("mousedown", handleOutside);
    return () => window.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const handleSelect = (option) => {
    onChange(option);
    setShowCustom(false);
    setOpen(false);
  };

  const handleCustomToggle = () => {
    setOpen(true);
    setShowCustom(true);
  };

  const handleApplyCustom = () => {
    if (!canApplyCustomRange) return;
    if (customRange?.from !== normalizedCustomRange.from) {
      onCustomChange("from", normalizedCustomRange.from);
    }
    if (customRange?.to !== normalizedCustomRange.to) {
      onCustomChange("to", normalizedCustomRange.to);
    }
    onChange("Custom range");
    setOpen(false);
  };

  return (
    <div className="period-select" ref={containerRef}>
      <button
        className="select"
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        {t(value)}
        <span className="chev">▾</span>
      </button>
      {open && (
        <div className="period-menu">
          {periodOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`period-option${value === option ? " is-active" : ""}`}
              onClick={() => handleSelect(option)}
            >
              {t(option)}
            </button>
          ))}
          <button
            type="button"
            className={`period-option${value === "Custom range" ? " is-active" : ""}`}
            onClick={handleCustomToggle}
          >
            {t("Custom range")}
          </button>
          {showCustom && (
            <div className="period-custom">
              <div className="field-row">
                <DeusDatePicker
                  value={customRange.from}
                  onChange={(v) => onCustomChange("from", v)}
                />
                <span className="field-sep">{t("to")}</span>
                <DeusDatePicker
                  value={customRange.to}
                  onChange={(v) => onCustomChange("to", v)}
                />
              </div>
              <div className="period-actions">
                <button className="ghost" type="button" onClick={() => setShowCustom(false)}>
                  {t("Cancel")}
                </button>
                <button
                  className="action-pill"
                  type="button"
                  onClick={handleApplyCustom}
                  disabled={!canApplyCustomRange}
                >
                  {t("Apply")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
