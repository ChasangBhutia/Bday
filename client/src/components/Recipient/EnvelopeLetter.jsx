import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Mail, Sparkles, Heart, Music, Check, Volume2 } from 'lucide-react';
import { soundManager } from '../../utils/soundEffects';
import { ENVELOPE_THEMES } from '../../utils/defaultCelebration';

export default function EnvelopeLetter({
  envelopeStyle = 'rose-velvet',
  recipientName = 'Sophia',
  senderName = 'Someone who loves you',
  message = '',
  milestone = '',
  onLetterOpened,
  hasMusic = false
}) {
  // states: 'sealed' | 'tearing' | 'extracting' | 'unfolded'
  const [stage, setStage] = useState('sealed');
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  const theme = ENVELOPE_THEMES[envelopeStyle] || ENVELOPE_THEMES['rose-velvet'];

  const handleTearAndOpen = () => {
    if (stage !== 'sealed') return;

    // 1. Start Tearing animation
    setStage('tearing');
    soundManager.playWaxSealSound();
    soundManager.playPaperTearSound();

    // Subtle paper confetti snippet burst
    confetti({
      particleCount: 35,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#fef08a', '#fbcfe8', '#ffffff', '#fed7aa'],
      ticks: 120,
      gravity: 1.2,
      scalar: 0.7
    });

    // 2. Extract letter out of envelope
    setTimeout(() => {
      setStage('extracting');
    }, 800);

    // 3. Fully unfold the letter and trigger music!
    setTimeout(() => {
      setStage('unfolded');
      soundManager.playCelebrationCheer();
      setIsPlayingMusic(true);
      if (onLetterOpened) {
        onLetterOpened();
      }
    }, 1800);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center my-6">
      {/* ========================================================
          STAGE 1 & 2: THE LIFAFA (ENVELOPE) WITH TEARING ANIMATION
          ======================================================== */}
      {stage !== 'unfolded' && (
        <div className="relative flex flex-col items-center">
          {/* Header prompt */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-500/15 border border-pink-400/30 text-pink-300 text-xs sm:text-sm font-medium backdrop-blur-md mb-2">
              <Mail className="w-3.5 h-3.5" />
              <span>A Personal Letter for You</span>
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-rose-100 to-amber-100">
              The Birthday Lifafa 💌
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Press the button below to tear open the envelope
            </p>
          </div>

          {/* 3D Envelope Container */}
          <div
            className="relative w-[320px] sm:w-[420px] h-[220px] sm:h-[260px] perspective-1000 select-none"
          >
            {/* Ambient Shadow under Envelope */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-black/50 blur-xl rounded-full" />

            {/* --- ENVELOPE BODY --- */}
            <div
              className={`relative w-full h-full rounded-2xl bg-gradient-to-br ${theme.exterior} shadow-2xl overflow-hidden border border-white/20`}
            >
              {/* Envelope Inner Pocket Lining */}
              <div className={`absolute inset-3 rounded-xl ${theme.interior} shadow-inner flex items-center justify-center`}>
                <div className="text-white/10 font-serif-royal text-6xl select-none">✨</div>
              </div>

              {/* --- LETTER SLIDING OUT ANIMATION --- */}
              <div
                className={`absolute inset-x-6 bottom-4 h-48 bg-amber-50 rounded-lg shadow-xl border border-amber-200/60 p-4 transition-all duration-1000 ease-in-out ${
                  stage === 'extracting'
                    ? '-translate-y-48 scale-105 opacity-100 z-40'
                    : stage === 'tearing'
                    ? '-translate-y-4 opacity-90 z-20'
                    : 'translate-y-0 opacity-40 z-10'
                }`}
              >
                {/* Peek at letter preview lines */}
                <div className="flex items-center justify-between border-b border-amber-300/40 pb-1 mb-2">
                  <span className="text-[10px] font-serif text-amber-800 tracking-wider">CONFIDENTIAL BIRTHDAY WISH</span>
                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                </div>
                <div className="space-y-1.5 opacity-60">
                  <div className="w-2/3 h-2 bg-amber-200 rounded" />
                  <div className="w-full h-2 bg-amber-200/80 rounded" />
                  <div className="w-4/5 h-2 bg-amber-200/70 rounded" />
                </div>
              </div>

              {/* Envelope Bottom & Side Triangular Folds */}
              <div className="absolute inset-0 pointer-events-none z-30">
                {/* Left Flap */}
                <div
                  className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-tr from-black/20 to-transparent"
                  style={{
                    clipPath: 'polygon(0 0, 0 100%, 50% 50%)'
                  }}
                />
                {/* Right Flap */}
                <div
                  className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-black/25 to-transparent"
                  style={{
                    clipPath: 'polygon(100% 0, 100% 100%, 50% 50%)'
                  }}
                />
                {/* Bottom Triangular Pocket Flap */}
                <div
                  className="absolute bottom-0 inset-x-0 h-full bg-gradient-to-t from-black/30 via-white/5 to-transparent border-b border-white/10"
                  style={{
                    clipPath: 'polygon(0 100%, 100% 100%, 50% 48%)'
                  }}
                />
              </div>

              {/* --- TOP FLAP (With Perforation / Tear Animation) --- */}
              <div
                className={`absolute top-0 inset-x-0 h-32 sm:h-36 z-40 origin-top transition-all duration-700 ${
                  stage === 'tearing' || stage === 'extracting'
                    ? 'animate-[tearTop_0.85s_forwards]'
                    : ''
                }`}
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  background: `linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.2) 100%), var(--tw-gradient-stops)`
                }}
              >
                {/* Perforated Tear Line Guide */}
                <div className="absolute top-10 inset-x-4 border-b border-dashed border-white/40 flex items-center justify-between px-2 text-[9px] text-white/50">
                  <span>✂️ tear</span>
                  <span className="tracking-widest">············</span>
                  <span>✂️</span>
                </div>
              </div>

              {/* --- WAX SEAL (Embossed on center) --- */}
              <div
                className={`absolute top-[78px] sm:top-[92px] left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
                  stage === 'tearing' || stage === 'extracting'
                    ? 'scale-0 opacity-0 rotate-45 translate-y-8'
                    : 'scale-100 opacity-100 hover:scale-110'
                }`}
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${theme.waxColor} shadow-xl border-2 flex items-center justify-center cursor-pointer`}
                >
                  {/* Wax rim detail */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-black/20 flex items-center justify-center bg-black/10 shadow-inner">
                    <span className="text-white text-base sm:text-lg font-bold font-serif-royal drop-shadow">
                      {theme.sealText || '💌'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recipient Gold Calligraphy on Lifafa */}
              <div className="absolute bottom-4 left-6 z-40 text-left pointer-events-none">
                <p className="text-[10px] text-pink-200/70 uppercase tracking-widest font-medium">To My Dearest</p>
                <p className="font-handwriting text-2xl sm:text-3xl text-amber-100 font-bold drop-shadow-md">
                  {recipientName} {milestone && <span className="text-sm font-sans font-normal opacity-80">({milestone})</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Action Button: "Tear Open The Letter" */}
          <div className="mt-8">
            <button
              onClick={handleTearAndOpen}
              disabled={stage !== 'sealed'}
              className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              <Mail className="w-5 h-5 transition-transform group-hover:-translate-y-0.5 group-hover:rotate-12" />
              <span>{stage === 'sealed' ? 'Tear Open The Letter 💌' : 'Opening your letter...'}</span>
              <Sparkles className="w-4 h-4 text-yellow-200 animate-pulse" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          STAGE 3: THE UNFOLDED LETTER (ELEGANT PARCHMENT PAPER)
          ======================================================== */}
      {stage === 'unfolded' && (
        <div className="w-full max-w-2xl px-4 animate-[letterSlideOut_0.8s_ease-out]">
          {/* Letter parchment container */}
          <div className="relative parchment-paper rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-slate-800 shadow-2xl border-4 border-amber-900/10 overflow-hidden">
            {/* Vintage decorative corners */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-800/40" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-800/40" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-800/40" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-800/40" />

            {/* Subtle vintage watermark background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
              <span className="font-serif-royal text-9xl">🎂</span>
            </div>

            {/* Music banner if playing */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-amber-900/15">
              <div className="flex items-center gap-2 text-rose-700 text-xs sm:text-sm font-semibold tracking-wide">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Happy Birthday Celebration</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-800 text-xs font-medium">
                <Music className="w-3.5 h-3.5 animate-spin-slow text-rose-600" />
                <span>Birthday Melody Playing 🎵</span>
              </div>
            </div>

            {/* Letter Header */}
            <div className="text-center mb-6 pb-2 border-b border-amber-900/10">
              <span className="text-xs font-serif-royal text-amber-900/70 uppercase tracking-widest block mb-1">
                A Letter For
              </span>
              <h2 className="font-handwriting text-3xl sm:text-4xl font-bold text-rose-950">
                {recipientName} {milestone ? `(${milestone} Birthday)` : ''} ✨
              </h2>
            </div>

            {/* Letter Body Content */}
            <div className="font-handwriting text-xl sm:text-2xl text-slate-800 leading-relaxed sm:leading-loose whitespace-pre-wrap font-semibold tracking-wide">
              {message || `Happy Birthday! Wishing you a day filled with magic, happiness, and unforgettable moments!`}
            </div>

            {/* Signature & Seal Sign-off */}
            <div className="mt-10 pt-6 border-t border-amber-900/20 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div>
                <p className="font-casual text-lg sm:text-xl text-amber-950 font-bold">
                  Forever and always,
                </p>
                <p className="font-handwriting text-3xl sm:text-4xl text-rose-900 font-bold mt-1">
                  {senderName}
                </p>
              </div>

              {/* Realistic stamped wax seal mark at bottom */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-700 via-red-800 to-rose-950 shadow-md border-2 border-amber-300 flex items-center justify-center text-amber-200">
                  <Heart className="w-6 h-6 fill-amber-200" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-serif uppercase tracking-widest text-amber-900/80 font-bold">
                    Sealed with Love
                  </div>
                  <div className="text-[10px] text-amber-800/60 font-sans">
                    {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>

            {/* Re-fold option */}
            <div className="mt-8 text-center pt-4 border-t border-amber-900/10">
              <button
                onClick={() => setStage('sealed')}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-900/10 hover:bg-amber-900/20 text-amber-900 text-xs font-semibold cursor-pointer transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Fold Letter Back Into Envelope</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
