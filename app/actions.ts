"use server";

import { revalidatePath } from "next/cache";
import { DATE_KEYS, NAME_MAX_LENGTH, type DateKey } from "./dates";
import { isClosed } from "./deadline";
import { getSupabase } from "./supabase";
import { EMPTY_RESULTS, getResults, type ResultsSummary } from "./aggregate";

export type SubmitResult =
  | { ok: true; results: ResultsSummary }
  | { ok: false; message: string; hint?: string };

type SubmitInput = {
  name: string;
  answers: Partial<Record<DateKey, boolean>>;
};

/**
 * 응답 제출.
 *
 * 이 함수는 서버에서만 실행됩니다. 브라우저는 이 함수를 "호출"만 할 수 있고
 * Supabase 키나 원본 데이터에는 접근할 수 없습니다.
 *
 * 마감 / 중복 / 필수값 검증을 서버에서 다시 한 번 수행합니다.
 * (프론트엔드 검증은 사용자 편의를 위한 것일 뿐, 실제 차단은 여기와 DB에서 합니다.)
 */
export async function submitResponse(input: SubmitInput): Promise<SubmitResult> {
  // 1) 마감 검증 (서버 시각 기준)
  if (isClosed()) {
    return {
      ok: false,
      message: "응답이 마감되었습니다.",
      hint: "8월 31일을 기준으로 투표가 종료되었습니다.",
    };
  }

  // 2) 이름 검증
  const name = (input?.name ?? "").trim();
  if (!name) {
    return { ok: false, message: "이름을 입력해주세요." };
  }
  if (name.length > NAME_MAX_LENGTH) {
    return { ok: false, message: `이름은 ${NAME_MAX_LENGTH}자 이내로 입력해주세요.` };
  }

  // 3) 날짜 검증 — 6개 모두 true/false 여야 합니다.
  const row: Record<string, unknown> = { name };
  for (const key of DATE_KEYS) {
    const value = input?.answers?.[key];
    if (typeof value !== "boolean") {
      return { ok: false, message: "모든 날짜의 가능 여부를 선택해주세요." };
    }
    row[key] = value;
  }

  // 4) 저장
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("responses").insert(row);

    if (error) {
      // 23505: unique_violation → 이름 중복
      if (error.code === "23505") {
        return {
          ok: false,
          message: "이미 제출된 이름입니다.",
          hint: "제출한 답변은 수정할 수 없습니다.",
        };
      }
      // 23514: check_violation → 마감 이후 INSERT (DB 레벨 차단)
      if (error.code === "23514") {
        return {
          ok: false,
          message: "응답이 마감되었습니다.",
          hint: "8월 31일을 기준으로 투표가 종료되었습니다.",
        };
      }

      // 그 외 DB 오류는 사용자에게 원문을 노출하지 않고 로그로만 남깁니다.
      console.error("[submitResponse] insert failed:", error);
      return {
        ok: false,
        message: "응답을 저장하지 못했습니다.",
        hint: "잠시 후 다시 시도해주세요.",
      };
    }
  } catch (e) {
    console.error("[submitResponse] unexpected error:", e);
    return {
      ok: false,
      message: "응답을 저장하지 못했습니다.",
      hint: "잠시 후 다시 시도해주세요.",
    };
  }

  // 5) 저장 성공 → 최신 집계를 함께 반환
  revalidatePath("/");

  try {
    const results = await getResults();
    return { ok: true, results };
  } catch (e) {
    console.error("[submitResponse] results failed:", e);
    return { ok: true, results: EMPTY_RESULTS };
  }
}

/** 제출 없이 결과만 다시 불러오기 (이미 제출한 사람이 결과를 볼 때 사용) */
export async function fetchResults(): Promise<SubmitResult> {
  try {
    const results = await getResults();
    return { ok: true, results };
  } catch (e) {
    console.error("[fetchResults] failed:", e);
    return {
      ok: false,
      message: "결과를 불러오지 못했습니다.",
      hint: "잠시 후 다시 시도해주세요.",
    };
  }
}
