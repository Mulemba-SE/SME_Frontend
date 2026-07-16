import { getAvatarProps } from "../../lib/avatar";

const SIZE_CLASSES = {
  // Circular avatar used in table rows (CustomersPage)
  table: "w-8 h-8 rounded-full text-xs font-bold flex-shrink-0",
  // Rounded-square avatars used on CustomerDetailPage
  sm: "w-9 h-9 rounded-xl text-sm font-bold flex-shrink-0",
  lg: "w-16 h-16 rounded-2xl text-xl font-bold flex-shrink-0",
} as const;

export function Avatar({ name, size = "sm" }: { name: string; size?: keyof typeof SIZE_CLASSES }) {
  const { initials, bg, color } = getAvatarProps(name);
  return (
    <div className={`${SIZE_CLASSES[size]} flex items-center justify-center`} style={{ background: bg, color }}>
      {initials}
    </div>
  );
}
