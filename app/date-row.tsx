"use client";

import type { MeetingDate } from "./dates";

type Props = {
  date: MeetingDate;
  value: boolean | undefined;
  disabled?: boolean;
  onChange: (value: boolean) => void;
};

const base =
  "min-h-11 min-w-[68px] px-4 text-[0.9375rem] tracking-tight border transition-colors duration-150 disabled:cursor-not-allowed";

export default function DateRow({ date, value, disabled, onChange }: Props) {
  const labelId = `date-${date.key}`;

  return (
    <div className="flex items-center justify-between gap-3 py-5">
      <div className="flex items-baseline gap-2.5" id={labelId}>
        <span className="display text-[2.5rem] leading-none sm:text-[2.75rem]">{date.day}</span>
        <span className="flex flex-col gap-0.5">
          <span className="eyebrow">{date.month}</span>
          <span className="text-xs text-ink-soft">{date.weekday}</span>
        </span>
      </div>

      <div className="flex gap-2" role="group" aria-labelledby={labelId}>
        <button
          type="button"
          disabled={disabled}
          aria-pressed={value === true}
          onClick={() => onChange(true)}
          className={
            base +
            " " +
            (value === true
              ? "border-accent bg-accent text-white"
              : "border-rule text-ink-faint hover:border-ink-faint hover:text-ink")
          }
        >
          가능
        </button>
        <button
          type="button"
          disabled={disabled}
          aria-pressed={value === false}
          onClick={() => onChange(false)}
          className={
            base +
            " " +
            (value === false
              ? "border-ink bg-ink text-paper"
              : "border-rule text-ink-faint hover:border-ink-faint hover:text-ink")
          }
        >
          불가능
        </button>
      </div>
    </div>
  );
}
