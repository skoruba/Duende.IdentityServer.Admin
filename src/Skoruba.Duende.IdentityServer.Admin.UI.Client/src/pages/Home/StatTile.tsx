import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCENTS } from "@/lib/accents";
import { NavItem } from "@/components/MainNav/navItems";

const COUNT_UP_MS = 600;

const useCountUp = (value?: number) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === undefined) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / COUNT_UP_MS);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return display;
};

export type StatTileContext = {
  label: string;
  tone: "ok" | "warning" | "danger";
};

const CONTEXT_DOT: Record<StatTileContext["tone"], string> = {
  ok: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
};

type StatTileProps = {
  item: NavItem;
  label: string;
  value?: number;
  isLoading: boolean;
  context?: StatTileContext;
};

const StatTile = ({
  item,
  label,
  value,
  isLoading,
  context,
}: StatTileProps) => {
  const accent = ACCENTS[item.kind];
  const Icon = item.icon;
  const display = useCountUp(value);

  return (
    <Link
      to={item.href}
      className={cn(
        "group relative flex min-w-0 flex-col rounded-xl border border-transparent bg-muted/40 p-3.5 transition-all duration-200",
        "hover:border-primary/50 hover:bg-card hover:shadow-lg hover:shadow-primary/5 hover:ring-2 hover:ring-primary/15 motion-safe:hover:-translate-y-0.5",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <span className="flex items-start justify-between">
        <span
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-xl",
            accent.bg,
            accent.ring,
            accent.text,
          )}
        >
          <Icon className="h-5 w-5 stroke-[1.75]" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
      </span>

      <span className="mt-auto block pt-3">
        <span className="block h-9">
          {isLoading ? (
            <span className="block h-8 w-12 animate-pulse rounded-md bg-muted" />
          ) : (
            <span className="block text-3xl font-semibold leading-9 tracking-tight tabular-nums">
              {value === undefined ? "–" : display.toLocaleString()}
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-sm leading-tight text-muted-foreground">
          {label}
        </span>
        {context && (
          <span className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              aria-hidden
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full",
                CONTEXT_DOT[context.tone],
              )}
            />
            <span className="truncate">{context.label}</span>
          </span>
        )}
      </span>
    </Link>
  );
};

export default StatTile;
