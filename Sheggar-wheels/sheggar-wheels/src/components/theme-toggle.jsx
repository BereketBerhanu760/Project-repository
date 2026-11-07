"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const themes = [
  { id: "day", name: "Day", background: "#F8FAFC", received: "#FFFFFF", sent: "#FFF0E6", text: "#0F172A" },
  { id: "tinted", name: "Tinted", background: "#1E293B", received: "#475569", sent: "#D95B00", text: "#F8FAFC" },
  { id: "night", name: "Night", background: "#0B0F19", received: "#151C2C", sent: "#FF6600", text: "#F8FAFC" },
];

const accents = [
  { name: "Brand Orange", value: "#FF6600" },
  { name: "Electric Blue", value: "#007AFF" },
  { name: "Emerald Green", value: "#10B981" },
  { name: "Crimson Red", value: "#EF4444" },
  { name: "Amethyst Purple", value: "#8B5CF6" },
  { name: "Cool Gray", value: "#64748B" },
];

const validHex = /^#[\da-f]{6}$/i;

function updateSelectedControls(selector, attribute, selectedValue) {
  document.querySelectorAll(selector).forEach((control) => {
    const selected = control.dataset.value === selectedValue;
    control.setAttribute(attribute, String(selected));
  });
}

function applyTheme(theme, { persist = true } = {}) {
  document.documentElement.dataset.theme = theme;
  updateSelectedControls("[data-theme-option]", "aria-checked", theme);
  if (persist) {
    window.localStorage.setItem("sheggar-theme", theme);
    window.localStorage.setItem("sheggar-night-mode", String(theme === "night"));
  }
}

function applyAccent(color, { persist = true } = {}) {
  if (!validHex.test(color)) return;
  document.documentElement.style.setProperty("--accent-primary", color);
  const rgb = color.slice(1).match(/.{2}/g).map((channel) => Number.parseInt(channel, 16) / 255);
  const luminance = rgb.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  document.documentElement.style.setProperty("--accent-foreground", luminance > 0.42 ? "#0f172a" : "#ffffff");
  updateSelectedControls("[data-accent-option]", "aria-pressed", color.toUpperCase());
  const colorInput = document.querySelector("[data-custom-accent]");
  if (colorInput) colorInput.value = color;
  const hexInput = document.querySelector("[data-accent-hex]");
  if (hexInput) hexInput.value = color.toUpperCase();
  if (persist) window.localStorage.setItem("sheggar-accent", color);
}

export default function ThemeToggle({ className = "" }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("sheggar-theme");
    const legacyNightMode = window.localStorage.getItem("sheggar-night-mode") === "true";
    const theme = themes.some((option) => option.id === savedTheme)
      ? savedTheme
      : legacyNightMode ? "night" : "day";
    const savedAccent = window.localStorage.getItem("sheggar-accent");
    applyTheme(theme, { persist: false });
    applyAccent(validHex.test(savedAccent || "") ? savedAccent : accents[0].value, { persist: false });
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const savedAccent = window.localStorage.getItem("sheggar-accent");
    const colorInput = document.querySelector("[data-custom-accent]");
    const hexInput = document.querySelector("[data-accent-hex]");
    updateSelectedControls("[data-theme-option]", "aria-checked", document.documentElement.dataset.theme || "day");
    updateSelectedControls("[data-accent-option]", "aria-pressed", (savedAccent || accents[0].value).toUpperCase());
    if (colorInput && validHex.test(savedAccent || "")) colorInput.value = savedAccent;
    if (hexInput && validHex.test(savedAccent || "")) hexInput.value = savedAccent.toUpperCase();
    function closeOnOutsideClick(event) {
      if (!panelRef.current?.contains(event.target) && !buttonRef.current?.contains(event.target)) setOpen(false);
    }
    function closeOnEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className="theme-picker relative">
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Customize theme"
        className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-orange-50 ${className}`}
        onClick={() => setOpen((value) => !value)}
        ref={buttonRef}
        type="button"
      >
        <span aria-hidden="true">◉</span>
        <span className="hidden sm:inline">Theme</span>
      </button>
      {open && typeof document !== "undefined" && createPortal(<section aria-label="Theme customization" className="theme-picker-panel fixed right-4 top-20 z-[100] w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-5" ref={panelRef} role="dialog">
        <h2 className="text-base font-semibold text-slate-950">Themes</h2>
        <div aria-label="Theme presets" className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4" role="radiogroup">
          {themes.map((theme) => <button
            aria-checked={theme.id === "day"}
            className="theme-preset group flex min-w-0 flex-col items-center gap-2 rounded-xl p-1 text-xs text-slate-500 transition hover:bg-slate-50"
            data-theme-option
            data-value={theme.id}
            key={theme.id}
            onClick={() => applyTheme(theme.id)}
            role="radio"
            type="button"
          >
            <span className="theme-preview flex h-20 w-full flex-col justify-between rounded-lg border-2 border-transparent p-2" style={{ backgroundColor: theme.background }}>
              <span className="flex flex-col items-start gap-1">
                <span className="h-3 w-9 rounded-sm" style={{ backgroundColor: theme.received }} />
                <span className="ml-auto h-3 w-9 rounded-sm" style={{ backgroundColor: theme.sent }} />
              </span>
              <span className="theme-radio self-center" />
            </span>
            <span>{theme.name}</span>
          </button>)}
        </div>
        <div aria-label="Accent colors" className="mt-4 flex flex-wrap items-center justify-between gap-2" role="group">
          {accents.map((accent) => <button
            aria-label={accent.name}
            aria-pressed={accent.value === accents[0].value}
            className="theme-accent-swatch h-8 w-8 rounded-full border-2 border-transparent transition hover:scale-110"
            data-accent-option
            data-value={accent.value}
            key={accent.value}
            onClick={() => applyAccent(accent.value)}
            style={{ "--swatch-color": accent.value }}
            title={accent.name}
            type="button"
          />)}
          <label aria-label="Choose a custom accent color" className="theme-custom-swatch relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-transparent text-lg text-white" title="Custom color">
            <span aria-hidden="true">✿</span>
            <input
              aria-label="Custom accent color"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              data-custom-accent
              onChange={(event) => applyAccent(event.target.value)}
              type="color"
              defaultValue={accents[0].value}
            />
          </label>
        </div>
        <label className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-600">
          Custom hex
          <input
            aria-label="Custom accent hex value"
            className="w-28 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-900 outline-none focus:border-orange-500"
            data-accent-hex
            defaultValue={accents[0].value}
            maxLength={7}
            onChange={(event) => applyAccent(event.target.value)}
            pattern="#[\da-fA-F]{6}"
            placeholder="#FF6600"
            spellCheck="false"
            type="text"
          />
        </label>
      </section>, document.body)}
    </div>
  );
}
