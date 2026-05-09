'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';

type NavItem = { href: string; label: string; external?: boolean };

const NAV: NavItem[] = [
  { href: '/#calculator', label: 'Calculator' },
  { href: '/#models', label: 'Models' },
  { href: '/about', label: 'About' },
  {
    href: 'https://github.com/ThatMovieGuyOriginal/tokencount',
    label: 'GitHub',
    external: true,
  },
];

export function Header() {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const dialogId = useId();

  // Open/close the native dialog imperatively so we get focus trap + Esc for free.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Close on route change. We close the dialog imperatively; the dialog's onClose handler
  // syncs React state, which keeps `react-hooks/set-state-in-effect` happy.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  // Backdrop click closes — clicks on the <dialog> element itself fire when the click lands
  // outside the visible panel (the dialog fills the viewport).
  const handleDialogClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) {
      setOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-(--border) bg-(--bg)/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-(--container-app) items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
          aria-label="tokencount home"
        >
          <span aria-hidden className="text-(--accent)">
            ⟨t⟩
          </span>
          <span>tokencount</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-6 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <NavLink item={item} />
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls={dialogId}
          onClick={() => setOpen(true)}
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-(--text) hover:bg-(--surface)"
        >
          <HamburgerIcon open={false} />
        </button>
      </div>

      <dialog
        id={dialogId}
        ref={dialogRef}
        onClick={handleDialogClick}
        onClose={() => setOpen(false)}
        aria-label="Site navigation"
        className="m-0 ml-auto h-dvh max-h-none w-80 max-w-[85vw] bg-(--surface) p-0 text-(--text) backdrop:bg-black/60 open:flex open:flex-col"
      >
        <div className="flex h-14 items-center justify-between border-b border-(--border) px-5">
          <span className="text-sm font-medium tracking-tight text-(--text-muted)">Menu</span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-(--bg)"
          >
            <HamburgerIcon open={true} />
          </button>
        </div>
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto p-2">
          <ul className="flex flex-col">
            {NAV.map((item) => (
              <li key={item.href}>
                <NavLink item={item} mobile />
              </li>
            ))}
          </ul>
        </nav>
      </dialog>
    </header>
  );
}

function NavLink({ item, mobile = false }: { item: NavItem; mobile?: boolean }) {
  const base = mobile
    ? 'block rounded-md px-3 py-3 text-base text-(--text) hover:bg-(--bg)'
    : 'text-(--text-muted) hover:text-(--text) transition-colors';
  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={base}>
        {item.label}
      </a>
    );
  }
  return (
    <Link href={item.href} className={base}>
      {item.label}
    </Link>
  );
}

// 3-lines → X using only CSS transforms; no external icon library per §4.2.
function HamburgerIcon({ open }: { open: boolean }) {
  const common = 'absolute left-2 right-2 h-0.5 rounded-full bg-current transition-transform';
  return (
    <span aria-hidden className="relative block h-5 w-5">
      <span
        className={`${common} top-1.5 ${open ? 'translate-y-1.5 rotate-45' : ''}`}
        style={{ transitionDuration: '160ms' }}
      />
      <span
        className={`${common} top-2.5 transition-opacity ${open ? 'opacity-0' : 'opacity-100'}`}
        style={{ transitionDuration: '120ms' }}
      />
      <span
        className={`${common} top-3.5 ${open ? '-translate-y-1.5 -rotate-45' : ''}`}
        style={{ transitionDuration: '160ms' }}
      />
    </span>
  );
}
