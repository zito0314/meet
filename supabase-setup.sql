-- ============================================================
-- 모임 날짜 투표 — 초기 스키마
-- Supabase SQL Editor 에 이 파일 전체를 붙여넣고 한 번 실행하면 됩니다.
-- 여러 번 실행해도 안전합니다.
-- ============================================================

-- 1) 응답 테이블 --------------------------------------------------
create table if not exists public.responses (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  sep_04      boolean     not null,
  sep_06      boolean     not null,
  sep_13      boolean     not null,
  sep_18      boolean     not null,
  sep_27      boolean     not null,
  oct_02      boolean     not null,
  created_at  timestamptz not null default now(),

  -- 같은 이름으로 두 번 제출할 수 없습니다.
  constraint responses_name_unique unique (name),

  -- 빈 이름 / 지나치게 긴 이름 차단
  constraint responses_name_valid check (char_length(btrim(name)) between 1 and 12),

  -- 마감(2026-08-31 23:59:59 KST) 이후 INSERT 를 DB 레벨에서 차단합니다.
  constraint responses_before_deadline
    check (created_at < timestamptz '2026-09-01 00:00:00+09')
);

comment on table public.responses is
  '모임 날짜 투표 응답. 이름당 1행. 수정/삭제 불가.';

-- 2) Row Level Security -------------------------------------------
-- RLS 를 켜고 policy 를 하나도 만들지 않습니다.
-- => anon(브라우저에 노출되는 키) / authenticated 는 이 테이블에
--    SELECT / INSERT / UPDATE / DELETE 를 전혀 할 수 없습니다.
-- 실제 읽기·쓰기는 Next.js 서버(Server Action)에서 service_role 로만 수행합니다.
alter table public.responses enable row level security;

-- 3) 권한 ----------------------------------------------------------
-- 브라우저에서 쓰이는 역할의 권한을 모두 회수합니다. (RLS 와 이중 방어)
revoke all on table public.responses from anon;
revoke all on table public.responses from authenticated;

-- 서버(service_role)에게도 UPDATE / DELETE / TRUNCATE 는 주지 않습니다.
-- => 애플리케이션 어디에서도 기존 응답을 수정하거나 지울 수 없습니다.
revoke all on table public.responses from service_role;
grant select, insert on table public.responses to service_role;

-- 끝.
-- 확인용 쿼리 (선택):
--   select count(*) from public.responses;
