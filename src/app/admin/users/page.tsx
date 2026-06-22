"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import { getUserProfile, grantBadge, grantTitle, saveUserProfile } from "@/lib/badges-client";
import { getEngagementProfile, saveEngagementProfile } from "@/lib/engagement-client";
import {
  FOCUS_TREE_STAGES,
  addXp,
  getFocusTreeSummary,
  getLevelProgress,
  setLevelProfile
} from "@/lib/level-client";
import { setCustomRoomAccess } from "@/lib/premium-client";
import { ROOM_CONFIGS, type RoomId } from "@/lib/room-config";
import {
  getRoomDetails,
  mutateAdminUserState,
  readAdminUserState,
  type WorkLog
} from "@/lib/work-room";
import type { AdminActionKind } from "@/lib/work-room";

const ACTIONS: { kind: AdminActionKind; label: string }[] = [
  { kind: "force_out", label: "強制退出" },
  { kind: "warn", label: "警告" },
  { kind: "ban", label: "BAN" },
  { kind: "move_room", label: "部屋移動" },
  { kind: "move_seat", label: "席移動" }
];

export default function AdminUsersPage() {
  const [rooms, setRooms] = useState(() => getRoomDetails());
  const [status, setStatus] = useState("操作対象を選んでください");
  const [targetRoom, setTargetRoom] = useState<RoomId>("cafe");
  const [profileDraft, setProfileDraft] = useState(() => getUserProfile());
  const [engagementDraft, setEngagementDraft] = useState(() => getEngagementProfile());
  const [levelDraft, setLevelDraft] = useState(() => getLevelProgress(getUserProfile()).level);
  const participants = rooms.flatMap((room) =>
    room.participants.map((participant) => ({
      ...participant,
      roomId: room.roomId,
      roomName: room.name
    }))
  );
  const levelSummary = getLevelProgress(profileDraft);
  const treeSummary = getFocusTreeSummary(profileDraft);
  const focusHours = Math.round((profileDraft.total_focus_time / 3600) * 10) / 10;
  const adminState = readAdminUserState();

  useEffect(() => {
    const refresh = () => setRooms(getRoomDetails());
    window.addEventListener("kiitos:admin-users-change", refresh);
    return () => window.removeEventListener("kiitos:admin-users-change", refresh);
  }, []);

  async function postAdminAction(path: string, body: Record<string, unknown>) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw new Error("Admin API failed");
    }
  }

  function appendLog(userId: string): WorkLog {
    return {
      id: crypto.randomUUID(),
      userName: userId,
      roomId: targetRoom,
      seatId: "-",
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      durationSeconds: 0
    };
  }

  async function action(kind: AdminActionKind, targetUserId: string) {
    const participant = participants.find((item) => item.id === targetUserId);
    if (!participant) return;

    try {
      if (kind === "force_out") {
        if (!window.confirm(`${participant.displayName} を強制退出しますか？`)) return;
        await postAdminAction("/api/admin/users/kick", {
          userId: targetUserId,
          reason: "Admin force out"
        });
        mutateAdminUserState((state) => ({
          ...state,
          kickedUserIds: { ...state.kickedUserIds, [targetUserId]: new Date().toISOString() },
          logs: [appendLog(targetUserId), ...state.logs]
        }));
        setStatus(`${participant.displayName} を強制退出しました。`);
      }

      if (kind === "warn") {
        const reason = window.prompt("警告理由を入力してください", "作業部屋のルールを確認してください");
        if (!reason) return;
        await postAdminAction("/api/admin/users/warn", { userId: targetUserId, reason });
        mutateAdminUserState((state) => ({
          ...state,
          warnings: [
            {
              id: crypto.randomUUID(),
              userId: targetUserId,
              reason,
              warnedBy: "env-admin",
              createdAt: new Date().toISOString()
            },
            ...state.warnings
          ],
          logs: [appendLog(targetUserId), ...state.logs]
        }));
        setStatus(`${participant.displayName} に警告を送信しました。`);
      }

      if (kind === "ban") {
        const reason = window.prompt("BAN理由を入力してください", "荒らし対策");
        if (!reason || !window.confirm(`${participant.displayName} をBANしますか？`)) return;
        await postAdminAction("/api/admin/users/ban", { userId: targetUserId, reason });
        mutateAdminUserState((state) => ({
          ...state,
          bans: {
            ...state.bans,
            [targetUserId]: {
              userId: targetUserId,
              reason,
              bannedBy: "env-admin",
              createdAt: new Date().toISOString()
            }
          },
          kickedUserIds: { ...state.kickedUserIds, [targetUserId]: new Date().toISOString() },
          logs: [appendLog(targetUserId), ...state.logs]
        }));
        setStatus(`${participant.displayName} をBANしました。`);
      }

      if (kind === "move_room" || kind === "move_seat") {
        const target = getRoomDetails().find((room) => room.roomId === targetRoom);
        const emptySeat = target?.seats.find((seat) => seat.status === "available");
        if (!emptySeat) {
          setStatus("移動先に空席がありません。");
          return;
        }
        await postAdminAction("/api/admin/users/move", {
          userId: targetUserId,
          roomId: targetRoom,
          seatId: emptySeat.id
        });
        mutateAdminUserState((state) => ({
          ...state,
          moves: {
            ...state.moves,
            [targetUserId]: {
              userId: targetUserId,
              roomId: targetRoom,
              seatId: emptySeat.id,
              movedBy: "env-admin",
              createdAt: new Date().toISOString()
            }
          },
          logs: [appendLog(targetUserId), ...state.logs]
        }));
        setStatus(`${participant.displayName} を ${targetRoom}/${emptySeat.id} へ移動しました。`);
      }

      setRooms(getRoomDetails());
    } catch {
      setStatus("操作に失敗しました。Adminログイン状態を確認してください。");
    }
  }

  async function unban(targetUserId: string) {
    try {
      await postAdminAction("/api/admin/users/unban", { userId: targetUserId });
      mutateAdminUserState((state) => {
        const bans = { ...state.bans };
        delete bans[targetUserId];
        const kickedUserIds = { ...state.kickedUserIds };
        delete kickedUserIds[targetUserId];
        return {
          ...state,
          bans,
          kickedUserIds,
          logs: [appendLog(targetUserId), ...state.logs]
        };
      });
      setRooms(getRoomDetails());
      setStatus(`${targetUserId} のBANを解除しました。`);
    } catch {
      setStatus("BAN解除に失敗しました。");
    }
  }

  function saveLevelProfile(message = "ユーザー成長データを保存しました") {
    const saved = setLevelProfile({
      xp: profileDraft.xp,
      level: levelDraft,
      coin: profileDraft.coin,
      totalFocusSeconds: profileDraft.total_focus_time,
      focusTreeStage: profileDraft.focus_tree_stage
    });
    setProfileDraft(saved);
    setLevelDraft(getLevelProgress(saved).level);
    setStatus(message);
  }

  function grantManualXp(amount: number) {
    const result = addXp(amount);
    setProfileDraft(result.profile);
    setLevelDraft(result.nextLevel);
    setStatus(`${amount >= 0 ? "+" : ""}${amount} XPを手動反映しました`);
  }

  function resetGrowth() {
    const saved = setLevelProfile({
      xp: 0,
      level: 1,
      coin: 0,
      totalFocusSeconds: 0,
      focusTreeStage: "Seed"
    });
    setProfileDraft(saved);
    setLevelDraft(1);
    setStatus("XP / Level / Coin / Focus Treeをリセットしました");
  }

  function saveEngagementAdmin(message = "ストリーク/Live設定を保存しました") {
    saveEngagementProfile(engagementDraft);
    setStatus(message);
  }

  function applyCustomRoomAccess(enabled: boolean) {
    setCustomRoomAccess(enabled);
    const saved = { ...getUserProfile(), plan: "free" as const };
    saveUserProfile(saved);
    setProfileDraft(saved);
    setStatus(enabled ? "Custom Room作成権限をONにしました" : "Custom Room作成権限をOFFにしました");
  }

  function toggleFounder() {
    const nextFounder = !profileDraft.is_founder;
    const saved = { ...profileDraft, is_founder: nextFounder };
    saveUserProfile(saved);
    setProfileDraft(saved);
    if (nextFounder) {
      grantBadge("founder-2026", "admin-manual");
      grantTitle("founder", "admin-manual");
    }
    setStatus(nextFounder ? "Founderを手動付与しました" : "Founder表示をOFFにしました");
  }

  function grantBetaTester() {
    grantBadge("beta-tester", "admin-manual");
    grantTitle("beta-tester", "admin-manual");
    setStatus("Beta Testerを手動付与しました");
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-cafe-950 p-6 text-stone-50 lg:p-8">
        <section className="mx-auto grid max-w-7xl gap-6">
          <header className="glass-panel rounded-[2rem] p-7">
            <p className="text-sm font-black uppercase text-amber-100/65">Admin Users</p>
            <h1 className="mt-2 text-5xl font-black">参加者管理</h1>
            <p className="mt-3 text-sm font-bold text-stone-200/55">{status}</p>
          </header>

          <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="grid gap-3">
              {participants.map((participant) => (
                <article
                  className="glass-panel grid gap-4 rounded-[1.75rem] p-4 md:grid-cols-[1fr_auto]"
                  key={participant.id}
                >
                  <div>
                    <p className="text-2xl font-black">{participant.displayName}</p>
                    <p className="mt-1 text-sm font-bold text-stone-300/55">
                      {participant.roomName} / {participant.seatId} / {participant.platform}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ACTIONS.map((item) => (
                      <button
                        className="rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-sm font-black"
                        key={item.kind}
                        onClick={() => void action(item.kind, participant.id)}
                        type="button"
                      >
                        {item.label}
                      </button>
                    ))}
                    {adminState.bans[participant.id] ? (
                      <button
                        className="rounded-2xl border border-emerald-100/25 bg-emerald-100/10 px-3 py-2 text-sm font-black text-emerald-100"
                        onClick={() => void unban(participant.id)}
                        type="button"
                      >
                        BAN解除
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
              {Object.values(adminState.bans).map((ban) => (
                <article
                  className="glass-panel grid gap-4 rounded-[1.75rem] border-rose-200/30 bg-rose-300/10 p-4 md:grid-cols-[1fr_auto]"
                  key={ban.userId}
                >
                  <div>
                    <p className="text-2xl font-black">{ban.userId}</p>
                    <p className="mt-1 text-sm font-bold text-rose-100/75">
                      BAN中 / {ban.reason}
                    </p>
                  </div>
                  <button
                    className="rounded-2xl border border-emerald-100/25 bg-emerald-100/10 px-4 py-3 font-black text-emerald-100"
                    onClick={() => void unban(ban.userId)}
                    type="button"
                  >
                    BAN解除
                  </button>
                </article>
              ))}
            </div>

            <aside className="grid gap-5">
              <section className="glass-panel rounded-[2rem] p-5">
                <h2 className="text-2xl font-black">移動先</h2>
                <select
                  className="mt-4 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 font-black"
                  onChange={(event) => setTargetRoom(event.target.value as RoomId)}
                  value={targetRoom}
                >
                  {ROOM_CONFIGS.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
                <p className="mt-4 text-sm font-bold leading-6 text-stone-200/58">
                  今はMVPとして操作履歴をAdmin Actionに記録します。将来Supabaseの active_sessions /
                  admin_actions に接続します。
                </p>
              </section>

              <section className="glass-panel rounded-[2rem] p-5">
                <p className="text-xs font-black uppercase text-amber-100/60">Growth Admin</p>
                <h2 className="mt-2 text-2xl font-black">XP / Level / Coin</h2>

                <div className="mt-4 grid gap-2 rounded-[1.5rem] border border-amber-100/15 bg-amber-100/10 p-4">
                  <p className="text-xs font-black uppercase text-amber-100/70">
                    Beta Role / Custom Access
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <AdminActionButton
                      label="Custom権限ON"
                      onClick={() => applyCustomRoomAccess(true)}
                    />
                    <AdminActionButton
                      label="Custom権限OFF"
                      onClick={() => applyCustomRoomAccess(false)}
                    />
                    <AdminActionButton
                      label={profileDraft.is_founder ? "Founder OFF" : "Founder付与"}
                      onClick={toggleFounder}
                    />
                    <AdminActionButton label="Beta Tester付与" onClick={grantBetaTester} />
                  </div>
                  <p className="text-xs font-bold text-stone-200/58">
                    現在: Beta Tester / Founder: {profileDraft.is_founder ? "ON" : "OFF"}
                  </p>
                </div>

                <div className="mt-4 grid gap-3 rounded-[1.5rem] border border-white/10 bg-black/24 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-bold text-stone-300/55">現在レベル</span>
                    <strong className="text-2xl font-black text-amber-100">
                      Lv.{levelSummary.level}
                    </strong>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <span
                      className="block h-full rounded-full bg-amber-100"
                      style={{ width: `${levelSummary.progress}%` }}
                    />
                  </div>
                  <p className="text-xs font-bold text-stone-300/55">
                    次のレベルまで {levelSummary.toNext} XP / 累計 {levelSummary.xp} XP
                  </p>
                </div>

                <div className="mt-4 grid gap-3">
                  <AdminNumberField
                    label="Level"
                    onChange={(value) => setLevelDraft(value)}
                    value={levelDraft}
                  />
                  <AdminNumberField
                    label="XP"
                    onChange={(value) => setProfileDraft({ ...profileDraft, xp: value })}
                    value={profileDraft.xp}
                  />
                  <AdminNumberField
                    label="Coin"
                    onChange={(value) => setProfileDraft({ ...profileDraft, coin: value })}
                    value={profileDraft.coin}
                  />
                  <AdminNumberField
                    label="累計集中時間(h)"
                    onChange={(value) =>
                      setProfileDraft({
                        ...profileDraft,
                        total_focus_time: Math.max(0, Math.round(value * 3600))
                      })
                    }
                    value={focusHours}
                  />
                  <label className="grid gap-2 text-sm font-black text-stone-200/65">
                    Focus Tree Stage
                    <select
                      className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
                      onChange={(event) =>
                        setProfileDraft({
                          ...profileDraft,
                          focus_tree_stage: event.target.value
                        })
                      }
                      value={profileDraft.focus_tree_stage}
                    >
                      {FOCUS_TREE_STAGES.map((stage) => (
                        <option key={stage.id} value={stage.name}>
                          {stage.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <AdminNumberField
                    label="ストリーク(日)"
                    onChange={(value) =>
                      setEngagementDraft({ ...engagementDraft, streakDays: value })
                    }
                    value={engagementDraft.streakDays}
                  />
                  <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/24 px-4 py-3 text-sm font-black text-stone-200/65">
                    Live表示
                    <input
                      checked={engagementDraft.live.isLive}
                      onChange={(event) =>
                        setEngagementDraft({
                          ...engagementDraft,
                          live: { ...engagementDraft.live, isLive: event.target.checked }
                        })
                      }
                      type="checkbox"
                    />
                  </label>
                </div>

                <div className="mt-4 rounded-[1.5rem] border border-emerald-100/15 bg-emerald-100/10 p-4">
                  <p className="text-sm font-black text-emerald-100">
                    {treeSummary.stage.icon} {treeSummary.stage.name}
                  </p>
                  <p className="mt-1 text-xs font-bold text-stone-200/62">
                    累計 {treeSummary.totalHours}時間
                    {treeSummary.next ? ` / 次まで ${treeSummary.hoursToNext}時間` : " / Legend"}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <AdminActionButton label="+100 XP" onClick={() => grantManualXp(100)} />
                  <AdminActionButton label="-100 XP" onClick={() => grantManualXp(-100)} />
                  <AdminActionButton
                    label="+150 Coin"
                    onClick={() => {
                      const saved = setLevelProfile({ coin: profileDraft.coin + 150 });
                      setProfileDraft(saved);
                      setStatus("+150 Coinを手動付与しました");
                    }}
                  />
                  <AdminActionButton label="リセット" onClick={resetGrowth} />
                </div>
                <button
                  className="mt-3 w-full rounded-2xl bg-amber-100 px-5 py-4 font-black text-stone-950"
                  onClick={() => {
                    saveLevelProfile();
                    saveEngagementAdmin();
                  }}
                  type="button"
                >
                  成長データを保存
                </button>
              </section>
            </aside>
          </section>
        </section>
      </main>
    </AdminGuard>
  );
}

function AdminNumberField({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-stone-200/65">
      {label}
      <input
        className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-stone-50 outline-none"
        min={0}
        onChange={(event) => onChange(Number(event.target.value))}
        type="number"
        value={value}
      />
    </label>
  );
}

function AdminActionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      className="rounded-2xl border border-white/10 bg-white/8 px-3 py-3 text-sm font-black"
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
