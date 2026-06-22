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
- `/badges`: 獲得済みバッジと未獲得バッジ
- `/titles`: 称号の解放と装備
- `/profile`: 今日の目標、一言、Live設定、Focus Calendar
- `/ranking`: 今日・週間・月間・部屋別ランキング
- `/friends`: フレンド一覧、申請、ブロック、一緒に参加
- `/certificate`: 集中証明書の作成と保存
- `/pricing`: Demo Premium
- `/custom-room/new`: Premium用Custom Open Room作成

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
ADMIN_PASSWORD=1
SESSION_WORKER_INTERVAL_MS=60000
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
DISCORD_BOT_TOKEN=
YOUTUBE_API_KEY=
YOUTUBE_LIVE_CHAT_ID=
```

Supabase未設定でもダミーデータで動きます。

## Environment Variables

| Name | Required | Used by | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Production | Web | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production | Web | Supabase anon key for browser reads/realtime. |
| `SUPABASE_SERVICE_ROLE_KEY` | Production/Admin | API/Worker | Server-side Supabase writes. Never expose publicly. |
| `ADMIN_PASSWORD` | Yes | Web/Admin | Simple admin password. Local MVP default is `1`. |
| `NEXT_PUBLIC_DISPLAY_BGM` | No | Display | Default OBS BGM label. |
| `NEXT_PUBLIC_DISPLAY_WEATHER` | No | Display | Default OBS weather label. |
| `SESSION_WORKER_INTERVAL_MS` | No | Worker | Cleanup/log worker interval. |
| `DISCORD_CLIENT_ID` | Discord OAuth | Web/Auth | Discord OAuth application client ID. |
| `DISCORD_CLIENT_SECRET` | Discord OAuth | Web/Auth | Discord OAuth client secret. |
| `NEXTAUTH_SECRET` | Discord OAuth | Web/Auth | Auth session secret. Generate a long random value. |
| `NEXTAUTH_URL` | Discord OAuth | Web/Auth | Local: `http://localhost:3000`; production: public Vercel URL. |
| `DISCORD_BOT_TOKEN` | Bot | Railway/Bot | Discord bot token for slash commands. |
| `YOUTUBE_API_KEY` | Bot | Railway/Bot | YouTube Live Chat API key. |
| `YOUTUBE_LIVE_CHAT_ID` | Bot | Railway/Bot | YouTube live chat id when using bot adapter. |

## Supabase

Supabase SQL Editor で `supabase/schema.sql` を実行してください。

Supabase接続手順:

1. [Supabase](https://supabase.com/) で新規Projectを作成します。
2. Project Settings → API から `Project URL` を `NEXT_PUBLIC_SUPABASE_URL` に設定します。
3. `anon public` key を `NEXT_PUBLIC_SUPABASE_ANON_KEY` に設定します。
4. `service_role` key を `SUPABASE_SERVICE_ROLE_KEY` に設定します。
5. SQL Editorで `supabase/schema.sql` を実行します。
6. Realtimeを使う場合は `active_sessions` が `supabase_realtime` publication に入っていることを確認します。

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
- `focus_trees`

`platform` は `discord` / `youtube` / `web` を想定しています。

`users` には Kiitos Level System 用に以下を持たせています。

- `level`
- `xp`
- `coin`
- `total_focus_time`
- `current_title`
- `favorite_badges`
- `focus_tree_stage`
- `focus_tree_updated_at`

MVPではブラウザのlocalStorageで動作し、将来Supabaseの `users` / `focus_trees`
へ置き換えやすい構成にしています。

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

## Vercel Deploy

GitHubへpush後、Vercelで公開URLを発行します。

1. [Vercel](https://vercel.com/) にログインします。
2. `Add New...` → `Project` を選択します。
3. GitHub repository `kiitos1105/Kiitos` をImportします。
4. Framework Presetは `Next.js` のままでOKです。
5. Build Command: `pnpm build`
6. Install Command: `pnpm install`
7. Environment Variablesに `.env.example` の値を登録します。
8. `NEXTAUTH_URL` は発行されたVercel URLに変更します。
   例: `https://kiitos-work-room.vercel.app`
9. Deployを実行します。

公開後にDiscord OAuthを使う場合は、Discord Developer PortalのRedirect URLも本番URLへ追加してください。

```text
https://本番ドメイン/api/auth/callback/discord
```

## Discord OAuth Setup

Kiitos Work Roomは通常のメール登録ではなく、Discordログインを前提に設計します。

Discord Developer Portal側:

1. [Discord Developer Portal](https://discord.com/developers/applications) を開きます。
2. Applicationを作成、または既存Applicationを選択します。
3. OAuth2 → General で `CLIENT ID` と `CLIENT SECRET` を確認します。
4. `.env.local` / Vercel Environment Variables に以下を設定します。

```bash
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

5. OAuth2 → Redirects に開発用URLを追加します。

```text
http://localhost:3000/api/auth/callback/discord
```

6. 本番公開後は本番URLも追加します。

```text
https://本番ドメイン/api/auth/callback/discord
```

Redirect URLはアプリ側のcallback URLと完全一致する必要があります。

`NEXTAUTH_SECRET` は以下のようなコマンドで生成できます。

```bash
openssl rand -base64 32
```

## Admin

`/admin/login` は `ADMIN_PASSWORD` による簡易認証です。ローカルMVPのデフォルトは
`1` です。ログイン後は `/admin/dashboard`
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
- XP / Level / Coinの手動付与・減算・リセット
- 累計集中時間とFocus Tree Stageの確認・修正
- ストリーク編集
- Live表示ON/OFF
- ランキング管理
- MVP設定
- 証明書確認
- フレンド/通報/リアクションログ確認

Admin routes:

```text
http://localhost:3000/admin/login
http://localhost:3000/admin/dashboard
http://localhost:3000/admin/seat-editor
http://localhost:3000/admin/users
http://localhost:3000/admin/camera
http://localhost:3000/admin/rankings
http://localhost:3000/admin/mvp
http://localhost:3000/admin/certificates
http://localhost:3000/admin/social
```

## Engagement Features

継続率とSNS拡散のために、MVPではlocalStorage/mockデータで以下を動かしています。

- 今日の目標: 動画編集、勉強、開発、デザイン、読書、仕事、その他
- 今日の一言
- お気に入り席とワンクリック着席
- ストリーク表示
- 部屋の混雑表示
- 退出理由
- Liveマークと配信URL
- GitHub風フォーカスカレンダー
- 月間MVP
- SNSシェアカード風リザルトと保存ボタン
- 集中証明書
- Discord VC参加者枠
- フレンド機能
- 簡易リアクション

## Level / XP / Coin

Levelは強さではなく、努力・継続・集中の証として扱います。

XP獲得のMVPルール:

- ログイン: `+5 XP`
- 30分集中: `+30 XP`
- 1時間集中: `+70 XP`
- 2時間集中: `+160 XP`
- 4時間集中: `+350 XP`
- 今日の目標達成: `+100 XP`
- 7日連続: `+300 XP`
- イベント参加: `+200 XP`
- Founder: `+500 XP`
- Premium: `+50 XP / 日`

席を退出するとリザルト画面が表示され、集中時間、獲得XP、Coin、Focus Treeの成長が確認できます。
Coinは今後、家具・アバター・背景・フレーム・BGM購入に使う想定です。

レベル解放称号:

- Lv5: 集中ビギナー
- Lv10: Cafe Explorer
- Lv20: Focus Worker
- Lv30: Night Worker
- Lv50: Focus Master
- Lv75: Productivity Pro
- Lv100: Kiitos Legend

## Focus Tree

ユーザーごとに1本のFocus Treeを持ち、累計集中時間で成長します。

- Stage 1 Seed: 0〜9時間
- Stage 2 Sprout: 10〜99時間
- Stage 3 Young Tree: 100〜499時間
- Stage 4 Big Tree: 500〜999時間
- Stage 5 Bloom Tree: 1000〜4999時間
- Stage 6 Legend Tree: 5000時間以上

プロフィール、マイページ、席ビュー、リザルト画面に表示します。
成長に応じて `Sprout Badge` / `Young Tree Badge` / `Big Tree Badge` /
`Bloom Tree Badge` / `Legend Tree Badge` を自動付与できる設計です。

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

## Railway Bot Deploy

Discord Bot / YouTube Bot / WorkerはRailwayで別プロセスとして動かす想定です。

1. [Railway](https://railway.app/) でNew Projectを作成します。
2. `Deploy from GitHub repo` から `kiitos1105/Kiitos` を選択します。
3. Variablesに以下を設定します。

```bash
DISCORD_BOT_TOKEN=
YOUTUBE_API_KEY=
YOUTUBE_LIVE_CHAT_ID=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SESSION_WORKER_INTERVAL_MS=60000
```

4. BotサービスのStart Commandを設定します。

```bash
pnpm bot
```

5. Workerサービスを分ける場合は、もう1つRailway serviceを作りStart Commandを設定します。

```bash
pnpm worker
```

現在の `src/bot/index.mjs` と `src/worker/session-worker.mjs` はMVP用のplaceholderです。
将来ここへDiscord slash command、YouTube Live Chat API、セッション整理処理を追加します。

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
