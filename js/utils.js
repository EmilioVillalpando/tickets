// DOM Utilities
export const $ = (s) => document.querySelector(s);
export const $$ = (s) => Array.from(document.querySelectorAll(s));

// Number Formatting
export const to2 = (n) => Number(n || 0).toFixed(2);

// Date Utilities
export function todayISO() {
  const d = new Date();
  const z = d.getTimezoneOffset() * 60000;
  return new Date(d - z).toISOString().slice(0, 10);
}

export function addDays(dateISO, days) {
  const d = new Date(dateISO);
  d.setDate(d.getDate() + Number(days || 0));
  const z = d.getTimezoneOffset() * 60000;
  return new Date(d - z).toISOString().slice(0, 10);
}

// Folio Generation
export function genFolio() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `CVC-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

// CSV Utilities
export function csvEscape(s) {
  return '"' + String(s).replaceAll('"', '""') + '"';
}

// Device Detection
export const isAndroid = () => /Android/i.test(navigator.userAgent);

// Text Formatting for Thermal Printer
export function left(s, n) {
  return (s || "").toString().slice(0, n).padEnd(n, " ");
}

export function right(num, n) {
  const s = (num || "").toString();
  return s.length >= n ? s.slice(-n) : " ".repeat(n - s.length) + s;
}

export function monoLine() {
  return "--------------------------------\n"; // 32 col aprox 80mm
}
