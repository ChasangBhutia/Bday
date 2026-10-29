import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import CelebrationBuilder from './components/Builder/CelebrationBuilder';
import CelebrationView from './components/Recipient/CelebrationView';
import { loadCelebration, inMemoryCelebrationCache } from './utils/storage';
import { DEFAULT_CELEBRATION } from './utils/defaultCelebration';

export default function App() {
  const [currentView, setCurrentView] = useState('builder'); // 'builder' | 'celebration'
  const [activeCelebration, setActiveCelebration] = useState(DEFAULT_CELEBRATION);
  const [isLoading, setIsLoading] = useState(
    typeof window !== 'undefined' && window.location.hash.startsWith('#celebrate')
  );

  // Sync with URL Hash on mount and on hash change
  useEffect(() => {
    let isCancelled = false;

    const handleRoute = async () => {
      window.scrollTo(0, 0);
      const hash = window.location.hash;
      if (hash.startsWith('#celebrate')) {
        setIsLoading(true);
        try {
          const loaded = await loadCelebration();
          if (!isCancelled) {
            if (loaded && loaded.recipientName && loaded.recipientName !== 'Sophia') {
              setActiveCelebration(loaded);
            } else if (activeCelebration && activeCelebration.recipientName && activeCelebration.recipientName !== 'Sophia') {
              // Preserve already loaded active custom celebration
            } else if (loaded) {
              setActiveCelebration(loaded);
            }
            setCurrentView('celebration');
            window.scrollTo(0, 0);
          }
        } catch (e) {
          console.error('Routing load error:', e);
          if (!isCancelled) {
            setCurrentView('celebration');
            window.scrollTo(0, 0);
          }
        } finally {
          if (!isCancelled) {
            setIsLoading(false);
          }
        }
      } else {
        if (!isCancelled) {
          setCurrentView('builder');
          setIsLoading(false);
          window.scrollTo(0, 0);
        }
      }
    };

    // Check initial hash
    handleRoute();

    window.addEventListener('hashchange', handleRoute);
    return () => {
      isCancelled = true;
      window.removeEventListener('hashchange', handleRoute);
    };
  }, []);

  const handleLaunchCelebration = (data) => {
    const celebrationId = (data.id && data.id !== 'bday_sample')
      ? data.id
      : `bday_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullData = { ...data, id: celebrationId };

    setActiveCelebration(fullData);
    inMemoryCelebrationCache.set(celebrationId, fullData);
    inMemoryCelebrationCache.set('active_celebration', fullData);

    window.scrollTo(0, 0);
    window.location.hash = `#celebrate?id=${celebrationId}`;
  };

  const handleBackToBuilder = () => {
    window.scrollTo(0, 0);
    window.location.hash = '';
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 font-sans">
      {isLoading ? (
        <div className="w-full min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-4">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-full border-4 border-pink-500/20 border-t-pink-500 animate-spin" />
            <Sparkles className="w-6 h-6 text-amber-300 absolute inset-0 m-auto animate-pulse" />
          </div>
          <p className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-rose-200 to-amber-200 tracking-wide">
            Unwrapping your special celebration... ✨
          </p>
          <span className="text-xs text-slate-400 mt-1">Preparing 3D gift box and musical letter</span>
        </div>
      ) : currentView === 'celebration' ? (
        <CelebrationView
          celebrationData={activeCelebration}
          onBackToBuilder={handleBackToBuilder}
        />
      ) : (
        <CelebrationBuilder
          initialCelebration={activeCelebration}
          onLaunchCelebration={handleLaunchCelebration}
        />
      )}
    </div>
  );
}
