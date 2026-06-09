"use client";

import { useRef, useState } from "react";

export interface AutocompleteSuggestion {
  id: string;
  title: string;
  thumbnail?: string;
}

export interface SearchAutocompleteProps {
  value: string;
  onChange: (v: string) => void;
  suggestions: AutocompleteSuggestion[];
  onSelect: (id: string) => void;
  placeholder?: string;
}

/**
 * Controlled search input with autocomplete dropdown.
 * Keyboard: ArrowDown/ArrowUp move active option, Enter selects, Escape closes.
 * Accessible combobox pattern: input role="combobox", list role="listbox", items role="option".
 * Keeps aria-label="Search products" for test compatibility.
 */
export function SearchAutocomplete({
  value,
  onChange,
  suggestions,
  onSelect,
  placeholder = "Search products…",
}: SearchAutocompleteProps) {
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listId = "search-autocomplete-listbox";

  const open = focused && value.trim().length > 0 && suggestions.length > 0;

  const selectOption = (id: string) => {
    onSelect(id);
    setFocused(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const suggestion = suggestions[activeIndex];
      if (suggestion) selectOption(suggestion.id);
    } else if (e.key === "Escape") {
      setFocused(false);
      setActiveIndex(-1);
    }
  };

  const handleFocus = () => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    setFocused(true);
  };

  const handleBlur = () => {
    // Delay so that a mouse click on an option fires first
    blurTimeoutRef.current = setTimeout(() => {
      setFocused(false);
      setActiveIndex(-1);
    }, 150);
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 480 }}>
      <span
        aria-hidden
        style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", opacity: 0.5, zIndex: 1 }}
      >
        🔍
      </span>
      <input
        type="search"
        role="combobox"
        aria-label="Search products"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
        aria-autocomplete="list"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "12px 16px 12px 44px",
          fontFamily: "var(--font-sans)",
          fontSize: "1rem",
          color: "var(--color-foreground)",
          background: "color-mix(in srgb, var(--color-primary) 6%, #fff)",
          border: "1.5px solid color-mix(in srgb, var(--color-primary) 18%, transparent)",
          borderRadius: open ? "18px 18px 0 0" : 999,
          outline: "none",
          position: "relative",
          zIndex: 10,
        }}
        onFocusCapture={(e) => (e.currentTarget.style.boxShadow = open ? "none" : "var(--shadow-glow)")}
        onBlurCapture={(e) => (e.currentTarget.style.boxShadow = "none")}
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Search suggestions"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            margin: 0,
            padding: "4px 0",
            listStyle: "none",
            background: "color-mix(in srgb, var(--color-primary) 6%, #fff)",
            border: "1.5px solid color-mix(in srgb, var(--color-primary) 18%, transparent)",
            borderTop: "1px solid color-mix(in srgb, var(--color-primary) 10%, transparent)",
            borderRadius: "0 0 18px 18px",
            boxShadow: "var(--shadow-md)",
            zIndex: 9,
            overflow: "hidden",
          }}
        >
          {suggestions.map((s, i) => {
            const isActive = i === activeIndex;
            const isUrl = s.thumbnail?.startsWith("http") || s.thumbnail?.startsWith("/");
            return (
              <li
                key={s.id}
                id={`${listId}-option-${i}`}
                role="option"
                aria-selected={isActive}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(-1)}
                onMouseDown={(e) => {
                  // Prevent blur from firing before click
                  e.preventDefault();
                  selectOption(s.id);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 16px",
                  cursor: "pointer",
                  background: isActive
                    ? "color-mix(in srgb, var(--color-primary) 12%, transparent)"
                    : "transparent",
                  transition: "background 0.1s",
                }}
              >
                <span
                  aria-hidden
                  style={{ fontSize: "1.5rem", lineHeight: 1, minWidth: 28, textAlign: "center" }}
                >
                  {isUrl ? (
                    <img src={s.thumbnail} alt="" style={{ width: 24, height: 24, objectFit: "contain" }} />
                  ) : (
                    (s.thumbnail ?? "🛒")
                  )}
                </span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.95rem" }}>{s.title}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
