import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase 클라이언트는 "서버에서만" 만들어집니다.
 *
 * - 환경변수 이름에 NEXT_PUBLIC_ 을 붙이지 않았기 때문에 브라우저 번들에 절대 포함되지 않습니다.
 * - 파일 최상단의 `server-only` 때문에, 실수로 클라이언트 컴포넌트에서 import 하면 빌드가 실패합니다.
 */

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "환경변수가 설정되지 않았습니다. SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 를 확인해주세요.",
    );
  }

  cached = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cached;
}
