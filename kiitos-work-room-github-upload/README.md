# Kiitos Work Room

YouTube Live と Discord のどちらからでも入室できる、配信用オンライン自習室/作業部屋です。OBS Browser Source には `/display` を指定します。

## Features

- Discord: `/in room:編集`, `/out`, `/status`
- YouTube Live Chat: `!in 編集`, `!out`, `!status`
- 部屋: 編集 / 勉強 / 作業 / デザイン
- Supabase Realtime による `/display` のリアルタイム更新
- OBS専用UI: 黒基調 `rgb(10, 17, 20)`, Glassmorphism, Apple風, 近未来
- Framer Motion による参加/退室アニメーション
- ポモドーロタイマー、現在時刻、現在参加人数、部屋ごとのカードUI
- Docker / Docker Compose 対応
- TypeScript, ESLint, Prettier 対応

## Requirements

- Node.js 22+
- pnpm 11+
- Supabase project
- Discord application / bot
- YouTube Data API v3 API key

## Environment

```bash
cp .env.example .env.local
```

`.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

DISCORD_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=

YOUTUBE_API_KEY=
YOUTUBE_LIVE_CHAT_ID=
YOUTUBE_POLL_INTERVAL_MS=5000
```

`SUPABASE_SERVICE_ROLE_KEY` は bot と API route だけで使います。ブラウザには公開しないでください。`NEXT_PUBLIC_SUPABASE_ANON_KEY` は `/display` のRealtime購読に使います。

## Supabase

Supabase SQL Editor で [supabase/schema.sql](/Users/onigiri/Documents/Codex/2026-06-21/kiitos-work-room-youtube-live-discord/supabase/schema.sql) を実行します。

このSQLは以下を作成します。

- `rooms`
- `active_sessions`
- `session_logs`
- 初期部屋データ
- 表示画面用の匿名SELECTポリシー
- `active_sessions` の Supabase Realtime publication

## Local Development

```bash
pnpm install
pnpm dev
```

OBS Browser Source:

```text
http://localhost:3000/display
```

推奨サイズは `1920x1080` です。

## Discord

Discord Developer Portal で Bot を作成し、以下を設定します。

- Bot token: `DISCORD_TOKEN`
- Application ID: `DISCORD_CLIENT_ID`
- Guild ID: `DISCORD_GUILD_ID`
- OAuth2 URL Generator: `bot` と `applications.commands`

Slash command登録:

```bash
pnpm discord:register
```

Bot起動:

```bash
pnpm bot:discord
```

## YouTube

Google Cloud で YouTube Data API v3 を有効化し、API key を `YOUTUBE_API_KEY` に設定します。

`YOUTUBE_LIVE_CHAT_ID` は対象配信の live chat id です。YouTube Data API の `videos.list?part=liveStreamingDetails&id=VIDEO_ID` などで取得できます。

Bot起動:

```bash
pnpm bot:youtube
```

MVPではYouTubeチャットへの返信投稿は行わず、コマンド処理結果をbotプロセスのログに出します。参加状態は `/display` にリアルタイム反映されます。

## Docker

Webのみ:

```bash
docker build -t kiitos-work-room .
docker run --env-file .env.local -p 3000:3000 kiitos-work-room
```

Web + Discord bot + YouTube bot:

```bash
docker compose up --build
```

初回やコマンド変更時は、別ターミナルでSlash command登録を実行します。

```bash
docker compose run --rm web pnpm discord:register
```

## Quality

```bash
pnpm lint
pnpm format:check
pnpm build
```

整形:

```bash
pnpm format
```

## Project Structure

```text
src/app/display/page.tsx              OBS表示画面
src/app/display/use-display-state.ts  Supabase Realtime購読
src/app/api/sessions/route.ts         表示用API
src/bots/discord.ts                   Discord bot
src/bots/register-discord-commands.ts Slash command登録
src/bots/youtube.ts                   YouTube Live Chat bot
src/lib/sessions.ts                   入退室・ログ共通ロジック
src/lib/database.types.ts             DB型
supabase/schema.sql                   DB schema / RLS / Realtime
Dockerfile
compose.yaml
```
