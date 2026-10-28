import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, Smile, PartyPopper } from 'lucide-react';
import { soundManager } from '../../utils/soundEffects';

export default function WishesWall({ wishes = [], recipientName = 'Sophia' }) {
  const [unlockedWishes, setUnlockedWishes] = useState({});

  const defaultWishes = wishes && wishes.length > 0 ? wishes : [
    'You make every room brighter with your presence! ✨',
    'Cheers to another year of legendary memories and laughter! 🥂',
    'May all your biggest dreams and quiet wishes take flight! 🚀',
    'You deserve all the sweetness and joy in the entire world! 🍰',
    'A truly one-of-a-kind human being! Keep inspiring everyone around you 💖',
    'Here’s to another 365 days of magic and wonder! 🌟'
  ];

  const handleReveal = (index) => {
    if (unlockedWishes[index]) return;

    soundManager.playGiftPopSound();
    confetti({
      particleCount: 20,
      spread: 50,
      origin: { y: 0.7 }
    });

    setUnlockedWishes(prev => ({ ...prev, [index]: true }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-300 text-xs font-semibold backdrop-blur-md mb-2">
          <PartyPopper className="w-3.5 h-3.5" />
          <span>Surprise Wishes</span>
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
          Tap To Reveal Birthday Wishes 🎁
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Each card holds a secret wish written for {recipientName}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {defaultWishes.map((wish, index) => {
          const isRevealed = !!unlockedWishes[index];

          return (
            <div
              key={index}
              onClick={() => handleReveal(index)}
              className={`relative min-h-[120px] rounded-2xl p-5 border transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center select-none ${
                isRevealed
                  ? 'bg-gradient-to-br from-pink-950/40 via-purple-900/30 to-slate-900/70 border-pink-400/30 shadow-lg shadow-pink-500/10'
                  : 'bg-slate-900/60 border-white/10 hover:border-pink-500/40 hover:scale-102 hover:bg-slate-800/60 shadow-md'
              }`}
            >
              {isRevealed ? (
                <div className="animate-fade-in flex flex-col items-center">
                  <div className="text-2xl mb-2">✨</div>
                  <p className="text-slate-100 font-medium text-sm sm:text-base leading-snug">
                    "{wish}"
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-pink-400 font-semibold">
                    <Heart className="w-3 h-3 fill-pink-400" />
                    <span>Unlocked with love</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-pink-500/20 border border-pink-400/30 flex items-center justify-center text-pink-300 text-lg group-hover:scale-110 transition-transform">
                    🎁
                  </div>
                  <span className="text-xs font-semibold text-slate-300">
                    Wish #{index + 1}
                  </span>
                  <span className="text-[10px] text-pink-400/80 font-medium">
                    Tap to open
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
