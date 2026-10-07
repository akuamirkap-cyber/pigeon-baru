import { useCallback, useEffect, useState } from "react";
import Scene from "./Scene";
import { SKINS } from "./characters";
import { EFFECTS } from "./effects";
import { cn } from "./utils/cn";

export default function BuddiesApp({ onBackToPigeon }: { onBackToPigeon?: () => void } = {}) {
  const [index, setIndex] = useState(0);
  const [effectId, setEffectId] = useState<string | null>(null);
  const skin = SKINS[index];

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + SKINS.length) % SKINS.length),
    []
  );
  const next = useCallback(() => setIndex((i) => (i + 1) % SKINS.length), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  return (
    <div
      className="relative h-screen w-screen overflow-hidden font-sans transition-colors duration-700"
      style={{
        background: `linear-gradient(180deg, ${skin.bg[0]} 0%, ${skin.bg[1]} 100%)`,
      }}
    >
      {/* 3D canvas */}
      <div className="absolute inset-0">
        <Scene skinIndex={index} effectId={effectId} />
      </div>

      {/* Effect selector (kanan) */}
      <div className="absolute right-3 top-20 z-10 flex flex-col gap-2 sm:right-6">
        <p className="text-center text-[10px] font-bold uppercase tracking-wider text-white/70">
          Efek
        </p>
        <button
          onClick={() => setEffectId(null)}
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl text-xl transition-all",
            effectId === null
              ? "scale-110 bg-white shadow-lg"
              : "bg-white/30 backdrop-blur-md hover:bg-white/50"
          )}
          title="Tanpa efek"
        >
          🚫
        </button>
        {EFFECTS.map((e) => (
          <button
            key={e.id}
            onClick={() => setEffectId(e.id)}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl text-xl transition-all",
              effectId === e.id
                ? "scale-110 bg-white shadow-lg"
                : "bg-white/30 backdrop-blur-md hover:bg-white/50"
            )}
            title={e.name}
          >
            {e.emoji}
          </button>
        ))}
      </div>

      {/* Header */}
      <header className="pointer-events-none absolute left-0 right-0 top-0 flex items-start justify-between p-4 pt-16 sm:p-7 sm:pt-16">
        <div>
          <div className="flex items-center gap-2">
            <h1
              className="text-2xl font-black tracking-tight text-white sm:text-4xl"
              style={{ textShadow: "0 3px 0 rgba(0,0,0,0.18)" }}
            >
              VOXEL BUDDIES
            </h1>
            {onBackToPigeon && (
              <button
                type="button"
                onClick={onBackToPigeon}
                className="pointer-events-auto flex items-center gap-1 rounded-full bg-white/20 hover:bg-white/35 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md transition-all active:scale-95"
                title="Kembali ke Pigeon SK8"
              >
                <span>🛹</span>
                <span className="hidden sm:inline">Main Skate</span>
              </button>
            )}
          </div>
          <p className="mt-0.5 text-xs font-semibold text-white/80 sm:text-sm">
            Koleksi skin 3D ala Crossy Road 🎮
          </p>
        </div>
        <div className="rounded-2xl bg-white/25 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md sm:px-4 sm:py-2 sm:text-sm">
          {index + 1} / {SKINS.length}
        </div>
      </header>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        aria-label="Sebelumnya"
        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/30 p-3 text-2xl text-white backdrop-blur-md transition hover:scale-110 hover:bg-white/50 active:scale-95 sm:left-6"
      >
        ◀
      </button>
      <button
        onClick={next}
        aria-label="Berikutnya"
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/30 p-3 text-2xl text-white backdrop-blur-md transition hover:scale-110 hover:bg-white/50 active:scale-95 sm:right-6"
      >
        ▶
      </button>

      {/* Info card */}
      <div className="pointer-events-none absolute bottom-36 left-1/2 w-[92%] max-w-md -translate-x-1/2 sm:bottom-40">
        <div
          key={skin.id}
          className="animate-[fadeUp_0.4s_ease] rounded-3xl bg-white/80 p-4 text-center shadow-xl backdrop-blur-md"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl">{skin.emoji}</span>
            <h2 className="text-2xl font-black tracking-tight text-slate-800">
              {skin.name}
            </h2>
            <span
              className="ml-1 inline-block h-4 w-4 rounded-full ring-2 ring-slate-300"
              style={{ backgroundColor: skin.color }}
            />
          </div>
          <p className="mt-1 text-sm font-medium text-slate-600">{skin.desc}</p>
        </div>
      </div>

      {/* Skin selector */}
      <nav className="absolute bottom-0 left-0 right-0 z-10 pb-4">
        <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SKINS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIndex(i)}
              className={cn(
                "flex min-w-[88px] flex-1 flex-col items-center gap-1 rounded-2xl px-3 py-3 transition-all duration-200",
                i === index
                  ? "-translate-y-2 bg-white shadow-xl"
                  : "bg-white/40 backdrop-blur-md hover:-translate-y-1 hover:bg-white/60"
              )}
            >
              <span className="text-3xl drop-shadow-sm">{s.emoji}</span>
              <span
                className={cn(
                  "text-[11px] font-bold leading-tight",
                  i === index ? "text-slate-800" : "text-slate-700/80"
                )}
              >
                {s.name}
              </span>
              <span
                className="h-1.5 w-8 rounded-full"
                style={{
                  backgroundColor: i === index ? s.color : "transparent",
                }}
              />
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-xs font-semibold text-white/70">
          Drag untuk memutar • Scroll untuk zoom • ◀ ▶ ganti skin
        </p>
      </nav>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
