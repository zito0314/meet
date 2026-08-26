"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { fetchResults, submitResponse } from "./actions";
import ConfirmModal from "./confirm-modal";
import DateRow from "./date-row";
import Results from "./results-view";
import { DATE_KEYS, MEETING_DATES, NAME_MAX_LENGTH, type DateKey } from "./dates";
import { DEADLINE_LABEL } from "./deadline";
import type { ResultsSummary } from "./types";

const STORAGE_KEY = "meet.submitted.v1";

type Props = {
  closed: boolean;
  initialResults: ResultsSummary | null;
  initialResultsError: string | null;
};

type Message = { message: string; hint?: string };

const noopSubscribe = () => () => {};
const readSubmittedFlag = () => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

export default function Poll({ closed, initialResults, initialResultsError }: Props) {
  const [isClosed, setIsClosed] = useState(closed);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [revealResults, setRevealResults] = useState(false);

  // 이미 제출한 브라우저인지 (hydration 안전하게 읽습니다)
  const submittedLocally = useSyncExternalStore(noopSubscribe, readSubmittedFlag, () => false);

  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<Partial<Record<DateKey, boolean>>>({});
  const [formError, setFormError] = useState<Message | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [results, setResults] = useState<ResultsSummary | null>(initialResults);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState<string | null>(initialResultsError);

  const loadResults = useCallback(async () => {
    setResultsLoading(true);
    setResultsError(null);
    const res = await fetchResults();
    if (res.ok) {
      setResults(res.results);
    } else {
      setResultsError(res.message);
    }
    setResultsLoading(false);
  }, []);

  const done = isClosed || justSubmitted || submittedLocally || revealResults;
  const alreadySubmitted = !isClosed && !justSubmitted && done;

  // 결과 화면에 들어왔는데 아직 집계가 없다면 한 번만 불러옵니다.
  const loadedRef = useRef(false);
  useEffect(() => {
    if (!done || justSubmitted || loadedRef.current) return;
    if (results || resultsError) return;
    loadedRef.current = true;
    // 마운트 직후 1회만 서버에서 집계를 가져옵니다. (외부 시스템 동기화)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadResults();
  }, [done, justSubmitted, results, resultsError, loadResults]);

  const selectedCount = DATE_KEYS.filter((k) => typeof answers[k] === "boolean").length;
  const trimmedName = name.trim();

  function handleSelect(key: DateKey, value: boolean) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setFormError(null);
  }

  function handleSubmitClick() {
    if (!trimmedName) {
      setFormError({ message: "이름을 입력해주세요." });
      return;
    }
    if (selectedCount < DATE_KEYS.length) {
      setFormError({ message: "모든 날짜의 가능 여부를 선택해주세요." });
      return;
    }
    setFormError(null);
    setModalOpen(true);
  }

  async function handleConfirm() {
    if (submitting) return;
    setSubmitting(true);

    const res = await submitResponse({ name: trimmedName, answers });

    if (res.ok) {
      try {
        window.localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // 저장 실패는 무시합니다.
      }
      setResults(res.results);
      setResultsError(null);
      setModalOpen(false);
      setSubmitting(false);
      setJustSubmitted(true);
      return;
    }

    setModalOpen(false);
    setSubmitting(false);
    setFormError({ message: res.message, hint: res.hint });

    // 마감된 경우에는 투표 UI 대신 결과 화면으로 전환합니다.
    if (res.message === "응답이 마감되었습니다.") {
      setIsClosed(true);
      void loadResults();
    }
  }

  return (
    <main className="mx-auto w-full max-w-[34rem] px-6 pt-14 pb-24 sm:px-8 sm:pt-20">
      {/* Intro */}
      <header>
        <p className="eyebrow">2026 · 모임 날짜 정하기</p>
        <h1 className="mt-3 text-[2.125rem] leading-[1.15] font-medium tracking-[-0.03em] sm:text-[2.5rem]">
          우리 언제 만날까?
        </h1>

        {!isClosed && !done && (
          <>
            <p className="mt-3 text-[0.9375rem] text-ink-soft">가능한 날짜를 모두 선택해주세요.</p>
            <div className="mt-7 border-t border-rule pt-4 text-[0.8125rem] leading-relaxed text-ink-soft">
              <p>한 번 제출한 답변은 수정할 수 없습니다.</p>
              <p className="mt-1.5">
                {DEADLINE_LABEL}까지 응답해주세요. 기한 내 응답하지 않을 경우 이번 모임은 불참으로
                간주합니다.
              </p>
            </div>
          </>
        )}
      </header>

      {/* 투표 */}
      {!done && (
        <>
          <section className="mt-12">
            <label htmlFor="name" className="eyebrow">
              이름
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="off"
              inputMode="text"
              maxLength={NAME_MAX_LENGTH}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setFormError(null);
              }}
              placeholder="이름을 입력해주세요"
              className="mt-2 w-full border-b border-rule bg-transparent pb-3 text-lg tracking-tight outline-none transition-colors duration-150 placeholder:text-ink-faint focus:border-ink"
            />
          </section>

          <section className="mt-12" aria-label="날짜 선택">
            <div className="flex items-baseline justify-between border-b border-ink pb-3">
              <h2 className="eyebrow">날짜</h2>
              <p className="text-xs text-ink-faint">
                <span className="display text-sm text-ink-soft">{selectedCount}</span> / 6 선택
              </p>
            </div>
            <div className="divide-y divide-rule">
              {MEETING_DATES.map((date) => (
                <DateRow
                  key={date.key}
                  date={date}
                  value={answers[date.key]}
                  onChange={(v) => handleSelect(date.key, v)}
                />
              ))}
            </div>
          </section>

          <div className="mt-10">
            <button
              type="button"
              onClick={handleSubmitClick}
              className="min-h-14 w-full border border-ink bg-ink text-base text-paper transition-opacity duration-150 hover:opacity-85"
            >
              제출하기
            </button>

            <div className="mt-4 min-h-10" aria-live="polite">
              {formError && (
                <div role="alert" className="animate-fade text-sm">
                  <p className="text-accent">{formError.message}</p>
                  {formError.hint && <p className="mt-1 text-[0.8125rem] text-ink-soft">{formError.hint}</p>}
                  {formError.message === "이미 제출된 이름입니다." && (
                    <button
                      type="button"
                      onClick={() => {
                        setRevealResults(true);
                        void loadResults();
                      }}
                      className="mt-3 min-h-11 border border-rule px-4 text-sm text-ink-soft transition-colors duration-150 hover:border-ink-faint hover:text-ink"
                    >
                      결과 보기
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 제출 완료 / 마감 / 이미 응답함 */}
      {done && (
        <section className="animate-rise mt-8 border-t border-rule pt-7">
          {isClosed ? (
            <>
              <p className="text-lg tracking-tight">응답이 마감되었습니다.</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                {DEADLINE_LABEL}을 기준으로 투표가 종료되었습니다.
              </p>
            </>
          ) : justSubmitted ? (
            <>
              <p className="text-lg tracking-tight">응답이 완료되었습니다.</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                답변은 수정할 수 없습니다.
                <br />
                최종 일정은 응답 마감 이후 정해집니다.
              </p>
            </>
          ) : alreadySubmitted ? (
            <>
              <p className="text-lg tracking-tight">이미 응답을 제출했습니다.</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                답변은 수정할 수 없습니다.
                <br />
                최종 일정은 응답 마감 이후 정해집니다.
              </p>
            </>
          ) : null}
        </section>
      )}

      {done && (
        <Results
          results={results}
          loading={resultsLoading}
          error={resultsError}
          onRetry={() => void loadResults()}
        />
      )}

      <ConfirmModal
        open={modalOpen}
        name={trimmedName}
        answers={answers}
        submitting={submitting}
        onCancel={() => !submitting && setModalOpen(false)}
        onConfirm={() => void handleConfirm()}
      />
    </main>
  );
}
