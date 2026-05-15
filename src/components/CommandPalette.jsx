import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, CornerDownLeft, ArrowUp, ArrowDown } from "lucide-react";

/**
 * DEUS Command Palette
 * Keyboard-first navigation: Cmd/Ctrl+K to open, ↑↓ to move, ↵ to run, Esc to close.
 */
export default function CommandPalette({ open, onClose, commands }) {
  const [query, setQuery] = React.useState("");
  const [activeIdx, setActiveIdx] = React.useState(0);
  const inputRef = React.useRef(null);
  const listRef = React.useRef(null);

  // Reset state when opened
  React.useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Filter commands by query
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((cmd) => {
      const haystack = [
        cmd.label,
        cmd.section,
        ...(cmd.keywords || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [commands, query]);

  // Group by section for visual organization
  const grouped = React.useMemo(() => {
    const order = [];
    const map = new Map();
    filtered.forEach((cmd) => {
      const section = cmd.section || "General";
      if (!map.has(section)) {
        map.set(section, []);
        order.push(section);
      }
      map.get(section).push(cmd);
    });
    return order.map((name) => ({ name, items: map.get(name) }));
  }, [filtered]);

  // Flat index lookup for arrow-key navigation
  const flat = React.useMemo(() => filtered, [filtered]);

  // Reset active index when filtered list shrinks
  React.useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  // Keep active item in view
  React.useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-cmd-idx="${activeIdx}"]`);
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [activeIdx]);

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, Math.max(0, flat.length - 1)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const cmd = flat[activeIdx];
      if (cmd) {
        cmd.run();
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="palette-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          onClick={onClose}
        >
          <motion.div
            className="palette"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="palette-tone" aria-hidden="true" />
            <div className="palette-search">
              <Search size={16} className="palette-search-icon" />
              <input
                ref={inputRef}
                className="palette-input"
                type="text"
                placeholder="Search dashboards, actions…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="palette-kbd">esc</kbd>
            </div>

            <div className="palette-list" ref={listRef}>
              {grouped.length === 0 ? (
                <div className="palette-empty">
                  <span>No results for "{query}"</span>
                </div>
              ) : (
                grouped.map((group) => (
                  <div className="palette-group" key={group.name}>
                    <div className="palette-group-label">{group.name}</div>
                    {group.items.map((cmd) => {
                      const idx = flat.indexOf(cmd);
                      const isActive = idx === activeIdx;
                      const Icon = cmd.icon;
                      return (
                        <button
                          key={cmd.id}
                          data-cmd-idx={idx}
                          type="button"
                          className={`palette-item${isActive ? " is-active" : ""}`}
                          onClick={() => {
                            cmd.run();
                            onClose();
                          }}
                          onMouseEnter={() => setActiveIdx(idx)}
                        >
                          <span className="palette-item-icon">
                            {Icon ? <Icon size={14} /> : null}
                          </span>
                          <span className="palette-item-label">{cmd.label}</span>
                          {cmd.hint ? <span className="palette-item-hint">{cmd.hint}</span> : null}
                          {isActive ? (
                            <span className="palette-item-enter">
                              <CornerDownLeft size={11} />
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            <div className="palette-foot">
              <span className="palette-foot-keys">
                <kbd><ArrowUp size={9} /></kbd>
                <kbd><ArrowDown size={9} /></kbd>
                <span>navigate</span>
              </span>
              <span className="palette-foot-keys">
                <kbd><CornerDownLeft size={9} /></kbd>
                <span>select</span>
              </span>
              <span className="palette-foot-keys">
                <kbd>esc</kbd>
                <span>close</span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
