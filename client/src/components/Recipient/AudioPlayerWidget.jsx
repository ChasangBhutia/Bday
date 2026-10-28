import React, { useState, useEffect } from 'react';
import { Disc3, Volume2, VolumeX, Play, Pause, Music } from 'lucide-react';
import { soundManager } from '../../utils/soundEffects';

export default function AudioPlayerWidget({ musicData, isPlaying, onTogglePlay }) {
  const [isMuted, setIsMuted] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [volume, setVolumeState] = useState(0.8);

  const trackName = musicData?.name || 'Celestial Birthday Melody';

  const handleToggleMute = (e) => {
    e.stopPropagation();
    if (isMuted) {
      soundManager.setVolume(volume || 0.8);
      setIsMuted(false);
    } else {
      soundManager.setVolume(0);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolumeState(val);
    if (val === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
    soundManager.setVolume(val);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 select-none">
      {/* Expanded Volume slider popup on hover */}
      {showVolume && (
        <div className="glass-panel px-3 py-2 rounded-xl flex items-center gap-2 border border-pink-500/30 shadow-xl animate-fade-in">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 accent-pink-500 cursor-pointer h-1.5 rounded-lg bg-slate-700"
          />
        </div>
      )}

      {/* Main Music Pill Player */}
      <div
        onMouseEnter={() => setShowVolume(true)}
        onMouseLeave={() => setShowVolume(false)}
        className="glass-panel hover:bg-slate-900/90 rounded-full px-3.5 py-2 flex items-center gap-2.5 border border-pink-500/30 shadow-2xl shadow-pink-500/10 backdrop-blur-xl transition-all duration-300"
      >
        {/* Spinning Vinyl Record */}
        <div
          onClick={onTogglePlay}
          className="relative cursor-pointer group flex items-center justify-center"
          title={isPlaying ? 'Pause Music' : 'Play Music'}
        >
          <div
            className={`w-9 h-9 rounded-full bg-slate-950 border-2 border-pink-400/80 flex items-center justify-center shadow-md ${
              isPlaying ? 'animate-spin-slow' : ''
            }`}
          >
            {/* Vinyl grooves */}
            <div className="w-6 h-6 rounded-full border border-pink-500/30 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-pink-500 to-amber-400 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-black" />
              </div>
            </div>
          </div>

          {/* Center Play/Pause hover icon */}
          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </div>
        </div>

        {/* Track info & Animated Equalizer Waves */}
        <div className="flex flex-col cursor-pointer" onClick={onTogglePlay}>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-white tracking-wide max-w-[130px] sm:max-w-[170px] truncate">
              {trackName}
            </span>
          </div>

          {/* Equalizer Bars */}
          <div className="flex items-end gap-0.5 h-3 mt-0.5">
            {[1, 2, 3, 4, 5].map((bar) => (
              <span
                key={bar}
                className={`w-1 bg-gradient-to-t from-pink-500 to-amber-300 rounded-full transition-all duration-300 ${
                  isPlaying ? 'animate-pulse' : 'h-1 opacity-40'
                }`}
                style={{
                  height: isPlaying ? `${Math.max(4, (bar * 5) % 12 + 2)}px` : '3px',
                  animationDelay: `${bar * 0.15}s`
                }}
              />
            ))}
            <span className="text-[9px] text-pink-300/80 ml-1 font-semibold uppercase">
              {isPlaying ? 'Playing' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Mute / Unmute Button */}
        <button
          onClick={handleToggleMute}
          className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-pink-300" />
          )}
        </button>
      </div>
    </div>
  );
}
