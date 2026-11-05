# 우리 언제 만날까?

친구들끼리 모임 날짜를 정하는 아주 단순한 투표 사이트입니다.
이름을 적고 → 6개 날짜에 가능/불가능을 고르고 → 한 번만 제출합니다.
결과에서는 **누가 무엇을 골랐는지는 절대 보이지 않고**, 날짜별 가능 인원 수만 보입니다.

- 회원가입 / 로그인 없음
- 한 이름당 1회 제출, 수정·삭제 불가
- 마감: **2026년 8월 31일 23:59:59 (한국 시간)**

기술: Next.js(App Router) + TypeScript + Tailwind CSS + Supabase + Vercel

---

## 처음 세팅하기 — 4단계

개발 지식이 없어도 됩니다. 아래 순서대로만 하면 됩니다.
**터미널을 열거나 코드를 고칠 필요는 없습니다.**

### 1단계 — Supabase 프로젝트 만들고 SQL 한 번 실행

1. https://supabase.com 로그인 → **New project** 생성
   (프로젝트 이름은 아무거나, 리전은 `Northeast Asia (Seoul)` 추천)
2. 프로젝트가 만들어지면 왼쪽 메뉴에서 **SQL Editor** 클릭
3. 이 프로젝트의 `supabase-setup.sql` 파일을 열어
   **내용 전체를 복사**해서 SQL Editor에 붙여넣고 **Run** 클릭
4. `Success` 가 나오면 끝입니다. 테이블·제약조건·보안 설정이 한 번에 만들어집니다.

> 표를 직접 만들거나 정책을 클릭해서 설정할 필요 없습니다. SQL 한 번이면 끝입니다.

### 2단계 — Supabase 키 2개 복사해두기

Supabase 대시보드 → **Settings → API** 에서 두 값을 복사해 메모장에 붙여둡니다.

| 이름 | 어디서 복사 |
| --- | --- |
| `SUPABASE_URL` | **Project URL** |
| `SUPABASE_SERVICE_ROLE_KEY` | **Project API keys** 의 `service_role` (secret) |

> ⚠️ `service_role` 키는 비밀번호와 같습니다.
> 카톡·GitHub·채팅 어디에도 붙여넣지 마세요. Vercel 설정창에만 입력합니다.

### 3단계 — GitHub에 코드 올리기

**컴퓨터라면:** repo → Add file → Upload files → 압축 푼 `meet` 폴더 **안의 내용물 전체**를 드래그 → Commit.

**휴대폰이라면** (폴더 드래그가 안 되므로 순서가 중요합니다):

1. 파일 앱에서 `meet.zip` 길게 눌러 **압축 풀기**
2. Safari로 repo 접속 → 공유 버튼 → **데스크톱 사이트 요청**
3. **Add file → Create new file** → 파일명에 `app/icon.svg` 를 입력
   (슬래시를 넣으면 `app` 폴더가 자동으로 생깁니다)
   → 압축 푼 폴더의 `app/icon.svg` 내용을 붙여넣고 Commit
4. 생긴 `app` 폴더로 들어가서 **Add file → Upload files**
   → `app` 폴더 안의 나머지 14개 파일을 한 번에 선택 → Commit
5. repo 첫 화면으로 돌아와 **Add file → Upload files**
   → 루트에 있는 파일 8개를 선택 → Commit

   ```
   feat: initialize meeting poll
   ```

### 4단계 — Vercel 배포

1. https://vercel.com 로그인 → **Add New… → Project**
2. GitHub의 `zito0314/meet` 저장소를 **Import**
3. 배포 화면에서 **Environment Variables** 를 열고 2단계에서 복사한 값을 추가합니다

   | Key | Value |
   | --- | --- |
   | `SUPABASE_URL` | 복사해둔 Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | 복사해둔 service_role 키 |

   Environment는 **Production / Preview / Development 모두 체크**해주세요.
4. **Deploy** 클릭 → 1~2분 뒤 주소가 나옵니다. 그 주소를 친구들에게 공유하면 끝입니다.

> 환경변수를 나중에 추가했다면 Vercel → **Deployments → 맨 위 배포의 ⋯ → Redeploy** 를 한 번 눌러주세요.

---

## 배포 후 확인할 것

- [ ] 이름 없이 제출 → "이름을 입력해주세요."
- [ ] 날짜를 다 안 고르고 제출 → "모든 날짜의 가능 여부를 선택해주세요."
- [ ] 정상 제출 → 확인 모달 → "응답이 완료되었습니다."
- [ ] 같은 이름으로 다시 제출 → "이미 제출된 이름입니다."
- [ ] 새로고침해도 결과가 그대로인지
- [ ] 다른 브라우저(또는 휴대폰)에서도 같은 숫자가 보이는지
- [ ] 휴대폰에서 레이아웃이 깨지지 않는지

---

## 날짜나 문구를 바꾸고 싶다면

| 바꾸고 싶은 것 | 파일 |
| --- | --- |
| 6개 날짜 | `app/dates.ts` — 단, `key`는 DB 컬럼명이라 함께 SQL도 바꿔야 합니다 |
| 마감 시각 | `app/deadline.ts` + SQL의 `responses_before_deadline` 제약 |
| 화면 문구 | `app/poll.tsx`, `app/results-view.tsx` |
| 색·타이포 | `app/globals.css` 상단 `@theme` |

---

## 폴더 구조

```
app/
  layout.tsx          기본 HTML 뼈대, 메타 정보
  page.tsx            메인 페이지(서버) — 마감 여부 판단
  actions.ts          Server Action — 제출/집계 (서버에서만 실행)
  error.tsx           예기치 못한 오류 화면
  globals.css         디자인 토큰(색·폰트)과 공통 스타일
  icon.svg            파비콘
  poll.tsx            전체 흐름(이름 입력 → 선택 → 제출 → 결과)
  date-row.tsx        날짜 한 줄 + 가능/불가능 버튼
  confirm-modal.tsx   최종 확인 모달
  results-view.tsx    집계 결과 화면
  dates.ts            고정 날짜 상수
  deadline.ts         마감 시각(KST)
  supabase.ts         Supabase 연결 (서버 전용)
  aggregate.ts        결과 집계 (서버 전용)
  types.ts            공용 타입
supabase-setup.sql    DB를 그대로 재현하는 SQL
```

---

## 보안 요약

- Supabase 키는 `NEXT_PUBLIC_` 접두사를 쓰지 않아 **브라우저에 절대 내려가지 않습니다.**
- `app/supabase.ts`는 `server-only`로 잠겨 있어, 실수로 화면 쪽에서 불러오면 빌드가 실패합니다.
- `responses` 테이블은 RLS가 켜져 있고 정책이 하나도 없어 **anon 키로는 아무것도 할 수 없습니다.**
- DB 권한에서 `UPDATE / DELETE / TRUNCATE` 를 아예 회수해 **수정·삭제가 구조적으로 불가능**합니다.
- 결과 조회 시 `name` 컬럼은 select 하지 않으므로 개인별 응답이 브라우저로 나갈 수 없습니다.
- 마감은 서버(Server Action)와 DB(CHECK 제약) 양쪽에서 막습니다.
