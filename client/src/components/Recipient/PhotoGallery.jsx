import React, { useState, useEffect, useRef } from 'react';
import { Camera, Video, X, Maximize2, Sparkles, Heart, AlertCircle, Play, RefreshCw, ExternalLink } from 'lucide-react';
import { getVideoFromIndexedDB } from '../../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function PhotoGallery({ images = [], video = null, recipientName = 'Sophia' }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState(video?.url || '');
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  const hasPhotos = images && images.length > 0;

  // Resolve video URL from props or fallback to IndexedDB if local blob expired
  useEffect(() => {
    let isCancelled = false;

    async function resolveUrl() {
      setVideoError(false);
      if (video?.url && video.url.trim().length > 0) {
        setResolvedVideoUrl(video.url);
      } else {
        // Attempt to retrieve active video from IndexedDB
        try {
          const idbUrl = await getVideoFromIndexedDB();
          if (idbUrl && !isCancelled) {
            setResolvedVideoUrl(idbUrl);
          }
        } catch (e) {
          console.warn('Could not read video from IndexedDB:', e);
        }
      }
    }

    resolveUrl();

    return () => {
      isCancelled = true;
    };
  }, [video?.url]);

  const hasVideo = resolvedVideoUrl && resolvedVideoUrl.trim().length > 0;

  if (!hasPhotos && !hasVideo) return null;

  // Universal Video parser for YouTube, Vimeo, Google Drive, and Direct Video Streams
  const parseVideo = (url) => {
    if (!url) return { type: 'none', url: '' };
    const trimmed = url.trim();

    // 1. YouTube (standard, shortened youtu.be, shorts, embeds)
    const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return {
        type: 'iframe',
        embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0&modestbranding=1`
      };
    }

    // 2. Vimeo
    const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
      return {
        type: 'iframe',
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`
      };
    }

    // 3. Google Drive video preview
    const gdriveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
    if (gdriveMatch && gdriveMatch[1]) {
      return {
        type: 'iframe',
        embedUrl: `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`
      };
    }

    // 4. Direct video (blob, data:video, /uploads/videos, or video extensions, or direct HTTP stream)
    let directUrl = trimmed;
    if (directUrl.startsWith('/uploads/') && API_BASE_URL) {
      directUrl = `${API_BASE_URL}${directUrl}`;
    }
    return {
      type: 'direct',
      url: directUrl
    };
  };

  const videoSource = parseVideo(resolvedVideoUrl);

  const handleVideoError = () => {
    console.warn('Video failed to load or unsupported format:', resolvedVideoUrl);
    setVideoError(true);
  };

  const handleRetryVideo = async () => {
    setVideoError(false);
    try {
      const idbUrl = await getVideoFromIndexedDB();
      if (idbUrl) {
        setResolvedVideoUrl(idbUrl);
      }
    } catch {}
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-400/30 text-pink-300 text-xs font-semibold backdrop-blur-md mb-2">
          <Camera className="w-3.5 h-3.5" />
          <span>Cherished Memories</span>
        </span>
        <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
          Moments With {recipientName} 📸
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          A collection of smiles, laughter, and special milestones
        </p>
      </div>

      {/* --- POLAROID PHOTOS GRID --- */}
      {hasPhotos && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 justify-items-center">
          {images.map((img, idx) => {
            const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-3', '-rotate-3', 'rotate-2'];
            const rot = rotations[idx % rotations.length];

            return (
              <div
                key={img.id || idx}
                onClick={() => setSelectedPhoto(img)}
                className={`relative bg-white text-slate-900 rounded-sm p-3 pb-6 shadow-xl border border-slate-200/80 cursor-pointer transform ${rot} hover:rotate-0 hover:scale-105 hover:z-20 transition-all duration-300 group max-w-[260px] w-full`}
              >
                {/* Washi tape pin effect on top */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-amber-200/80 backdrop-blur-sm -rotate-2 shadow-sm border border-amber-300/60 z-10" />

                {/* Photo frame */}
                <div className="w-full aspect-square bg-slate-100 overflow-hidden rounded-xs relative">
                  <img
                    src={img.url}
                    alt={img.caption || `Memory ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-2 bg-black/60 rounded-full text-white">
                      <Maximize2 className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Polaroid Caption */}
                <div className="mt-3 px-1 text-center">
                  <p className="font-casual text-base sm:text-lg font-bold text-slate-800 leading-tight">
                    {img.caption || `Memory #${idx + 1} ✨`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- VIDEO SECTION --- */}
      {hasVideo && (
        <div className="mt-14 max-w-3xl mx-auto">
          <div className="glass-panel rounded-3xl p-4 sm:p-6 shadow-2xl border border-pink-500/25 bg-slate-900/80 backdrop-blur-md">
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-pink-300 font-semibold text-sm sm:text-base">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Video className="w-4 h-4" />
                </div>
                <span>{video?.title || 'Special Birthday Video Message 🎬'}</span>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-pink-500/15 text-pink-300 font-medium">
                Tap to Play
              </span>
            </div>

            <div className="relative rounded-2xl overflow-hidden aspect-video bg-black/90 shadow-2xl flex items-center justify-center border border-white/15">
              {videoError ? (
                <div className="p-6 text-center max-w-sm flex flex-col items-center gap-3">
                  <AlertCircle className="w-10 h-10 text-amber-400" />
                  <p className="text-sm font-semibold text-white">
                    Video could not be played directly in this browser
                  </p>
                  <p className="text-xs text-slate-400">
                    This can happen if the video format is proprietary (like iPhone HEVC/ProRes) or temporarily unavailable.
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleRetryVideo}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-medium cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                    {resolvedVideoUrl && (
                      <a
                        href={resolvedVideoUrl.startsWith('/uploads/') && API_BASE_URL ? `${API_BASE_URL}${resolvedVideoUrl}` : resolvedVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in New Tab</span>
                      </a>
                    )}
                  </div>
                </div>
              ) : videoSource.type === 'direct' ? (
                <video
                  ref={videoRef}
                  src={videoSource.url}
                  controls
                  playsInline
                  preload="metadata"
                  onError={handleVideoError}
                  className="w-full h-full object-contain"
                >
                  <source src={videoSource.url} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <iframe
                  src={videoSource.embedUrl}
                  title="Birthday Video"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- LIGHTBOX MODAL --- */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[75vh] flex items-center justify-center bg-black/40">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || 'Memory'}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />
            </div>

            <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
              <p className="text-white font-casual text-xl font-bold">
                {selectedPhoto.caption || 'A Special Memory'}
              </p>
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
