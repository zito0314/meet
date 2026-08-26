import type { DateKey } from "./dates";

/** 결과 집계 (개인별 응답은 포함하지 않습니다) */
export type ResultsSummary = {
  /** 총 응답 인원 */
  total: number;
  /** 날짜별 "가능" 인원 수 */
  counts: Record<DateKey, number>;
  /** 가장 많은 사람이 가능한 날짜 (공동 1위면 여러 개) */
  topKeys: DateKey[];
  /** 1위 날짜의 가능 인원 수 */
  topCount: number;
};
