# Kiitos Work Room

OBS Browser Source で表示するオンライン作業部屋のMVPです。

今回の範囲:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Docker / Docker Compose
- Supabase
- OBS用 `/display` ページ

Discord Bot と YouTube Bot はまだ含めていません。

## Setup

```bash
pnpm install
cp .env.example .env.local
```

`.env.local` を設定します。

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Supabase

Supabase SQL Editor で `supabase/schema.sql` を実行してください。

作成されるテーブル:

- `rooms`
- `active_sessions`

初期部屋:

- 編集
- 勉強
- 作業
- デザイン

`/display` は `active_sessions` を読み取り、部屋別の参加者と経過時間を表示します。

## Development

```bash
pnpm dev
```

OBS Browser Source:

```text
http://localhost:3000/display
```

推奨サイズ:

```text
1920x1080
```

## Docker

```bash
docker compose up --build
```

ブラウザで開くURL:

```text
http://localhost:3000/display
```

## Quality Check

```bash
pnpm lint
pnpm format:check
pnpm build
```

整形:

```bash
pnpm format
```

## Structure

```text
src/app/display/page.tsx              OBS display page
src/app/display/use-display-state.ts  Supabase Realtime subscription
src/app/api/config/route.ts           Public Supabase config API
src/app/api/sessions/route.ts         Display data API
src/lib/display-state.ts              Display data shaping
src/lib/supabase.ts                   Server Supabase client
src/lib/supabase-browser.ts           Browser Supabase client
supabase/schema.sql                   Supabase schema
Dockerfile
compose.yaml
```
