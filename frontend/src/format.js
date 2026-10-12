export const inr = (n) => "\u20B9" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
export const dateStr = (d) => (d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-");
export const dateTime = (t) => (t ? new Date(t).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-");
export const todayStr = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
export const label = (s) => String(s).replaceAll("_", " ").toLowerCase().replace(/(^|\s)\w/g, (c) => c.toUpperCase());
export const monthLabel = (ym) => new Date(ym + "-01T00:00:00").toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
export function duration(from, to) {
  const mins = Math.max(0, Math.round((new Date(to || Date.now()) - new Date(from)) / 60000));
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
}
// Suggested fines used to pre-fill the form (the officer can change them).
export const VIOLATIONS = [
  ["NO_HELMET", 1000], ["SIGNAL_JUMPING", 5000], ["OVER_SPEEDING", 2000], ["WRONG_PARKING", 500],
  ["NO_SEATBELT", 1000], ["MOBILE_USAGE", 5000], ["TRIPLE_RIDING", 1000],
];
export const SLOT_TYPES = ["CAR", "BIKE", "EV"];
export const COLORS = { ok: "#16a34a", warn: "#f59e0b", bad: "#dc2626", brand: "#2563eb", teal: "#0d9488", violet: "#7c3aed" };
