// Default sample celebration data for instant preview & fallback

export const DEFAULT_CELEBRATION = {
  id: 'bday_sample',
  recipientName: 'Sophia',
  senderName: 'Liam & Friends',
  milestone: '22nd',
  date: new Date().toISOString().split('T')[0],
  relationship: 'Best Friend',
  message: `Dearest Sophia,\n\nHappy Birthday! Today is all about celebrating the most radiant, wonderful person in our lives.\n\nThank you for bringing so much laughter, warmth, and adventure into every single day. From our late-night drives to countless inside jokes, every memory with you is a treasure I cherish deeply.\n\nMay this year ahead bring you endless happiness, exciting new horizons, and all the love you deserve so effortlessly.\n\nKeep shining bright, and let's make this year the most unforgettable chapter yet!\n\nWith all my love and biggest hugs,\nAlways yours,`,
  envelopeStyle: 'rose-velvet',
  giftStyle: 'crimson-gold',
  giftItem: {
    type: 'teddy',
    name: 'Cuddly Teddy Bear 🧸',
    message: 'Sending you the biggest, warmest birthday hugs! May your year ahead be filled with comfort, endless smiles, and heartwarming memories.',
    badge: 'Special Birthday Surprise'
  },
  music: {
    type: 'synth',
    name: 'Celestial Music Box Melody',
    url: ''
  },
  images: [
    {
      id: 'img-1',
      url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
      caption: 'Unforgettable night under the stars ✨',
      alt: 'Celebration sparkles'
    },
    {
      id: 'img-2',
      url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
      caption: 'Balloons, laughs & pure joy 🎈',
      alt: 'Colorful birthday balloons'
    },
    {
      id: 'img-3',
      url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80',
      caption: 'To endless celebrations together! 🥂',
      alt: 'Friends celebrating'
    },
    {
      id: 'img-4',
      url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80',
      caption: 'Sweetest cake for the sweetest soul 🎂',
      alt: 'Birthday cake and candles'
    }
  ],
  video: {
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: 'A Special Birthday Clip For You 🎥'
  },
  wishes: [
    'You make every room brighter! ✨',
    'Cheers to another year of legendary memories! 🥂',
    'May all your dreams take flight this year! 🚀',
    'You deserve all the cake and happiness today! 🍰',
    'A true one-of-a-kind soul! 💖',
    'Here’s to another 365 days of magic! 🌟'
  ]
};

export const ENVELOPE_THEMES = {
  'rose-velvet': {
    name: 'Rose Gold & Velvet',
    exterior: 'from-rose-600 via-pink-700 to-rose-950',
    flap: 'from-pink-600 to-rose-700',
    interior: 'bg-rose-900/60',
    waxColor: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 border-amber-300',
    sealText: 'S',
    accent: '#f43f5e'
  },
  'royal-gold': {
    name: 'Royal Midnight & Gold',
    exterior: 'from-amber-600 via-yellow-600 to-stone-900',
    flap: 'from-amber-500 to-yellow-700',
    interior: 'bg-amber-950/60',
    waxColor: 'bg-gradient-to-br from-red-600 via-red-700 to-red-900 border-red-400',
    sealText: '👑',
    accent: '#eab308'
  },
  'celestial-night': {
    name: 'Celestial Violet & Stars',
    exterior: 'from-purple-600 via-indigo-800 to-slate-950',
    flap: 'from-purple-500 to-indigo-700',
    interior: 'bg-indigo-950/60',
    waxColor: 'bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-800 border-fuchsia-300',
    sealText: '✨',
    accent: '#a855f7'
  },
  'emerald-luxury': {
    name: 'Emerald Luxe',
    exterior: 'from-emerald-600 via-teal-800 to-slate-950',
    flap: 'from-emerald-500 to-teal-700',
    interior: 'bg-teal-950/60',
    waxColor: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 border-amber-200',
    sealText: '🌿',
    accent: '#10b981'
  }
};

export const GIFT_THEMES = {
  'crimson-gold': {
    name: 'Crimson & Golden Ribbon',
    boxColor: 'from-rose-600 via-red-700 to-rose-900',
    lidColor: 'from-rose-500 to-red-700',
    ribbonColor: 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 shadow-amber-400/50',
    glowColor: 'rgba(244, 63, 94, 0.4)'
  },
  'sapphire-silver': {
    name: 'Midnight Sapphire & Silver',
    boxColor: 'from-blue-600 via-indigo-700 to-slate-900',
    lidColor: 'from-blue-500 to-indigo-700',
    ribbonColor: 'bg-gradient-to-r from-sky-200 via-slate-100 to-cyan-200 shadow-cyan-300/50',
    glowColor: 'rgba(56, 189, 248, 0.4)'
  },
  'emerald-luxury': {
    name: 'Emerald & Champagne',
    boxColor: 'from-emerald-600 via-teal-700 to-emerald-950',
    lidColor: 'from-emerald-500 to-teal-700',
    ribbonColor: 'bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 shadow-yellow-400/50',
    glowColor: 'rgba(16, 185, 129, 0.4)'
  },
  'neon-party': {
    name: 'Electric Neon & Violet',
    boxColor: 'from-fuchsia-600 via-purple-700 to-pink-900',
    lidColor: 'from-fuchsia-500 to-purple-700',
    ribbonColor: 'bg-gradient-to-r from-pink-300 via-fuchsia-300 to-purple-300 shadow-pink-400/50',
    glowColor: 'rgba(217, 70, 239, 0.4)'
  }
};

export const GIFT_ITEMS = {
  teddy: {
    id: 'teddy',
    name: 'Cuddly Teddy Bear 🧸',
    badge: 'Soft Hugs & Love',
    icon: '🧸',
    gradient: 'from-amber-400 via-rose-300 to-amber-500',
    title: 'Adorably Cuddly Teddy Bear',
    defaultMessage: 'Sending you the biggest, warmest birthday hugs! May your year ahead be filled with as much comfort, sweet laughter, and joy as this little friend.',
    tagline: 'Warmest Hugs Guaranteed'
  },
  trophy: {
    id: 'trophy',
    name: 'Golden Champion Trophy 🏆',
    badge: 'World #1 Soul',
    icon: '🏆',
    gradient: 'from-amber-300 via-yellow-400 to-amber-600',
    title: 'The Ultimate Birthday Champion Award',
    defaultMessage: 'Official Lifetime Achievement Trophy awarded for being the kindest, brightest, and most amazing soul in the universe! Keep inspiring everyone.',
    tagline: 'Awarded to the Best Person'
  },
  cake: {
    id: 'cake',
    name: 'Sparkler Birthday Cake 🎂',
    badge: 'Make A Wish!',
    icon: '🎂',
    gradient: 'from-pink-400 via-rose-300 to-amber-300',
    title: 'Magical Strawberry Sparkle Cake',
    defaultMessage: 'Close your eyes and make a special secret birthday wish! Here is to sweet moments, joyful laughs, and all your dreams taking flight this year.',
    tagline: 'May All Your Wishes Come True'
  },
  jewel: {
    id: 'jewel',
    name: 'Sparkling Diamond Velvet Box 💎',
    badge: 'Precious Gem',
    icon: '💎',
    gradient: 'from-cyan-300 via-sky-400 to-indigo-500',
    title: 'Radiant Diamond Treasure',
    defaultMessage: 'You are a rare, radiant gem whose kindness shines brighter than any jewel. Thank you for making life so dazzling and unforgettable.',
    tagline: 'Truly Irreplaceable'
  },
  pass: {
    id: 'pass',
    name: 'Golden VIP Birthday Pass 🎟️',
    badge: 'All-Access Magic',
    icon: '🎟️',
    gradient: 'from-yellow-300 via-amber-400 to-orange-500',
    title: 'Golden VIP Lifetime Pass',
    defaultMessage: 'ADMIT ONE: Valid for unlimited cafe runs, late-night talks, emergency hugs, and infinite adventures. Non-expiring and 100% unconditional!',
    tagline: 'Unlimited Fun & Love'
  }
};

export function formatCelebrationDate(dateString) {
  if (!dateString) return '';
  try {
    const parts = String(dateString).split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      }
    }
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return String(dateString);
  } catch {
    return String(dateString);
  }
}

