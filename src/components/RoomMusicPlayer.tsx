"use client";

import { useEffect, useRef, useState } from "react";
import {
  getMusicForRoom,
  getMusicPlayerSettings,
  saveMusicPlayerSettings,
  type RoomMusicSetting
} from "@/lib/music-client";

export function RoomMusicPlayer({ roomId, compact = false }: { roomId: string; compact?: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [music, setMusic] = useState<RoomMusicSetting | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.14);
  const [muted, setMuted] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const nextMusic = getMusicForRoom(roomId);
    setMusic(nextMusic);
    const settings = getMusicPlayerSettings(nextMusic?.defaultVolume ?? 0.14);
    setVolume(settings.volume);
    setMuted(settings.muted);

    const sync = () => setMusic(getMusicForRoom(roomId));
    window.addEventListener("kiitos:music-settings-change", sync);
    return () => window.removeEventListener("kiitos:music-settings-change", sync);
  }, [roomId]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    audioRef.current.muted = muted;
    saveMusicPlayerSettings({ volume, muted });
  }, [muted, volume]);

  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio || !music?.enabled || !music.src) {
      setNotice("この部屋はBGMなしで利用できます。");
      return;
    }

    try {
      if (playing) {
        audio.pause();
        setPlaying(false);
        return;
      }
      await audio.play();
      setPlaying(true);
      setNotice("");
    } catch {
      setPlaying(false);
      setNotice("ブラウザ制限により、もう一度再生ボタンを押してください。");
    }
  }

  function stop() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setPlaying(false);
  }

  if (!music) {
    return null;
  }

  return (
    <section
      className={`rounded-[2rem] border border-white/10 bg-black/26 backdrop-blur-2xl ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase text-amber-100/60">Room BGM</p>
          <h2 className={compact ? "mt-1 text-xl font-black" : "mt-2 text-3xl font-black"}>
            {music.enabled ? music.title : "BGMなし"}
          </h2>
          <p className="mt-1 text-xs font-bold text-stone-300/55">
            {music.enabled && music.fileName ? music.fileName : "静かな作業モード"}
          </p>
        </div>
        <button
          className="rounded-full bg-amber-100 px-4 py-2 text-sm font-black text-stone-950"
          onClick={() => void togglePlay()}
          type="button"
        >
          {playing ? "停止" : "再生"}
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="flex items-center gap-2">
          <button
            className="rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs font-black"
            onClick={() => setMuted((current) => !current)}
            type="button"
          >
            {muted ? "ミュート解除" : "ミュート"}
          </button>
          <button
            className="rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs font-black"
            onClick={stop}
            type="button"
          >
            Stop
          </button>
        </div>
        <label className="grid gap-2 text-xs font-black uppercase text-stone-300/50">
          Volume {Math.round(volume * 100)}%
          <input
            className="accent-amber-100"
            max={0.5}
            min={0}
            onChange={(event) => setVolume(Number(event.target.value))}
            step={0.01}
            type="range"
            value={volume}
          />
        </label>
        {notice ? <p className="text-xs font-bold text-amber-100/75">{notice}</p> : null}
      </div>

      {music.enabled && music.src ? (
        <audio
          loop
          onEnded={() => setPlaying(false)}
          onError={() => {
            setPlaying(false);
            setNotice("音源ファイルが未配置です。BGMなしで利用できます。");
          }}
          preload="none"
          ref={audioRef}
          src={music.src}
        />
      ) : null}
    </section>
  );
}
