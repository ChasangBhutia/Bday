import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, PartyPopper, Music, ArrowDown, Share2, PlusCircle, Volume2, Calendar } from 'lucide-react';
import FloatingElements from './FloatingElements';
import InteractiveGift from './InteractiveGift';
import EnvelopeLetter from './EnvelopeLetter';
import InteractiveCake from './InteractiveCake';
import PhotoGallery from './PhotoGallery';
import WishesWall from './WishesWall';
import AudioPlayerWidget from './AudioPlayerWidget';
import { soundManager } from '../../utils/soundEffects';
import { formatCelebrationDate } from '../../utils/defaultCelebration';

export default function CelebrationView({ celebrationData, onBackToBuilder }) {
  const [giftOpened, setGiftOpened] = useState(false);
  const [letterOpened, setLetterOpened] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const letterSectionRef = useRef(null);

  const recipientName = celebrationData?.recipientName || 'Sophia';
  const senderName = celebrationData?.senderName || 'Your Loved Ones';
  const milestone = celebrationData?.milestone || '';
  const date = celebrationData?.date || '';
  const message = celebrationData?.message || '';
  const envelopeStyle = celebrationData?.envelopeStyle || 'rose-velvet';
  const giftStyle = celebrationData?.giftStyle || 'crimson-gold';
  const images = celebrationData?.images || [];
  const video = celebrationData?.video || null;
  const wishes = celebrationData?.wishes || [];
  const musicData = celebrationData?.music || null;

  // Cleanup music and ensure top scroll when mounting view
  useEffect(() => {
    window.scrollTo(0, 0);
    return () => {
      soundManager.stopMusic();
    };
  }, []);

  // When gift is unboxed
  const handleGiftOpened = () => {
    setGiftOpened(true);
  };

  const scrollToLetter = () => {
    if (letterSectionRef.current) {
      letterSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // When letter is torn and opened: START MUSIC!
  const handleLetterOpened = () => {
    setLetterOpened(true);
    soundManager.playBirthdayMusic(musicData);
    setIsPlayingMusic(true);
  };

  const handleTogglePlay = () => {
    const playing = soundManager.togglePlayPause(musicData);
    setIsPlayingMusic(playing);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden selection:bg-pink-500 selection:text-white pb-24">
      {/* Interactive floating balloons & ambient glow in background */}
      <FloatingElements enableInteractions={true} />

      {/* Top Navbar */}
      <header className="relative z-30 border-b border-white/10 glass-panel py-3 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-amber-400 flex items-center justify-center text-sm shadow-md shadow-pink-500/20">
            🎁
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-1.5">
              <span>Happy Birthday, {recipientName}!</span>
              {milestone && <span className="text-pink-400 text-xs">({milestone})</span>}
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">An interactive surprise crafted with love</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onBackToBuilder && (
            <button
              onClick={onBackToBuilder}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/40 text-pink-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Make Your Own Surprise</span>
              <span className="sm:hidden">Create</span>
            </button>
          )}
        </div>
      </header>

      {/* Hero Welcome Stage */}
      <main className="relative z-20 max-w-5xl mx-auto px-4 pt-8 sm:pt-14 text-center">
        {/* Animated Celebration Badge */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-amber-500/20 border border-pink-400/30 text-pink-200 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-md shadow-lg shadow-pink-500/10 animate-float-gentle">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>It's Your Special Day! 🌟</span>
          </div>

          {date && (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-pink-500/30 text-amber-200 text-xs font-semibold backdrop-blur-md shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-pink-400" />
              <span>{formatCelebrationDate(date)}</span>
            </div>
          )}
        </div>

        <h1 className="text-3xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-rose-100 to-amber-200 tracking-tight leading-tight sm:leading-tight">
          Happy {milestone ? `${milestone} ` : ''}Birthday, <br className="sm:hidden" />
          <span className="font-handwriting text-4xl sm:text-7xl text-pink-400 ml-1">
            {recipientName}!
          </span>
        </h1>

        <p className="max-w-xl mx-auto text-sm sm:text-lg text-slate-300 mt-4 leading-relaxed font-light">
          A personalized celebration crafted specially for you by <strong className="text-amber-300 font-semibold">{senderName}</strong>.
          Step inside to unwrap your presents and memories!
        </p>

        {/* STEP 1: INTERACTIVE 3D GIFT BOX */}
        <section className="mt-8 mb-12">
          <InteractiveGift
            giftStyle={giftStyle}
            giftItem={celebrationData?.giftItem}
            recipientName={recipientName}
            senderName={senderName}
            onOpen={handleGiftOpened}
            onProceedToLetter={scrollToLetter}
          />
        </section>

        {/* STEP 2: THE LIFAFA & LETTER TEARING ANIMATION */}
        <section ref={letterSectionRef} className="py-6 scroll-mt-12">
          <EnvelopeLetter
            envelopeStyle={envelopeStyle}
            recipientName={recipientName}
            senderName={senderName}
            milestone={milestone}
            date={date}
            message={message}
            hasMusic={!!musicData}
            onLetterOpened={handleLetterOpened}
          />
        </section>

        {/* STEP 3: INTERACTIVE BIRTHDAY CAKE */}
        <section className="py-12 border-t border-white/10 mt-10">
          <InteractiveCake recipientName={recipientName} />
        </section>

        {/* STEP 4: MEMORIES GALLERY (POLAROID PHOTOS & VIDEO) */}
        {(images.length > 0 || (video && video.url)) && (
          <section className="py-12 border-t border-white/10">
            <PhotoGallery
              images={images}
              video={video}
              recipientName={recipientName}
            />
          </section>
        )}

        {/* STEP 5: WISHES WALL */}
        <section className="py-12 border-t border-white/10">
          <WishesWall
            wishes={wishes}
            recipientName={recipientName}
          />
        </section>

        {/* Footer Celebration Closing */}
        <footer className="mt-16 pt-8 border-t border-white/10 pb-8 text-center">
          <div className="inline-flex items-center gap-2 text-pink-300 font-handwriting text-2xl sm:text-3xl font-bold">
            <Heart className="w-6 h-6 fill-rose-500 text-rose-500 animate-pulse" />
            <span>Celebrating You Today & Everyday!</span>
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Created with the Birthday Surprise Portal • Share the love 💖
          </p>
        </footer>
      </main>

      {/* Floating Music Player Widget */}
      <AudioPlayerWidget
        musicData={musicData}
        isPlaying={isPlayingMusic}
        onTogglePlay={handleTogglePlay}
      />
    </div>
  );
}
