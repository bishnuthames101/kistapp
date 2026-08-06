'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * The booking flows each hand-rolled an overlay with `pointer-events-none` on
 * it, which meant no scrim, no dimming, and a page that stayed scrollable and
 * clickable behind the "modal" - it read as a rendering glitch rather than a
 * step in a flow. This is the one dialog they all use: a real backdrop, Escape
 * to close, a focus trap, and a scroll lock.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export default function Modal({
  open,
  onClose,
  title,
  children,
  labelledBy = 'modal-title',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  labelledBy?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((el) => el.offsetParent !== null);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // Stop the page behind from scrolling while the dialog is up.
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', handleKeyDown);

    // Move focus into the dialog so keyboard and screen reader users land here.
    const timer = window.setTimeout(() => {
      const target = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      (target ?? panelRef.current)?.focus();
    }, 0);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = overflow;
      window.clearTimeout(timer);
      previouslyFocused.current?.focus?.();
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl my-8 outline-none"
      >
        <h2 id={labelledBy} className="text-2xl font-bold mb-6">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
