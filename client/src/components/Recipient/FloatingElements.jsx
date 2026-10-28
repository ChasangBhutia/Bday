import React, { useEffect, useState } from 'react';
import { soundManager } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

const BALLOON_COLORS = [
  'from-pink-500 to-rose-600',
  'from-purple-500 to-indigo-600',
  'from-amber-400 to-orange-500',
  'from-cyan-400 to-blue-600',
  'from-emerald-400 to-teal-600',
  'from-fuchsia-400 to-pink-600'
];

export default function FloatingElements({ enableInteractions = true }) {
  const [balloons, setBalloons] = useState([]);
  const [poppedCount, setPoppedCount] = useState(0);

  useEffect(() => {
    // Generate initial floating balloons
    const initialBalloons = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      left: 5 + (i * 12) + (Math.random() * 4),
      bottom: -10 - (Math.random() * 20),
      size: 40 + Math.random() * 25,
      color: BALLOON_COLORS[i % BALLOON_COLORS.length],
      speed: 12 + Math.random() * 10,
      delay: i * 1.5,
      wobble: Math.random() * 15 - 7.5
    }));
    setBalloons(initialBalloons);
  }, []);

  const handlePop = (e, id) => {
    e.stopPropagation();
    soundManager.playBalloonPopSound();
    
    // Confetti from balloon coordinates
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 25,
      spread: 60,
      origin: { x, y },
      colors: ['#f43f5e', '#ec4899', '#a855f7', '#eab308', '#38bdf8']
    });

    setBalloons(prev => prev.filter(b => b.id !== id));
    setPoppedCount(c => c + 1);

    // Respawn new balloon after delay
    setTimeout(() => {
      setBalloons(prev => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          left: 5 + Math.random() * 90,
          bottom: -15,
          size: 40 + Math.random() * 25,
          color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
          speed: 14 + Math.random() * 8,
          delay: 0,
          wobble: Math.random() * 15 - 7.5
        }
      ]);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {/* Ambient background particle glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-ring" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-2/3 left-1/3 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating balloons */}
      {balloons.map((balloon) => (
        <div
          key={balloon.id}
          onClick={(e) => enableInteractions && handlePop(e, balloon.id)}
          className={`absolute pointer-events-auto cursor-pointer transition-transform hover:scale-110 active:scale-95 group`}
          style={{
            left: `${balloon.left}%`,
            animation: `floatUpwards ${balloon.speed}s linear infinite`,
            animationDelay: `${balloon.delay}s`,
            bottom: `${balloon.bottom}%`
          }}
          title="Click to pop!"
        >
          {/* Balloon Body */}
          <div
            className={`relative rounded-full bg-gradient-to-tr ${balloon.color} shadow-lg shadow-black/30 flex items-center justify-center opacity-85 group-hover:opacity-100`}
            style={{
              width: `${balloon.size}px`,
              height: `${balloon.size * 1.25}px`,
              borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%'
            }}
          >
            {/* Balloon highlight reflection */}
            <div className="absolute top-2 left-2.5 w-2 h-4 bg-white/40 rounded-full -rotate-45 blur-[0.5px]" />
            {/* Knot at bottom */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-1.5 bg-rose-700/80 rounded-sm" />
            {/* String */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-[1px] h-12 bg-white/30" />
          </div>
        </div>
      ))}

      <style>{`
        @keyframes floatUpwards {
          0% {
            transform: translateY(110vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.85;
          }
          90% {
            opacity: 0.85;
          }
          100% {
            transform: translateY(-20vh) rotate(8deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
