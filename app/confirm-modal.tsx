"use client";

import { useEffect, useRef } from "react";
import { MEETING_DATES, type DateKey } from "./dates";

type Props = {
  open: boolean;
  name: string;
  answers: Partial<Record<DateKey, boolean>>;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmModal({ open, name, answers, submitting, onCancel, onConfirm }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreRef.current = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !submitting) {
        e.preventDefault();
        onCancel();
        return;
      }
      if (e.key !== "Tab") return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreRef.current?.focus?.();
    };
  }, [open, submitting, onCancel]);

  if (!open) return null;

  const available = MEETING_DATES.filter((d) => answers[d.key] === true);
  const unavailable = MEETING_DATES.filter((d) => answers[d.key] === false);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="animate-fade absolute inset-0 bg-ink/35"
        onClick={() => !submitting && onCancel()}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        className="animate-rise relative w-full max-w-[26rem] bg-paper px-6 pt-7 pb-6 sm:mx-4"
      >
        <h2 id="confirm-title" className="text-xl tracking-tight">
          이대로 제출할까요?
        </h2>
        <p id="confirm-desc" className="mt-2.5 text-sm leading-relaxed text-ink-soft">
          제출 후에는 답변을 수정할 수 없습니다.
          <br />
          선택한 내용을 한 번 더 확인해주세요.
        </p>

        <dl className="mt-6 border-t border-rule pt-4 text-sm">
          <div className="flex gap-4 py-1.5">
            <dt className="w-16 shrink-0 text-ink-faint">이름</dt>
            <dd className="tracking-tight">{name}</dd>
          </div>
          <div className="flex gap-4 py-1.5">
            <dt className="w-16 shrink-0 text-ink-faint">가능</dt>
            <dd className="display tracking-tight text-accent">
              {available.length ? available.map((d) => d.label).join("  ") : "없음"}
            </dd>
          </div>
          <div className="flex gap-4 py-1.5">
            <dt className="w-16 shrink-0 text-ink-faint">불가능</dt>
            <dd className="display tracking-tight text-ink-soft">
              {unavailable.length ? unavailable.map((d) => d.label).join("  ") : "없음"}
            </dd>
          </div>
        </dl>

        <div className="mt-7 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="min-h-12 flex-1 border border-rule text-[0.9375rem] text-ink-soft transition-colors duration-150 hover:border-ink-faint hover:text-ink disabled:opacity-50"
          >
            다시 확인하기
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="min-h-12 flex-1 border border-ink bg-ink text-[0.9375rem] text-paper transition-opacity duration-150 hover:opacity-85 disabled:opacity-60"
          >
            {submitting ? "제출 중…" : "제출하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
