import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Gift, Heart, Award, Cake, Ticket, Gem, X, ArrowDown, ChevronRight } from 'lucide-react';
import { soundManager } from '../../utils/soundEffects';
import { GIFT_THEMES, GIFT_ITEMS } from '../../utils/defaultCelebration';

export default function InteractiveGift({
  giftStyle = 'crimson-gold',
  giftItem = null,
  recipientName = 'Sophia',
  senderName = 'Someone Special',
  onOpen,
  onProceedToLetter
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasInteractedWithGift, setHasInteractedWithGift] = useState(false);

  const theme = GIFT_THEMES[giftStyle] || GIFT_THEMES['crimson-gold'];
  const activeGiftKey = giftItem?.type || 'teddy';
  const defaultMeta = GIFT_ITEMS[activeGiftKey] || GIFT_ITEMS.teddy;

  const currentGift = {
    type: activeGiftKey,
    name: giftItem?.name || defaultMeta.name,
    message: giftItem?.message || defaultMeta.defaultMessage,
    badge: giftItem?.badge || defaultMeta.badge,
    title: defaultMeta.title
  };

  const handleOpenGift = () => {
    if (isOpen) {
      // If already open, tapping the gift opens the personalized gift note modal
      handleInspectGift();
      return;
    }

    setIsOpen(true);
    soundManager.playGiftPopSound();
    setTimeout(() => {
      soundManager.playCelebrationCheer();
    }, 250);

    // Multistage celebratory confetti burst
    const count = 220;
    const defaults = {
      origin: { y: 0.62 }
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#ff718d', '#fdbb2d', '#22c1c3']
    });
    fire(0.2, {
      spread: 60,
      colors: ['#ffd700', '#ff69b4', '#00ffff']
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.9
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 30,
      decay: 0.92,
      scalar: 1.2
    });
    fire(0.1, {
      spread: 130,
      startVelocity: 45
    });

    if (onOpen) {
      onOpen();
    }
  };

  const handleInspectGift = (e) => {
    if (e) e.stopPropagation();
    soundManager.playCelebrationCheer();
    setIsModalOpen(true);
    setHasInteractedWithGift(true);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.5 }
    });
  };

  // Render the animated physical gift SVG inside/above the box
  const renderGiftGraphic = (size = 'normal') => {
    const isBig = size === 'large';
    const svgSize = isBig ? 190 : 130;

    switch (currentGift.type) {
      case 'trophy':
        return (
          <div className="relative flex items-center justify-center filter drop-shadow-[0_10px_20px_rgba(234,179,8,0.45)]">
            <svg width={svgSize} height={svgSize} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="35%" stopColor="#facc15" />
                  <stop offset="70%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#ca8a04" />
                </linearGradient>
                <linearGradient id="goldHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="marblePedestal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>

              {/* Pedestal Base */}
              <rect x="42" y="125" width="76" height="22" rx="4" fill="url(#marblePedestal)" stroke="#facc15" strokeWidth="2" />
              <rect x="50" y="117" width="60" height="9" rx="2" fill="url(#goldGrad)" />
              <text x="80" y="140" fill="#fef08a" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="1">
                #1 BEST PERSON
              </text>

              {/* Stem */}
              <path d="M72 100 H88 V118 H72 Z" fill="url(#goldGrad)" />
              <ellipse cx="80" cy="100" rx="14" ry="4" fill="#ca8a04" />

              {/* Trophy Cup Body */}
              <path d="M48 35 C48 85, 112 85, 112 35 Z" fill="url(#goldGrad)" stroke="#fef08a" strokeWidth="2" />
              {/* Cup Rim */}
              <ellipse cx="80" cy="35" rx="32" ry="7" fill="url(#goldGrad)" stroke="#fef08a" strokeWidth="2" />
              <ellipse cx="80" cy="35" rx="26" ry="4" fill="#a16207" />

              {/* Handles */}
              <path d="M48 42 C24 42, 24 75, 54 75" fill="none" stroke="url(#goldGrad)" strokeWidth="6" strokeLinecap="round" />
              <path d="M112 42 C136 42, 136 75, 106 75" fill="none" stroke="url(#goldGrad)" strokeWidth="6" strokeLinecap="round" />

              {/* Specular Highlight */}
              <path d="M56 42 C56 70, 75 76, 75 76 C65 72, 60 55, 60 42 Z" fill="url(#goldHighlight)" />

              {/* Embossed Star */}
              <polygon points="80,48 83,57 93,57 85,63 88,72 80,66 72,72 75,63 67,57 77,57" fill="#ffffff" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))" />

              {/* Floating Crown on Top */}
              <path d="M68 20 L73 26 L80 18 L87 26 L92 20 L90 28 L70 28 Z" fill="#facc15" stroke="#ffffff" strokeWidth="1" />
              <circle cx="68" cy="19" r="2" fill="#ef4444" />
              <circle cx="80" cy="17" r="2.5" fill="#38bdf8" />
              <circle cx="92" cy="19" r="2" fill="#a855f7" />
            </svg>
          </div>
        );

      case 'cake':
        return (
          <div className="relative flex items-center justify-center filter drop-shadow-[0_10px_25px_rgba(244,63,94,0.45)]">
            <svg width={svgSize} height={svgSize} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="cakeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#be123c" />
                </linearGradient>
                <linearGradient id="frostingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#fce7f3" />
                </linearGradient>
              </defs>

              {/* Platter */}
              <ellipse cx="80" cy="140" rx="60" ry="10" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
              <ellipse cx="80" cy="138" rx="55" ry="8" fill="#f8fafc" />

              {/* Bottom Tier */}
              <rect x="36" y="95" width="88" height="40" rx="6" fill="url(#cakeGrad)" />
              {/* Dripping Glaze */}
              <path d="M36 96 C42 108, 48 96, 54 104 C60 112, 66 98, 72 108 C78 116, 84 96, 90 106 C96 114, 102 96, 108 108 C114 116, 120 96, 124 96 L124 90 L36 90 Z" fill="url(#frostingGrad)" />
              <ellipse cx="80" cy="94" rx="44" ry="8" fill="url(#frostingGrad)" />

              {/* Top Tier */}
              <rect x="52" y="62" width="56" height="32" rx="4" fill="url(#cakeGrad)" />
              <path d="M52 64 C56 72, 60 64, 66 70 C72 76, 76 64, 82 72 C88 78, 92 64, 98 72 C104 78, 108 64, 108 64 L108 58 L52 58 Z" fill="url(#frostingGrad)" />
              <ellipse cx="80" cy="62" rx="28" ry="6" fill="url(#frostingGrad)" />

              {/* Strawberries */}
              <circle cx="62" cy="58" r="5" fill="#dc2626" />
              <circle cx="80" cy="56" r="5.5" fill="#dc2626" />
              <circle cx="98" cy="58" r="5" fill="#dc2626" />

              {/* Candles */}
              <rect x="66" y="34" width="4" height="22" rx="2" fill="#38bdf8" />
              <rect x="78" y="30" width="4" height="26" rx="2" fill="#facc15" />
              <rect x="90" y="34" width="4" height="22" rx="2" fill="#ec4899" />

              {/* Flames with animated aura */}
              <ellipse cx="68" cy="27" rx="3.5" ry="6" fill="#f97316" className="animate-pulse" />
              <ellipse cx="68" cy="28" rx="2" ry="3.5" fill="#fef08a" />

              <ellipse cx="80" cy="23" rx="4" ry="7" fill="#f97316" className="animate-pulse" />
              <ellipse cx="80" cy="24" rx="2.5" ry="4" fill="#fef08a" />

              <ellipse cx="92" cy="27" rx="3.5" ry="6" fill="#f97316" className="animate-pulse" />
              <ellipse cx="92" cy="28" rx="2" ry="3.5" fill="#fef08a" />
            </svg>
          </div>
        );

      case 'jewel':
        return (
          <div className="relative flex items-center justify-center filter drop-shadow-[0_10px_25px_rgba(56,189,248,0.5)]">
            <svg width={svgSize} height={svgSize} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="30%" stopColor="#e0f2fe" />
                  <stop offset="60%" stopColor="#7dd3fc" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
                <linearGradient id="velvetBox" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e1b4b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
              </defs>

              {/* Velvet Ring Box Opened */}
              <ellipse cx="80" cy="128" rx="55" ry="16" fill="url(#velvetBox)" stroke="#facc15" strokeWidth="2" />
              <ellipse cx="80" cy="126" rx="46" ry="11" fill="#312e81" />
              {/* Satin Cushion Slot */}
              <ellipse cx="80" cy="124" rx="34" ry="7" fill="#1e1b4b" />

              {/* Diamond Prismatic Crown */}
              <polygon points="52,65 108,65 125,82 80,126 35,82" fill="url(#diamondGrad)" stroke="#ffffff" strokeWidth="2" />
              {/* Table Facet */}
              <polygon points="62,65 98,65 108,82 52,82" fill="#ffffff" fillOpacity="0.8" />
              {/* Side Facets */}
              <polygon points="52,65 62,65 52,82 35,82" fill="#38bdf8" fillOpacity="0.7" />
              <polygon points="98,65 108,65 125,82 108,82" fill="#0284c7" fillOpacity="0.6" />
              {/* Lower Facets */}
              <polygon points="52,82 108,82 80,126" fill="#0284c7" fillOpacity="0.85" />
              <polygon points="35,82 52,82 80,126" fill="#38bdf8" fillOpacity="0.6" />
              <polygon points="108,82 125,82 80,126" fill="#0369a1" fillOpacity="0.9" />

              {/* Center Specular Glint */}
              <polygon points="80,72 83,79 90,82 83,85 80,92 77,85 70,82 77,79" fill="#ffffff" className="animate-spin-slow origin-center" />
              <polygon points="50,60 52,65 57,67 52,69 50,74 48,69 43,67 48,65" fill="#fef08a" />
              <polygon points="115,70 117,75 122,77 117,79 115,84 113,79 108,77 113,75" fill="#fef08a" />
            </svg>
          </div>
        );

      case 'pass':
        return (
          <div className="relative flex items-center justify-center filter drop-shadow-[0_10px_25px_rgba(251,191,36,0.5)]">
            <svg width={svgSize} height={svgSize} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="ticketGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="40%" stopColor="#facc15" />
                  <stop offset="70%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
              </defs>

              {/* Ticket Body tilted */}
              <g transform="rotate(-6 80 80)">
                <rect x="25" y="45" width="110" height="70" rx="8" fill="url(#ticketGold)" stroke="#ffffff" strokeWidth="2" />
                <rect x="30" y="50" width="100" height="60" rx="5" fill="#78350f" fillOpacity="0.15" stroke="#fef08a" strokeWidth="1" strokeDasharray="3 3" />

                {/* Perforations */}
                <circle cx="25" cy="80" r="7" fill="#0f172a" />
                <circle cx="135" cy="80" r="7" fill="#0f172a" />

                {/* VIP Badge */}
                <rect x="42" y="58" width="76" height="18" rx="4" fill="#1e293b" />
                <text x="80" y="71" fill="#facc15" fontSize="10" fontWeight="900" textAnchor="middle" letterSpacing="2">
                  ★ VIP PASS ★
                </text>

                {/* Subtext */}
                <text x="80" y="87" fill="#fef3c7" fontSize="8" fontWeight="bold" textAnchor="middle">
                  UNLIMITED BIRTHDAY WISHES
                </text>
                <text x="80" y="99" fill="#fef08a" fontSize="6.5" textAnchor="middle">
                  ADMIT ONE • ZERO EXPIRATION
                </text>
              </g>
            </svg>
          </div>
        );

      case 'teddy':
      default:
        return (
          <div className="relative flex items-center justify-center filter drop-shadow-[0_12px_24px_rgba(244,63,94,0.4)]">
            <svg width={svgSize} height={svgSize} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="bearFur" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="50%" stopColor="#b45309" />
                  <stop offset="100%" stopColor="#92400e" />
                </linearGradient>
                <linearGradient id="innerEar" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#fbcfe8" />
                  <stop offset="100%" stopColor="#f472b6" />
                </linearGradient>
                <linearGradient id="heartRed" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff4d6d" />
                  <stop offset="100%" stopColor="#c9184a" />
                </linearGradient>
                <linearGradient id="hatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>

              {/* Ears */}
              <circle cx="48" cy="52" r="16" fill="url(#bearFur)" stroke="#78350f" strokeWidth="1.5" />
              <circle cx="48" cy="52" r="9" fill="url(#innerEar)" />

              <circle cx="112" cy="52" r="16" fill="url(#bearFur)" stroke="#78350f" strokeWidth="1.5" />
              <circle cx="112" cy="52" r="9" fill="url(#innerEar)" />

              {/* Head */}
              <ellipse cx="80" cy="74" rx="36" ry="32" fill="url(#bearFur)" stroke="#78350f" strokeWidth="1.5" />

              {/* Party Hat */}
              <polygon points="80,18 64,48 96,48" fill="url(#hatGrad)" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="68" y1="40" x2="88" y2="28" stroke="#fef08a" strokeWidth="2" />
              <line x1="72" y1="46" x2="94" y2="34" stroke="#ffffff" strokeWidth="2" />
              {/* Hat Pompom */}
              <circle cx="80" cy="18" r="5" fill="#facc15" stroke="#ffffff" strokeWidth="1" />

              {/* Snout */}
              <ellipse cx="80" cy="84" rx="16" ry="12" fill="#fef3c7" stroke="#b45309" strokeWidth="1" />
              {/* Nose */}
              <ellipse cx="80" cy="78" rx="6" ry="4" fill="#1e1b4b" />
              {/* Smiling mouth */}
              <path d="M75 84 Q80 89 85 84" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" fill="none" />
              <line x1="80" y1="81" x2="80" y2="85" stroke="#1e1b4b" strokeWidth="1.5" />

              {/* Blushing Cheeks */}
              <circle cx="58" cy="82" r="6" fill="#fb7185" fillOpacity="0.6" filter="blur(1px)" />
              <circle cx="102" cy="82" r="6" fill="#fb7185" fillOpacity="0.6" filter="blur(1px)" />

              {/* Eyes with gleams */}
              <circle cx="66" cy="68" r="4.5" fill="#0f172a" />
              <circle cx="64.5" cy="66.5" r="1.5" fill="#ffffff" />

              <circle cx="94" cy="68" r="4.5" fill="#0f172a" />
              <circle cx="92.5" cy="66.5" r="1.5" fill="#ffffff" />

              {/* Body */}
              <ellipse cx="80" cy="120" rx="30" ry="24" fill="url(#bearFur)" stroke="#78350f" strokeWidth="1.5" />

              {/* Big Pulsing Heart in Paws */}
              <g className="animate-pulse origin-center">
                <path
                  d="M80 102 C75 92 60 92 60 106 C60 119 80 132 80 132 C80 132 100 119 100 106 C100 92 85 92 80 102 Z"
                  fill="url(#heartRed)"
                  stroke="#ffffff"
                  strokeWidth="2"
                  filter="drop-shadow(0 4px 8px rgba(225,29,72,0.4))"
                />
                <circle cx="70" cy="100" r="2" fill="#ffffff" fillOpacity="0.7" />
              </g>

              {/* Paws holding heart */}
              <ellipse cx="61" cy="112" rx="9" ry="7" fill="url(#bearFur)" stroke="#78350f" strokeWidth="1.5" />
              <ellipse cx="99" cy="112" rx="9" ry="7" fill="url(#bearFur)" stroke="#78350f" strokeWidth="1.5" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 perspective-1000 relative">
      {/* Surprise badge / instruction */}
      <div className="mb-4 text-center transition-all duration-500">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-300 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-md mb-2 shadow-lg shadow-pink-500/10">
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
          <span>{isOpen ? 'Surprise Unboxed! 🎁' : `A Special Gift For ${recipientName}`}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-rose-100 to-amber-200">
          {isOpen ? `Your Surprise Gift Is Here! ✨` : 'Tap The Present To Unbox ✨'}
        </h2>
      </div>

      {/* 3D Gift Box Stage Container */}
      <div className="relative flex flex-col items-center justify-center pt-24 pb-4">
        <div
          onClick={handleOpenGift}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`relative cursor-pointer transition-transform duration-500 transform-style-3d select-none group ${
            isOpen ? 'scale-105' : 'hover:scale-105 active:scale-95'
          }`}
          style={{
            width: '270px',
            height: '250px'
          }}
        >
          {/* Ambient Glow Under Box */}
          <div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-48 h-12 rounded-full blur-xl transition-all duration-500"
            style={{
              background: isOpen ? 'radial-gradient(ellipse, rgba(251, 191, 36, 0.9) 0%, rgba(244,63,94,0.4) 50%, transparent 70%)' : theme.glowColor,
              transform: isOpen ? 'scale(1.5)' : isHovered ? 'scale(1.15)' : 'scale(1)'
            }}
          />

          {/* Rays of golden light bursting out when opened */}
          {isOpen && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <div className="w-96 h-96 bg-gradient-to-tr from-amber-400/35 via-yellow-200/50 to-pink-400/40 rounded-full blur-3xl animate-pulse" />
              <div className="absolute w-72 h-72 border border-amber-300/30 rounded-full animate-ping opacity-40" />
            </div>
          )}

          {/* ======================================================== */}
          {/* --- SURPRISE GIFT ITEM (EMERGES WHEN OPENED) --- */}
          {/* ======================================================== */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 z-35 transition-all duration-700 ease-out flex flex-col items-center pointer-events-auto ${
              isOpen
                ? 'opacity-100 scale-100 -translate-y-28 sm:-translate-y-32'
                : 'opacity-0 scale-50 translate-y-12 pointer-events-none'
            }`}
            onClick={handleInspectGift}
          >
            {/* Pulsing Aura Behind Emerged Gift */}
            <div className="absolute inset-0 m-auto w-36 h-36 bg-gradient-to-tr from-amber-400/40 via-pink-400/30 to-yellow-200/40 rounded-full blur-xl -z-10 animate-pulse" />

            {/* Floating Gift Graphic */}
            <div className="animate-float-gentle cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-300">
              {renderGiftGraphic('normal')}
            </div>

            {/* Celebratory Surprise Ribbon Tag */}
            <div className="mt-2 text-center whitespace-nowrap animate-bounce-subtle">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 via-pink-500 to-rose-500 text-white text-[11px] sm:text-xs font-bold shadow-lg shadow-pink-500/30 border border-yellow-200/60 cursor-pointer">
                <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-spin-slow" />
                <span>{currentGift.name}</span>
              </div>
              <p className="text-[10px] text-pink-200/80 mt-1 font-medium flex items-center justify-center gap-1">
                <span>Tap gift to view card</span>
                <Heart className="w-2.5 h-2.5 text-rose-400 fill-rose-400" />
              </p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* --- GIFT LID (Flies up and tilts to the side when opened) --- */}
          {/* ======================================================== */}
          <div
            className={`absolute top-4 left-0 right-0 h-16 rounded-t-xl bg-gradient-to-b ${theme.lidColor} border-b-4 border-black/20 shadow-2xl transition-all duration-700 ease-out ${
              isOpen ? 'z-10' : 'z-30'
            }`}
            style={{
              transformOrigin: 'top center',
              transform: isOpen
                ? 'translateY(-20px) translateX(-135px) rotate(-35deg) scale(0.85)'
                : isHovered
                ? 'translateY(-4px)'
                : 'translateY(0)'
            }}
          >
            {/* Lid Ribbon Cross Horizontal */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-4 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-300 shadow-md" />

            {/* Lid Ribbon Cross Vertical */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-8 bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-300 shadow-md" />

            {/* Bow on Top */}
            <div
              className={`absolute -top-7 left-1/2 -translate-x-1/2 flex items-center justify-center transition-all duration-500 ${
                isOpen ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
              }`}
            >
              {/* Left Bow Loop */}
              <div className="w-7 h-8 rounded-full border-4 border-amber-300 bg-amber-400/80 -rotate-45 shadow-lg transform origin-bottom-right" />
              {/* Center Bow Knot */}
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-200 to-amber-500 border border-yellow-100 shadow-md z-10 mx-[-6px]" />
              {/* Right Bow Loop */}
              <div className="w-7 h-8 rounded-full border-4 border-amber-300 bg-amber-400/80 rotate-45 shadow-lg transform origin-bottom-left" />
            </div>
          </div>

          {/* ======================================================== */}
          {/* --- GIFT BOX BASE --- */}
          {/* ======================================================== */}
          <div
            className={`absolute bottom-0 left-2 right-2 h-44 rounded-b-2xl bg-gradient-to-b ${theme.boxColor} shadow-2xl border-t border-white/20 z-20 overflow-hidden transition-all duration-500`}
          >
            {/* Subtle box bevel highlights */}
            <div className="absolute inset-x-0 top-0 h-2 bg-white/20" />
            <div className="absolute inset-y-0 left-0 w-2 bg-white/10" />
            <div className="absolute inset-y-0 right-0 w-2 bg-black/20" />

            {/* Vertical Ribbon on Box Body */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-8 bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-500 shadow-lg flex items-center justify-center">
              {/* Ribbon shimmer */}
              <div className="w-[1.5px] h-full bg-white/50" />
            </div>

            {/* Interior Surprise Glow peek when opened */}
            {isOpen && (
              <div className="absolute inset-0 bg-gradient-to-t from-amber-400/40 via-yellow-300/30 to-white/40 flex items-center justify-center animate-pulse">
                <Sparkles className="w-12 h-12 text-yellow-100 animate-spin-slow opacity-80" />
              </div>
            )}
          </div>

          {/* Floating Indicator */}
          {!isOpen && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-pink-300/90 tracking-wide bg-slate-900/80 px-3 py-1 rounded-full border border-pink-500/20">
              🎁 Click to open
            </div>
          )}
        </div>

        {/* Action Button after Gift is Unboxed */}
        {isOpen && (
          <div className="mt-14 sm:mt-16 flex flex-col items-center gap-3 animate-fade-in z-30">
            <button
              onClick={handleInspectGift}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-amber-400/40 text-amber-300 font-semibold text-xs sm:text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-md"
            >
              <Gift className="w-4 h-4 text-pink-400" />
              <span>Read {recipientName}'s Gift Note 💌</span>
            </button>

            {onProceedToLetter && (
              <button
                onClick={onProceedToLetter}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-pink-500/25 hover:opacity-95 hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse"
              >
                <span>Step 2: Open Musical Birthday Letter</span>
                <ArrowDown className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* --- PERSONALIZED GIFT NOTE CARD MODAL --- */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-pink-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center my-auto"
          >
            {/* Ambient background glow inside modal */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-pink-500/20 blur-3xl rounded-full pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentGift.badge}</span>
            </div>

            {/* Large Gift Display */}
            <div className="my-3 flex items-center justify-center animate-float-gentle">
              {renderGiftGraphic('large')}
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
              {currentGift.name}
            </h3>

            {/* Sender dedication */}
            <p className="text-xs text-pink-300 font-medium mt-1">
              Specially chosen for <strong className="text-amber-300 font-bold">{recipientName}</strong> by <strong className="text-pink-200">{senderName}</strong>
            </p>

            {/* Personalized Heartfelt Gift Message */}
            <div className="my-5 p-4 rounded-2xl bg-white/5 border border-white/10 text-left relative">
              <span className="text-2xl text-pink-400/40 font-serif leading-none absolute top-2 left-2">“</span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic pl-3 pr-2">
                {currentGift.message}
              </p>
              <span className="text-2xl text-pink-400/40 font-serif leading-none absolute bottom-1 right-2">”</span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (onProceedToLetter) onProceedToLetter();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-pink-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Read Birthday Letter & Music</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Back to Celebration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
