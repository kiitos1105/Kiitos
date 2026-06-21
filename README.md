# Kiitos Work Room

「部屋を選び、席を選び、毎日帰ってきたくなる」オンライン自習室/作業部屋です。

テーマ:

- Apple × Nordic Cafe × Kiitos
- 黒基調
- 木目
- 暖色ライト
- ガラスUI
- Lo-Fiカフェ
- 夜の作業部屋
- 雨

## Routes

- `/display`: OBS用の全体表示
- `/rooms/cafe`: Cafe Room
- `/rooms/library`: Library Room
- `/rooms/office`: Office Room
- `/rooms/creator`: Creator Room
- `/rooms/night`: Night Room
- `/camera`: OBS用の定点カメラ巡回
- `/admin`: 管理画面

## Rooms

将来 Discord / YouTube から入室しやすいように、room id は固定です。

- `cafe`: Cafe Room
- `library`: Library Room
- `office`: Office Room
- `creator`: Creator Room
- `night`: Night Room

席IDは `A1` から `C4` です。

## Setup

```bash
pnpm install
cp .env.example .env.local
```

`.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_DISPLAY_BGM=Lo-Fi Rainy Desk
NEXT_PUBLIC_DISPLAY_WEATHER=Tokyo · Light Rain
ADMIN_PASSWORD=
SESSION_WORKER_INTERVAL_MS=60000
```

Supabase未設定でもダミーデータで動きます。

## Supabase

Supabase SQL Editor で `supabase/schema.sql` を実行してください。

作成されるテーブル:

- `users`
- `rooms`
- `seats`
- `active_sessions`
- `session_logs`
- `warnings`
- `bans`
- `announcements`
- `admin_actions`

`platform` は `discord` / `youtube` / `web` を想定しています。

## Development

```bash
pnpm dev
```

URL:

```text
http://localhost:3000/display
http://localhost:3000/camera
http://localhost:3000/admin
```

## Admin

`/admin` は `ADMIN_PASSWORD` による簡易認証です。

MVPで用意している操作:

- 現在の参加者一覧
- 部屋ごとの参加者一覧
- 席ごとの利用者一覧
- 強制退出
- 警告
- BAN
- 部屋移動
- 席移動
- 全体アナウンス
- 部屋別アナウンス
- ポモドーロ開始/停止
- 部屋の有効/無効切り替え
- 定点カメラの巡回秒数変更

## Camera

`/camera` はOBS向けの定点カメラモードです。

デフォルトは7秒巡回です。Adminから以下に変更できます。

- 5秒
- 7秒
- 10秒
- 15秒
- 30秒

## Background Architecture

将来の常駐処理に備えて、構成を分けています。

- `web`: Next.js
- `worker`: session timer / cleanup / logs
- `bot`: Discord / YouTube adapter

起動:

```bash
pnpm worker
pnpm bot
```

## Docker

Webのみ:

```bash
docker compose up --build
```

Worker/Botを含める:

```bash
docker compose --profile worker --profile bot up --build
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
