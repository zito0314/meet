/**
 * 응답 마감: 2026년 8월 31일 23:59:59 (KST, Asia/Seoul)
 *
 * 즉 2026-09-01T00:00:00+09:00 부터는 제출이 불가능합니다.
 * 서버 시간대가 UTC여도 아래 값은 절대 시각이므로 항상 한국 시간 기준으로 동작합니다.
 * (DB에서도 동일한 시각으로 CHECK 제약을 걸어 이중으로 차단합니다.)
 */
export const DEADLINE_ISO = "2026-09-01T00:00:00+09:00";

export const DEADLINE_AT = new Date(DEADLINE_ISO);

/** 마감 안내 문구에 쓰는 표시용 텍스트 */
export const DEADLINE_LABEL = "8월 31일";

export function isClosed(now: Date = new Date()): boolean {
  return now.getTime() >= DEADLINE_AT.getTime();
}
