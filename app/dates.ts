/**
 * 투표 대상 날짜 (고정값)
 *
 * 날짜를 바꾸고 싶다면 이 파일만 수정하면 됩니다.
 * 단, `key` 값은 Supabase `responses` 테이블의 컬럼명과 반드시 같아야 합니다.
 * (컬럼명을 바꾸려면 supabase/migrations 의 SQL도 함께 수정해야 합니다.)
 */

export const MEETING_DATES = [
  { key: "sep_04", month: "SEP", day: "04", label: "09.04", weekday: "금" },
  { key: "sep_06", month: "SEP", day: "06", label: "09.06", weekday: "일" },
  { key: "sep_13", month: "SEP", day: "13", label: "09.13", weekday: "일" },
  { key: "sep_18", month: "SEP", day: "18", label: "09.18", weekday: "금" },
  { key: "sep_27", month: "SEP", day: "27", label: "09.27", weekday: "일" },
  { key: "oct_02", month: "OCT", day: "02", label: "10.02", weekday: "금" },
] as const;

export type MeetingDate = (typeof MEETING_DATES)[number];
export type DateKey = MeetingDate["key"];

export const DATE_KEYS: DateKey[] = MEETING_DATES.map((d) => d.key);

export const NAME_MAX_LENGTH = 12;
