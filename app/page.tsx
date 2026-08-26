import Poll from "./poll";
import { isClosed } from "./deadline";
import { getResults } from "./aggregate";
import type { ResultsSummary } from "./types";

// 항상 최신 집계를 보여주기 위해 캐시하지 않습니다.
export const dynamic = "force-dynamic";

export default async function Page() {
  const closed = isClosed();

  let results: ResultsSummary | null = null;
  let resultsError: string | null = null;

  // 마감 전에는 결과를 미리 내려보내지 않습니다. (제출 전 결과 노출 방지)
  if (closed) {
    try {
      results = await getResults();
    } catch {
      resultsError = "결과를 불러오지 못했습니다.";
    }
  }

  return <Poll closed={closed} initialResults={results} initialResultsError={resultsError} />;
}
