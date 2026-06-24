/**
 * Hand-drawn 16/20/24px stroke icons. We avoid an icon library to keep the surface tight
 * and the visual language consistent — every icon here is on a 16px grid with a 1.5px
 * stroke and rounded caps, matching Editorial Quiet.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const baseProps: SVGProps<SVGSVGElement> = {
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function LockIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x={3.25} y={7} width={9.5} height={6} rx={1.25} />
      <path d="M5.25 7V5a2.75 2.75 0 0 1 5.5 0v2" />
    </svg>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4 7a4 4 0 0 1 8 0c0 2.5.75 3.5 1.25 4.25H2.75C3.25 10.5 4 9.5 4 7Z" />
      <path d="M6.5 13.25a1.5 1.5 0 0 0 3 0" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx={8} cy={8} r={2.75} />
      <path d="M8 1.5v1.75M8 12.75v1.75M14.5 8h-1.75M3.25 8H1.5M12.6 3.4l-1.25 1.25M4.65 11.35 3.4 12.6M12.6 12.6l-1.25-1.25M4.65 4.65 3.4 3.4" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M13.25 9.5A5.5 5.5 0 0 1 6.5 2.75a.5.5 0 0 0-.6-.6A6 6 0 1 0 13.85 10.1a.5.5 0 0 0-.6-.6Z" />
    </svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x={5} y={5} width={8} height={8} rx={1.25} />
      <path d="M3 11V4a1 1 0 0 1 1-1h7" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m3 8 3.5 3.5L13 5" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 8h10M9.25 4 13 8l-3.75 4" />
    </svg>
  );
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M9 3h4v4M13 3 7.5 8.5M11 9.5V12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h2.5" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M8 3.5v9M3.5 8h9" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m4 4 8 8M12 4l-8 8" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 5h10M3 8h10M3 11h10" />
    </svg>
  );
}

/** Two stacked horizontal lines + a longer underline — evokes "compare" / sliders. */
export function CompareIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 5h6M3 8h10M3 11h4" />
    </svg>
  );
}

/** Bookmark — for saved scenarios. */
export function BookmarkIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4.5 2.5h7v11l-3.5-2.5L4.5 13.5z" />
    </svg>
  );
}

/** Trash — for deleting saved scenarios. */
export function TrashIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 4.5h10M6 4.5V3a.75.75 0 0 1 .75-.75h2.5A.75.75 0 0 1 10 3v1.5M5 4.5l.75 8.25a1 1 0 0 0 1 .9h2.5a1 1 0 0 0 1-.9L11 4.5" />
    </svg>
  );
}

/** Right-pointing chevron used for disclosure widgets. */
export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="m6 4 4 4-4 4" />
    </svg>
  );
}

/** Subtle ring + dot — used to indicate "live" privacy receipt counters. */
export function LiveDotIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx={8} cy={8} r={2} fill="currentColor" stroke="none" />
      <circle cx={8} cy={8} r={5.5} opacity={0.35} />
    </svg>
  );
}

/** Keyboard — used in the shortcut overlay trigger. */
export function KeyboardIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x={2} y={4} width={12} height={8} rx={1.5} />
      <path d="M5 7h.01M8 7h.01M11 7h.01M5 10h6" />
    </svg>
  );
}
