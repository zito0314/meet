"use client";

import { MEETING_DATES } from "./dates";
import type { ResultsSummary } from "./types";

type Props = {
  results: ResultsSummary | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

export default function Results({ results, loading, error, onRetry }: Props) {
  return (
    <section aria-labelledby="results-title" className="mt-14">
      <div className="flex items-baseline justify-between border-b border-ink pb-3">
        <h2 id="results-title" className="eyebrow">
          현재 결과
        </h2>
        {results && (
          <p className="text-sm text-ink-soft">
            현재 <span className="display text-ink">{results.total}</span>명 응답
          </p>
        )}
      </div>

      {loading && (
        <p className="py-14 text-center text-sm text-ink-faint" role="status">
          결과를 불러오는 중…
        </p>
      )}

      {!loading && error && (
        <div className="py-12 text-center">
          <p className="text-sm text-ink-soft">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 min-h-11 border border-rule px-5 text-sm text-ink-soft transition-colors duration-150 hover:border-ink-faint hover:text-ink"
            >
              다시 시도하기
            </button>
          )}
        </div>
      )}

      {!loading && !error && results && results.total === 0 && (
        <div className="py-16 text-center">
          <p className="text-base tracking-tight">아직 응답이 없습니다.</p>
          <p className="mt-2 text-sm text-ink-soft">첫 번째 응답을 기다리고 있어요.</p>
        </div>
      )}

      {!loading && !error && results && results.total > 0 && (
        <>
          <div className="animate-rise pt-9 pb-8">
            {results.topCount === 0 ? (
              <>
                <p className="eyebrow">가장 많은 사람이 가능한 날</p>
                <p className="mt-3 text-lg tracking-tight">아직 가능한 날짜가 없습니다.</p>
                <p className="mt-2 text-sm text-ink-soft">응답이 더 모이면 다시 확인해주세요.</p>
              </>
            ) : (
              <>
                <p className="eyebrow">
                  {results.topKeys.length > 1
                    ? "가장 많은 사람이 가능한 날 (공동 1위)"
                    : "가장 많은 사람이 가능한 날"}
                </p>
                <div className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-2">
                  {MEETING_DATES.filter((d) => results.topKeys.includes(d.key)).map((d) => (
                    <p
                      key={d.key}
                      className="display text-[2.75rem] leading-none text-accent sm:text-[3.25rem]"
                    >
                      {d.month} {d.day}
                    </p>
                  ))}
                </div>
                <p className="mt-3 text-sm text-ink-soft">
                  <span className="display text-base text-ink">{results.topCount}</span>명 가능
                </p>
              </>
            )}
          </div>

          <ul className="border-t border-rule">
            {MEETING_DATES.map((d, i) => {
              const count = results.counts[d.key] ?? 0;
              const isTop = results.topKeys.includes(d.key);
              return (
                <li
                  key={d.key}
                  className="animate-rise flex items-baseline justify-between border-b border-rule py-3.5"
                  style={{ animationDelay: `${60 + i * 45}ms` }}
                >
                  <span
                    className={
                      "display text-lg tracking-tight " + (isTop ? "text-accent" : "text-ink-soft")
                    }
                  >
                    {d.label}
                    <span className="ml-2 font-sans text-xs text-ink-faint">{d.weekday}</span>
                  </span>
                  <span className={"text-sm " + (isTop ? "text-accent" : "text-ink-soft")}>
                    <span className="display text-base">{count}</span>명
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="mt-8 text-[0.8125rem] leading-relaxed text-ink-soft">
            모든 사람이 가능한 날짜를 찾는 방식이 아니라, 가장 많은 사람이 만날 수 있는 날짜를 기준으로 최종
            일정을 정합니다.
          </p>
          <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-faint">
            다수결의 원칙에 따라 가장 많은 인원이 참석 가능한 날짜로 결정됩니다.
          </p>
        </>
      )}
    </section>
  );
}
