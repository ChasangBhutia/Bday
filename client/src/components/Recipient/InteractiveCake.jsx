import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, RefreshCw, Flame } from 'lucide-react';
import { soundManager } from '../../utils/soundEffects';

export default function InteractiveCake({ recipientName = 'Sophia' }) {
  const [candlesLit, setCandlesLit] = useState(true);
  const [wishMade, setWishMade] = useState(false);

  const handleBlowCandles = () => {
    if (!candlesLit) return;
    setCandlesLit(false);
    setWishMade(true);

    soundManager.playCandleBlowSound();
    setTimeout(() => {
      soundManager.playCelebrationCheer();
    }, 300);

    // Grand celebratory fireworks / confetti explosion
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f43f5e', '#ec4899', '#f59e0b', '#3b82f6', '#10b981']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f43f5e', '#ec4899', '#f59e0b', '#3b82f6', '#10b981']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  const handleRelight = () => {
    setCandlesLit(true);
    setWishMade(false);
    soundManager.playWaxSealSound();
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center py-6 px-4">
      {/* Title */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-semibold backdrop-blur-md mb-2">
          <Flame className="w-3.5 h-3.5" />
          <span>Interactive Birthday Cake</span>
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
          Make A Wish, {recipientName}! 🎂
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          {candlesLit
            ? 'Click the candles or cake below to blow them out!'
            : '✨ Your wish has been sent to the universe! ✨'}
        </p>
      </div>

      {/* Cake Container */}
      <div
        onClick={handleBlowCandles}
        className="relative cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 flex flex-col items-center select-none"
      >
        {/* --- CANDLES ROW --- */}
        <div className="flex items-end justify-center gap-4 sm:gap-6 z-20 -mb-2">
          {[1, 2, 3].map((candleIndex) => (
            <div key={candleIndex} className="flex flex-col items-center">
              {/* FLAME */}
              <div className="h-6 flex items-end justify-center mb-0.5">
                {candlesLit ? (
                  <div className="relative animate-flame">
                    {/* Flame Core */}
                    <div className="w-3 h-5 bg-gradient-to-t from-orange-500 via-amber-300 to-yellow-100 rounded-full blur-[0.5px] shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
                    {/* Inner blue base */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-80" />
                  </div>
                ) : (
                  /* Smoke puff when blown out */
                  <div className="w-1.5 h-6 bg-slate-400/40 rounded-full blur-[1px] -translate-y-2 opacity-60 transition-all duration-700" />
                )}
              </div>

              {/* WICK */}
              <div className="w-0.5 h-2 bg-slate-800" />

              {/* CANDLE BODY */}
              <div className="w-3 sm:w-3.5 h-10 sm:h-12 rounded-t-sm bg-gradient-to-b from-pink-200 via-pink-400 to-rose-500 shadow-md relative overflow-hidden">
                {/* Spiral stripe */}
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,rgba(255,255,255,0.7)_3px,rgba(255,255,255,0.7)_6px)]" />
              </div>
            </div>
          ))}
        </div>

        {/* --- CAKE TOP TIER --- */}
        <div className="relative w-40 sm:w-48 h-16 rounded-t-2xl bg-gradient-to-r from-rose-400 via-pink-300 to-rose-400 shadow-xl border-t border-white/40 z-10">
          {/* Icing frosting drips */}
          <div className="absolute -bottom-2 inset-x-0 flex justify-around">
            {[1, 2, 3, 4, 5, 6].map((d) => (
              <div
                key={d}
                className="w-4 h-3 bg-white rounded-b-full shadow-sm"
              />
            ))}
          </div>
          {/* Top sprinkles */}
          <div className="absolute inset-x-4 top-2 flex justify-between opacity-80 text-[10px]">
            <span>🍓</span>
            <span>✨</span>
            <span>🍒</span>
            <span>✨</span>
            <span>🍓</span>
          </div>
        </div>

        {/* --- CAKE BOTTOM TIER --- */}
        <div className="relative w-52 sm:w-64 h-20 rounded-b-2xl bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 shadow-2xl border-t-2 border-pink-400 z-0 overflow-hidden">
          {/* Middle cream filling layer */}
          <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-2 bg-rose-400/80" />

          {/* Strawberry decorations */}
          <div className="absolute bottom-2 inset-x-6 flex justify-between items-center text-xs opacity-90">
            <span>🎉</span>
            <span>💖</span>
            <span>⭐</span>
            <span>💖</span>
            <span>🎉</span>
          </div>
        </div>

        {/* --- GOLDEN SERVING PLATTER --- */}
        <div className="w-60 sm:w-72 h-4 rounded-full bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400 shadow-xl -mt-1 border border-yellow-200/60" />

        {/* Table Shadow */}
        <div className="w-56 h-3 bg-black/40 blur-md rounded-full mt-1" />
      </div>

      {/* Action / Feedback */}
      <div className="mt-6 flex flex-col items-center">
        {wishMade ? (
          <div className="flex flex-col items-center gap-3 animate-fade-in">
            <div className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-pink-500/20 border border-amber-300/40 text-amber-200 font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
              <span>Candles Blown! Wish made successfully! 🌟</span>
            </div>
            <button
              onClick={handleRelight}
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Relight candles to make another wish</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleBlowCandles}
            className="px-6 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span>🌬️ Blow Candles</span>
          </button>
        )}
      </div>
    </div>
  );
}
