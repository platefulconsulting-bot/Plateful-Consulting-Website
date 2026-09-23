import {
  Rocket,
  UtensilsCrossed,
  Store,
  Truck,
  Camera,
  CalendarDays,
  Target,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { IconKey } from "@/lib/site";
import { cn } from "@/lib/utils";

const ICONS: Record<IconKey, LucideIcon> = {
  rocket: Rocket,
  menu: UtensilsCrossed,
  store: Store,
  truck: Truck,
  camera: Camera,
  calendar: CalendarDays,
  target: Target,
  shield: ShieldCheck,
};

/** Icon in a tinted, bevelled tile — the shared visual unit for services. */
export function ServiceIcon({
  icon,
  accent,
  className,
  size = "md",
}: {
  icon: IconKey;
  accent: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const Icon = ICONS[icon];

  const box = { sm: "h-10 w-10", md: "h-12 w-12 p-3", lg: "h-16 w-16 p-4" }[size];
  const glyph = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" }[size];

  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center rounded-2xl border transition-transform duration-500",
        box,
        className,
      )}
      style={{
        backgroundColor: `${accent}14`,
        borderColor: `${accent}33`,
        boxShadow: `inset 0 1px 0 0 ${accent}22`,
      }}
    >
      <Icon className={glyph} style={{ color: accent }} aria-hidden strokeWidth={1.6} />
    </span>
  );
}
