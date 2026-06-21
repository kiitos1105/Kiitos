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

- `/lobby`: Kiitos Work Roomの入口。部屋画像カードから入室
- `/rooms`: `/lobby` へリダイレクト
- `/display`: OBS用の全体表示
- `/rooms/cafe`: Cafe Room
- `/rooms/library`: Library Room
- `/rooms/office`: Office Room
- `/rooms/creator`: Creator Room
- `/rooms/night`: Night Room
- `/camera`: OBS用の定点カメラ巡回
- `/admin`: 管理画面入口
- `/admin/login`: Adminログイン
- `/admin/dashboard`: Admin Dashboard
- `/admin/seat-editor`: 座席手動調整モード
- `/admin/users`: 参加者管理
- `/admin/camera`: 定点カメラ設定

## Rooms

将来 Discord / YouTube から入室しやすいように、room id は固定です。

- `cafe`: Cafe Room
- `library`: Library Room
- `office`: Office Room
- `creator`: Creator Room
- `night`: Night Room

席IDは部屋ごとの座席表に合わせて `A1` / `B1` / `chair_01` などを使えます。

## Room Images

Home/Lobby背景:

```text
public/images/home-bg.jpeg
```

部屋画像は以下のパスに置く想定です。

```text
public/rooms/cafe-room.png
public/rooms/library-room.png
public/rooms/office-room.png
public/rooms/creator-room.png
public/rooms/night-room.png
```

座席表画像:

```text
public/rooms/cafe-seat-map.png
public/rooms/library-seat-map.png
public/rooms/office-seat-map.png
public/rooms/creator-seat-map.png
public/rooms/night-seat-map.png
```

画像が未配置でもグラデーションのフォールバック背景で動きます。

`/lobby` は部屋紹介画像をカードとして表示します。`/rooms/[roomId]` では座席表画像を大きく表示し、
`src/lib/roomSeatLayouts.ts` の座標に基づいて透明なクリック領域を椅子の上に配置しています。
席番号は座席表の上には追加表示せず、内部の `seat_id` として保持します。

座席座標は `%` で管理します。

```json
{
  "seat_id": "chair_01",
  "seat_name": "窓際席 1",
  "x": 23.4,
  "y": 45.8,
  "width": 4.2,
  "height": 5.0
}
```

`/admin/seat-editor` で保存すると `public/data/seat-layouts.json` に反映されます。

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
ADMIN_PASSWORD=Takemasa1105
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
http://localhost:3000/lobby
http://localhost:3000/display
http://localhost:3000/rooms/cafe
http://localhost:3000/camera
http://localhost:3000/admin
```

## Admin

`/admin/login` は `ADMIN_PASSWORD` による簡易認証です。ローカルMVPのデフォルトは
`Takemasa1105` です。ログイン後は `/admin/dashboard`
へ移動し、画面上部に `Admin Mode` が表示されます。通常画面の右下にある `Admin`
ボタンからログインできます。

MVPで用意している操作:

- 座席位置の手動調整
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
- 人が多い部屋を優先表示ON/OFF

Admin routes:

```text
http://localhost:3000/admin/login
http://localhost:3000/admin/dashboard
http://localhost:3000/admin/seat-editor
http://localhost:3000/admin/users
http://localhost:3000/admin/camera
```

## Weather

`/lobby` `/display` `/camera` では日本5大都市のダミー天気を一括表示します。

- 東京
- 名古屋
- 大阪
- 福岡
- 札幌

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
