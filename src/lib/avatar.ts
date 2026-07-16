// Was duplicated verbatim in CustomersPage.tsx and CustomerDetailPage.tsx.

const PALETTE = [
  { bg: "#EEF2FF", color: "#4F46E5" },
  { bg: "#FEF3C7", color: "#D97706" },
  { bg: "#DCFCE7", color: "#16A34A" },
  { bg: "#FCE7F3", color: "#DB2777" },
  { bg: "#E0F2FE", color: "#0284C7" },
  { bg: "#F3E8FF", color: "#9333EA" },
  { bg: "#FFF7ED", color: "#EA580C" },
  { bg: "#F0FDF4", color: "#15803D" },
];

export function getAvatarProps(name: string): { initials: string; bg: string; color: string } {
  const parts = name.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();

  const idx = name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % PALETTE.length;
  return { initials, ...PALETTE[idx] };
}
