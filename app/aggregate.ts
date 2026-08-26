import "server-only";
import { getSupabase } from "./supabase";
import { DATE_KEYS, type DateKey } from "./dates";
import type { ResultsSummary } from "./types";

export type { ResultsSummary };

export const EMPTY_RESULTS: ResultsSummary = {
  total: 0,
  counts: Object.fromEntries(DATE_KEYS.map((k) => [k, 0])) as Record<DateKey, number>,
  topKeys: [],
  topCount: 0,
};

/** 순수 집계 함수 (테스트하기 쉽도록 분리) */
export function summarize(rows: Record<DateKey, boolean>[]): ResultsSummary {
  const counts = Object.fromEntries(DATE_KEYS.map((k) => [k, 0])) as Record<DateKey, number>;
  for (const row of rows) {
    for (const key of DATE_KEYS) {
      if (row[key] === true) counts[key] += 1;
    }
  }

  const topCount = DATE_KEYS.reduce((max, k) => Math.max(max, counts[k]), 0);
  const topKeys = topCount > 0 ? DATE_KEYS.filter((k) => counts[k] === topCount) : [];

  return { total: rows.length, counts, topKeys, topCount };
}

/**
 * 집계는 항상 서버에서만 수행합니다.
 * name 컬럼은 아예 select 하지 않기 때문에 개인별 응답이 브라우저로 내려갈 수 없습니다.
 */
export async function getResults(): Promise<ResultsSummary> {
  const supabase = getSupabase();

  const { data, error } = await supabase.from("responses").select(DATE_KEYS.join(","));

  if (error) {
    throw new Error(error.message);
  }

  return summarize((data ?? []) as unknown as Record<DateKey, boolean>[]);
}
