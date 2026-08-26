"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-[34rem] flex-col justify-center px-6">
      <p className="eyebrow">문제가 생겼어요</p>
      <h1 className="mt-3 text-2xl tracking-tight">페이지를 불러오지 못했습니다.</h1>
      <p className="mt-2 text-sm text-ink-soft">잠시 후 다시 시도해주세요.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-7 min-h-12 w-full border border-ink bg-ink text-[0.9375rem] text-paper transition-opacity duration-150 hover:opacity-85 sm:w-48"
      >
        다시 시도하기
      </button>
    </main>
  );
}
