"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getEquippedTitle, getFavoriteBadges } from "@/lib/badges-client";
import type { Badge as UserBadge, Title } from "@/lib/badges-client";
import { getLevelProgress } from "@/lib/level-client";
import {
  getCustomRoom,
  upsertCustomRoom,
  type CustomRoom,
  type CustomRoomParticipant
} from "@/lib/premium-client";
import { formatDuration } from "@/lib/time";

const ME_ID = "demo-current-user";
const ME_NAME = "You";

export default function CustomRoomPage() {
  const params = useParams<{ id: string }>();
  const [room, setRoom] = useState<CustomRoom | null>(null);
  const [selectedSeatId, setSelectedSeatId] = useState("S1");
  const [editing, setEditing] = useState(false);
  const [equippedTitle, setEquippedTitle] = useState<Title | null>(null);
  const [favoriteBadges, setFavoriteBadges] = useState<UserBadge[]>([]);
  const [level, setLevel] = useState(getLevelProgress());
  const [, setTick] = useState(0);

  useEffect(() => {
    const loadedRoom = getCustomRoom(params.id);
    setRoom(loadedRoom);
    setSelectedSeatId(loadedRoom?.seats[0]?.seatId ?? "S1");
    setEquippedTitle(getEquippedTitle());
    setFavoriteBadges(getFavoriteBadges());
    setLevel(getLevelProgress());
  }, [params.id]);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const mySession = useMemo(
    () => room?.participants.find((participant) => participant.id === ME_ID) ?? null,
    [room]
  );
  const selectedSeat = room?.seats.find((seat) => seat.seatId === selectedSeatId) ?? null;
  const selectedParticipant =
    room?.participants.find((participant) => participant.seatId === selectedSeatId) ?? null;

  function save(nextRoom: CustomRoom) {
    setRoom(nextRoom);
    upsertCustomRoom(nextRoom);
  }

  function enterSeat() {
    if (!room || !selectedSeat || selectedParticipant) {
      return;
    }

    const participants = room.participants
      .filter((participant) => participant.id !== ME_ID)
      .concat({
        id: ME_ID,
        name: ME_NAME,
        seatId: selectedSeat.seatId,
        startedAt: new Date().toISOString()
      });
    save({ ...room, participants });
  }

  function leaveRoom() {
    if (!room) {
      return;
    }

    save({
      ...room,
      participants: room.participants.filter((participant) => participant.id !== ME_ID)
    });
  }

  if (!room) {
    return (
      <main className="grid min-h-screen place-items-center bg-cafe-950 p-6 text-stone-50">
        <section className="glass-panel max-w-lg rounded-[2rem] p-8 text-center">
          <h1 className="text-4xl font-black">Custom Roomが見つかりません</h1>
          <p className="mt-4 text-sm font-bold text-stone-200/62">
            localStorage上のDemo部屋が削除された可能性があります。
          </p>
          <Link
            className="mt-6 inline-flex rounded-2xl bg-amber-100 px-6 py-4 font-black text-stone-950"
            href="/lobby"
          >
            Lobbyへ戻る
          </Link>
        </section>
      </main>
    );
  }

  const usedSeats = new Set(room.participants.map((participant) => participant.seatId));

  return (
    <main className="relative min-h-screen overflow-hidden bg-cafe-950 p-5 text-stone-50 lg:p-8">
      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center opacity-45 blur-[1px]"
        style={{ backgroundImage: `url(${room.backgroundImage})` }}
      />
      <div className="pointer-events-none fixed inset-0 bg-black/66" />

      <section className="relative z-10 mx-auto grid max-w-[1800px] gap-5">
        <header className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-[2rem] p-5">
          <div>
            <p className="text-xs font-black uppercase text-amber-100/60">Custom Open Room</p>
            <h1 className="mt-2 text-5xl font-black">{room.name}</h1>
            <p className="mt-2 max-w-3xl text-sm font-bold text-stone-200/62">{room.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge label={room.visibility === "public" ? "公開" : "非公開"} />
            <Badge label={room.room_type} />
            <Badge label={`${room.participants.length}/${room.capacity}人`} />
            <Badge label={room.bgm} />
            <button
              className="rounded-2xl border border-white/12 bg-white/8 px-5 py-3 font-black"
              onClick={() => setEditing((value) => !value)}
              type="button"
            >
              部屋情報編集
            </button>
          </div>
        </header>

        {editing ? <RoomEditor onSave={save} room={room} /> : null}

        <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
          <div className="glass-panel relative aspect-[3/2] overflow-hidden rounded-[2.5rem]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${room.backgroundImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/22 to-black/10" />
            <div className="absolute left-6 top-6 rounded-[2rem] border border-white/12 bg-black/34 p-5 backdrop-blur-2xl">
              <p className="text-xs font-black uppercase text-amber-100/60">Choose a seat</p>
              <h2 className="mt-2 text-4xl font-black">好きな椅子に座る</h2>
              <p className="mt-2 text-sm font-bold text-stone-200/62">{room.theme}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {room.default_rules.map((rule) => (
                  <span
                    className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[0.68rem] font-black text-stone-100/65"
                    key={rule}
                  >
                    {rule}
                  </span>
                ))}
              </div>
            </div>

            {room.seats.map((seat) => {
              const participant = room.participants.find((item) => item.seatId === seat.seatId);
              const mine = participant?.id === ME_ID;
              const selected = selectedSeatId === seat.seatId;

              return (
                <button
                  aria-label={seat.name}
                  className={`seat-hotspot absolute -translate-x-1/2 -translate-y-1/2 rounded-[1.25rem] ${
                    participant ? "seat-hotspot-occupied" : "seat-hotspot-available"
                  } ${mine ? "seat-hotspot-mine" : ""} ${selected ? "seat-hotspot-selected" : ""}`}
                  key={seat.seatId}
                  onClick={() => setSelectedSeatId(seat.seatId)}
                  style={{
                    left: `${seat.x}%`,
                    top: `${seat.y}%`,
                    width: `${seat.width}%`,
                    height: `${seat.height}%`
                  }}
                  type="button"
                >
                  {participant ? (
                    <span className="seat-avatar pointer-events-none absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 gap-1 rounded-2xl border border-amber-100/35 bg-black/58 px-3 py-2 text-center shadow-[0_0_40px_rgba(253,230,138,0.25)] backdrop-blur-2xl">
                      <span className="text-[0.6rem] font-black uppercase tracking-normal text-amber-100/75">
                        {mine ? (equippedTitle?.name ?? "Cafe Master") : "Focus Mate"}
                      </span>
                      <span className="text-[0.6rem] font-black uppercase tracking-normal text-stone-100/70">
                        Lv.{mine ? level.level : 16}
                      </span>
                      <span className="relative mx-auto grid h-9 w-9 place-items-center rounded-full bg-amber-100 text-sm font-black text-stone-950">
                        {participant.name.slice(0, 1)}
                        {mine && favoriteBadges[0] ? (
                          <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full border border-black/40 bg-black text-[0.5rem] font-black text-amber-100">
                            {favoriteBadges[0].icon.slice(0, 2)}
                          </span>
                        ) : null}
                      </span>
                      <span className="max-w-24 truncate text-xs font-black text-stone-50">
                        {participant.name}
                      </span>
                      <span className="font-mono text-[0.65rem] font-black text-amber-100">
                        {formatDuration(elapsedSeconds(participant))}
                      </span>
                    </span>
                  ) : (
                    <span className="seat-marker-dot pointer-events-none" />
                  )}
                </button>
              );
            })}

            <div className="absolute bottom-5 left-5 right-5 flex flex-wrap justify-between gap-3 rounded-[1.75rem] border border-white/12 bg-black/36 p-4 backdrop-blur-2xl">
              <p className="text-sm font-bold text-stone-100/75">
                定員 {room.capacity} / 使用中 {usedSeats.size}
              </p>
              <p className="text-sm font-bold text-amber-100">
                {mySession ? `着席中 ${mySession.seatId}` : "未入室"}
              </p>
            </div>
          </div>

          <aside className="grid gap-5">
            <section className="glass-panel rounded-[2rem] p-6">
              <p className="text-xs font-black uppercase text-amber-100/60">Seat detail</p>
              <h2 className="mt-3 text-4xl font-black">{selectedSeat?.name ?? selectedSeatId}</h2>
              <div className="mt-5 grid gap-3 rounded-[1.5rem] border border-white/10 bg-black/24 p-4">
                <Line label="利用者" value={selectedParticipant?.name ?? "空席"} />
                <Line
                  label="作業時間"
                  value={
                    selectedParticipant
                      ? formatDuration(elapsedSeconds(selectedParticipant))
                      : "--:--:--"
                  }
                />
                <Line
                  label="状態"
                  value={
                    selectedParticipant?.id === ME_ID
                      ? "自分の席"
                      : selectedParticipant
                        ? "使用中"
                        : "空席"
                  }
                />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  className="rounded-2xl bg-amber-100 px-4 py-4 font-black text-stone-950 disabled:cursor-not-allowed disabled:opacity-35"
                  disabled={Boolean(selectedParticipant)}
                  onClick={enterSeat}
                  type="button"
                >
                  この席に座る
                </button>
                <button
                  className="rounded-2xl border border-white/12 bg-white/8 px-4 py-4 font-black disabled:cursor-not-allowed disabled:opacity-35"
                  disabled={!mySession}
                  onClick={leaveRoom}
                  type="button"
                >
                  退出
                </button>
              </div>
              {mySession ? (
                <Link
                  className="mt-3 block rounded-2xl border border-amber-100/30 bg-amber-100/12 px-4 py-4 text-center font-black text-amber-100 transition hover:bg-amber-100/18"
                  href={`/custom-room/${room.id}/seat/${mySession.seatId}`}
                >
                  席ビューへ入る
                </Link>
              ) : null}
            </section>

            <section className="glass-panel rounded-[2rem] p-6">
              <h2 className="text-2xl font-black">参加者</h2>
              <div className="mt-4 grid gap-3">
                {room.participants.length === 0 ? (
                  <p className="rounded-2xl border border-white/10 bg-black/24 p-4 text-sm font-bold text-stone-200/60">
                    まだ誰も座っていません。
                  </p>
                ) : (
                  room.participants.map((participant) => (
                    <div
                      className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/24 p-4"
                      key={participant.id}
                    >
                      <div>
                        <p className="text-[0.65rem] font-black uppercase text-amber-100/70">
                          Lv.{participant.id === ME_ID ? level.level : 16}
                        </p>
                        <p className="font-black">{participant.name}</p>
                        <p className="mt-1 text-xs font-bold text-stone-300/50">
                          {participant.seatId}
                        </p>
                      </div>
                      <time className="font-mono font-black text-amber-100">
                        {formatDuration(elapsedSeconds(participant))}
                      </time>
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}

function RoomEditor({ room, onSave }: { room: CustomRoom; onSave: (room: CustomRoom) => void }) {
  const [draft, setDraft] = useState(room);

  return (
    <section className="glass-panel grid gap-4 rounded-[2rem] p-5 lg:grid-cols-3">
      <EditField
        label="部屋名"
        onChange={(value) => setDraft({ ...draft, name: value })}
        value={draft.name}
      />
      <EditField
        label="BGM"
        onChange={(value) => setDraft({ ...draft, bgm: value })}
        value={draft.bgm}
      />
      <EditField
        label="テーマ"
        onChange={(value) => setDraft({ ...draft, theme: value })}
        value={draft.theme}
      />
      <EditField
        label="ルームタイプ"
        onChange={(value) => setDraft({ ...draft, room_type: value })}
        value={draft.room_type}
      />
      <EditField
        label="招待コード"
        onChange={(value) => setDraft({ ...draft, invite_code: value })}
        value={draft.invite_code}
      />
      <label className="grid gap-2 text-sm font-black text-stone-200/65 lg:col-span-2">
        説明
        <textarea
          className="min-h-24 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
          onChange={(event) => setDraft({ ...draft, description: event.target.value })}
          value={draft.description}
        />
      </label>
      <div className="grid gap-3">
        <label className="grid gap-2 text-sm font-black text-stone-200/65">
          公開設定
          <select
            className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
            onChange={(event) =>
              setDraft({ ...draft, visibility: event.target.value as "public" | "private" })
            }
            value={draft.visibility}
          >
            <option value="public">公開</option>
            <option value="private">非公開</option>
          </select>
        </label>
        <button
          className="rounded-2xl bg-amber-100 px-5 py-3 font-black text-stone-950"
          onClick={() => onSave(draft)}
          type="button"
        >
          編集内容を保存
        </button>
      </div>
    </section>
  );
}

function EditField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-stone-200/65">
      {label}
      <input
        className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-amber-100/20 bg-amber-100/10 px-4 py-2 text-sm font-black text-amber-100">
      {label}
    </span>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="font-bold text-stone-300/50">{label}</span>
      <span className="font-black text-stone-50">{value}</span>
    </div>
  );
}

function elapsedSeconds(participant: CustomRoomParticipant) {
  return Math.max(0, Math.floor((Date.now() - new Date(participant.startedAt).getTime()) / 1000));
}
