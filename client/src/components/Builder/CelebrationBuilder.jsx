import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  Share2,
  Trash2,
  Plus,
  Play,
  Pause,
  Gift,
  Mail,
  Eye,
  Check,
  AlertCircle,
  ExternalLink,
  Loader2,
  Film
} from 'lucide-react';
import { DEFAULT_CELEBRATION, ENVELOPE_THEMES, GIFT_THEMES, GIFT_ITEMS } from '../../utils/defaultCelebration';
import { saveCelebration, generateShareUrl, uploadVideoFile } from '../../utils/storage';
import { soundManager } from '../../utils/soundEffects';
import ShareModal from './ShareModal';

export default function CelebrationBuilder({ onLaunchCelebration }) {
  const [formData, setFormData] = useState({ ...DEFAULT_CELEBRATION });
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isPlayingAudioPreview, setIsPlayingAudioPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Photos state
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');

  // Video state
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploadError, setVideoUploadError] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoTitleInput, setVideoTitleInput] = useState('');

  // Handle generic text fields
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Quick Letter Templates
  const handleApplyTemplate = (type) => {
    let msg = '';
    const name = formData.recipientName || 'there';
    if (type === 'bestie') {
      msg = `Dearest ${name},\n\nHappy Birthday to my partner in crime and absolute favorite human! Thank you for the endless laughs, late-night talks, and always having my back.\n\nMay this year bring you all the adventure, success, and pure joy you bring to everyone around you. Here's to making countless more chaotic and unforgettable memories together!\n\nLove always,`;
    } else if (type === 'romantic') {
      msg = `My Dearest ${name},\n\nHappy Birthday, my love! Having you in my life is the greatest gift I could ever ask for. Your smile lights up my entire world in ways words can never fully capture.\n\nToday, I celebrate you, your kind heart, and the magic of our journey together. May all your dreams come true this year and always.\n\nForever and completely yours,`;
    } else if (type === 'sibling') {
      msg = `Hey ${name}!\n\nHappy Birthday! Even though you drove me crazy growing up, I wouldn't trade you for the world. You're simply the best, and I'm so proud of everything you're achieving.\n\nEat all the cake you want today—you deserve the most amazing celebration!\n\nCheers to you,`;
    }
    setFormData(prev => ({ ...prev, message: msg }));
  };

  // Image Upload handler (Base64)
  const handleImageFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Url = uploadEvent.target.result;
        setFormData(prev => ({
          ...prev,
          images: [
            ...prev.images,
            {
              id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              url: base64Url,
              caption: file.name.replace(/\.[^/.]+$/, '') || 'Cherished Memory'
            }
          ]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setFormData(prev => ({
      ...prev,
      images: [
        ...prev.images,
        {
          id: `img_${Date.now()}`,
          url: newImageUrl.trim(),
          caption: newImageCaption.trim() || 'A Beautiful Memory'
        }
      ]
    }));
    setNewImageUrl('');
    setNewImageCaption('');
  };

  const handleRemoveImage = (id) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== id)
    }));
  };

  // Audio track handler
  const handleAudioFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Audio = uploadEvent.target.result;
      const customMusic = {
        type: 'custom',
        name: file.name.replace(/\.[^/.]+$/, '') || 'Custom Birthday Song',
        url: base64Audio
      };
      setFormData(prev => ({
        ...prev,
        music: customMusic
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSynthMusic = (key) => {
    soundManager.stopMusic();
    setIsPlayingAudioPreview(false);
    if (key === 'synth-musicbox') {
      setFormData(prev => ({
        ...prev,
        music: {
          type: 'synth',
          name: 'Celestial Music Box Melody',
          url: ''
        }
      }));
    } else if (key === 'acoustic') {
      setFormData(prev => ({
        ...prev,
        music: {
          type: 'synth',
          name: 'Joyful Acoustic Birthday Harmony',
          url: ''
        }
      }));
    }
  };

  const toggleTestMusic = () => {
    if (isPlayingAudioPreview) {
      soundManager.stopMusic();
      setIsPlayingAudioPreview(false);
    } else {
      soundManager.playBirthdayMusic(formData.music);
      setIsPlayingAudioPreview(true);
    }
  };

  // --- VIDEO UPLOAD & LINK HANDLERS ---
  const handleVideoFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingVideo(true);
    setVideoUploadError('');

    try {
      const uploadResult = await uploadVideoFile(file);
      if (uploadResult && uploadResult.url) {
        setFormData(prev => ({
          ...prev,
          video: {
            url: uploadResult.url,
            title: uploadResult.title || file.name.replace(/\.[^/.]+$/, '') || 'Special Birthday Video Message'
          }
        }));
      } else {
        setVideoUploadError('Video could not be processed. Please try another MP4 or WebM video file.');
      }
    } catch (err) {
      console.error('Video upload error:', err);
      setVideoUploadError('Upload failed: ' + (err.message || 'Please check file format.'));
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleApplyVideoUrl = () => {
    if (!videoUrlInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      video: {
        url: videoUrlInput.trim(),
        title: videoTitleInput.trim() || prev.video?.title || 'Special Birthday Video Message'
      }
    }));
    setVideoUrlInput('');
    setVideoTitleInput('');
    setVideoUploadError('');
  };

  const handleRemoveVideo = () => {
    setFormData(prev => ({
      ...prev,
      video: {
        url: '',
        title: ''
      }
    }));
  };

  // --- SURPRISE GIFT ITEM HANDLER ---
  const handleSelectGiftItem = (giftKey) => {
    const itemMeta = GIFT_ITEMS[giftKey] || GIFT_ITEMS.teddy;
    setFormData(prev => ({
      ...prev,
      giftItem: {
        type: giftKey,
        name: itemMeta.name,
        message: itemMeta.defaultMessage,
        badge: itemMeta.badge
      }
    }));
  };

  const handleGiftFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      giftItem: {
        ...prev.giftItem,
        [field]: value
      }
    }));
  };

  // Generate & Share QR Handler
  const handleGenerateAndShare = async () => {
    setIsSaving(true);
    try {
      const saved = await saveCelebration(formData);
      const url = generateShareUrl(saved);
      setShareUrl(url);
      setIsShareModalOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewDirectly = async () => {
    soundManager.stopMusic();
    const saved = await saveCelebration(formData);
    onLaunchCelebration(saved);
  };

  const currentGiftKey = formData.giftItem?.type || 'teddy';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 relative selection:bg-pink-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Title */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-300 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-md mb-3 shadow-lg shadow-pink-500/10">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Interactive Birthday Surprise Studio</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Craft a Magical Celebration 🎉
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Design an interactive experience with 3D gift unboxing, realistic envelope tearing, custom background music, video messages, and instant QR sharing!
          </p>
        </header>

        {/* Builder Form Sections */}
        <div className="space-y-8">
          {/* 1. RECIPIENT & SENDER DETAILS */}
          <section className="glass-card rounded-2xl p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 mb-6">
              <span className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 flex items-center justify-center text-xs">
                1
              </span>
              <span>Who is this celebration for? 🌟</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Recipient's Name
                </label>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) => handleChange('recipientName', e.target.value)}
                  placeholder="e.g. Sophia"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-sm text-white placeholder-slate-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Birthday Milestone (Optional)
                </label>
                <input
                  type="text"
                  value={formData.milestone}
                  onChange={(e) => handleChange('milestone', e.target.value)}
                  placeholder="e.g. 21st, 25th, 30th"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-sm text-white placeholder-slate-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  From (Sender Name)
                </label>
                <input
                  type="text"
                  value={formData.senderName}
                  onChange={(e) => handleChange('senderName', e.target.value)}
                  placeholder="e.g. Alex & Friends"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-sm text-white placeholder-slate-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Relationship
                </label>
                <select
                  value={formData.relationship}
                  onChange={(e) => handleChange('relationship', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-sm text-white transition-all"
                >
                  <option value="Best Friend">Best Friend</option>
                  <option value="Partner / Soulmate">Partner / Soulmate</option>
                  <option value="Family / Sibling">Family / Sibling</option>
                  <option value="Colleague / Mentor">Colleague / Mentor</option>
                </select>
              </div>
            </div>
          </section>

          {/* 2. THE BIRTHDAY LETTER (LIFAFA CONTENT) */}
          <section className="glass-card rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 flex items-center justify-center text-xs">
                  2
                </span>
                <span>The Birthday Letter (Sealed Inside Lifafa) 💌</span>
              </h2>

              {/* Quick Template Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400 font-medium mr-1">Templates:</span>
                <button
                  type="button"
                  onClick={() => handleApplyTemplate('bestie')}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-pink-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  Bestie
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTemplate('romantic')}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  Romantic
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTemplate('sibling')}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  Sibling
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Personal Letter Message
              </label>
              <textarea
                rows={7}
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="Write your heartfelt birthday letter here..."
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-sm text-slate-200 placeholder-slate-500 leading-relaxed transition-all resize-y"
              />
              <p className="text-[11px] text-slate-400 mt-2">
                This letter is hidden inside the sealed envelope. When {formData.recipientName || 'the recipient'} slides to break the wax seal and unrolls the envelope, it smoothly opens with background music!
              </p>
            </div>
          </section>

          {/* 3. BACKGROUND MUSIC */}
          <section className="glass-card rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 flex items-center justify-center text-xs">
                  3
                </span>
                <span>Celebration Soundtrack 🎵</span>
              </h2>

              <button
                type="button"
                onClick={toggleTestMusic}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/40 text-pink-300 text-xs font-semibold transition-all cursor-pointer"
              >
                {isPlayingAudioPreview ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-pink-300" />
                    <span>Stop Preview</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-pink-300" />
                    <span>Test Melody</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Option 1: Synth Music Box */}
              <button
                type="button"
                onClick={() => handleSelectSynthMusic('synth-musicbox')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  formData.music?.type === 'synth' && formData.music?.name.includes('Music Box')
                    ? 'border-pink-500 bg-pink-500/15 shadow-lg shadow-pink-500/10'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">✨</span>
                  {formData.music?.type === 'synth' && formData.music?.name.includes('Music Box') && (
                    <Check className="w-4 h-4 text-pink-400" />
                  )}
                </div>
                <h4 className="text-sm font-bold text-white">Celestial Music Box</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Gentle, nostalgic chime melody that plays automatically with Web Audio!
                </p>
              </button>

              {/* Option 2: Acoustic Synth */}
              <button
                type="button"
                onClick={() => handleSelectSynthMusic('acoustic')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  formData.music?.type === 'synth' && formData.music?.name.includes('Acoustic')
                    ? 'border-pink-500 bg-pink-500/15 shadow-lg shadow-pink-500/10'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">🎸</span>
                  {formData.music?.type === 'synth' && formData.music?.name.includes('Acoustic') && (
                    <Check className="w-4 h-4 text-pink-400" />
                  )}
                </div>
                <h4 className="text-sm font-bold text-white">Joyful Acoustic</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Bright, cheerful synthesized acoustic harmony.
                </p>
              </button>

              {/* Option 3: Custom MP3 Upload */}
              <label
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative ${
                  formData.music?.type === 'custom'
                    ? 'border-pink-500 bg-pink-500/15 shadow-lg shadow-pink-500/10'
                    : 'border-dashed border-slate-700 bg-slate-900/60 hover:border-pink-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">📁</span>
                  {formData.music?.type === 'custom' && (
                    <Check className="w-4 h-4 text-pink-400" />
                  )}
                </div>
                <h4 className="text-sm font-bold text-white">Upload Custom MP3</h4>
                <p className="text-xs text-slate-400 mt-1">
                  {formData.music?.type === 'custom'
                    ? formData.music.name
                    : 'Choose your own favorite song from your device.'}
                </p>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </section>

          {/* 4. MEMORIES GALLERY (IMAGES & VIDEO) */}
          <section className="glass-card rounded-2xl p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 mb-6">
              <span className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 flex items-center justify-center text-xs">
                4
              </span>
              <span>Cherished Photos & Birthday Video Message 📸</span>
            </h2>

            {/* Photo Upload & URL input */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Device Upload */}
                <label className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-dashed border-slate-600 hover:border-pink-400 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer">
                  <Upload className="w-4 h-4 text-pink-400" />
                  <span>Upload Photos from Phone / PC</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Add Photo via URL */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Or paste an image URL..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Caption for this photo"
                  value={newImageCaption}
                  onChange={(e) => setNewImageCaption(e.target.value)}
                  className="sm:w-48 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Add Photo
                </button>
              </div>
            </div>

            {/* Photos Preview Grid */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {formData.images.map((img) => (
                  <div
                    key={img.id}
                    className="relative group rounded-xl overflow-hidden bg-slate-900 border border-slate-700 aspect-square"
                  >
                    <img
                      src={img.url}
                      alt={img.caption}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img.id)}
                        className="self-end p-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <p className="text-[11px] text-white font-medium truncate">
                        {img.caption}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ======================================================== */}
            {/* DEDICATED VIDEO MESSAGE SUB-SECTION */}
            {/* ======================================================== */}
            <div className="pt-6 border-t border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
                  <Film className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Birthday Video Clip or Greeting 🎬</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Plays in Memories
                </span>
              </div>

              {/* Upload or Link Input Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {/* File Upload Button */}
                <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-dashed border-purple-500/40 hover:border-purple-400 text-purple-300 hover:text-white text-xs font-semibold transition-all cursor-pointer">
                  {isUploadingVideo ? (
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  ) : (
                    <Upload className="w-4 h-4 text-purple-400" />
                  )}
                  <span>
                    {isUploadingVideo ? 'Uploading Video Clip...' : 'Upload Video File (MP4, MOV)'}
                  </span>
                  <input
                    type="file"
                    accept="video/*"
                    disabled={isUploadingVideo}
                    onChange={handleVideoFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Paste URL */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Or paste YouTube, Vimeo, or MP4 link..."
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyVideoUrl}
                    className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer shrink-0"
                  >
                    Add Link
                  </button>
                </div>
              </div>

              {/* Upload Error Banner */}
              {videoUploadError && (
                <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{videoUploadError}</span>
                </div>
              )}

              {/* Video Active Preview Card */}
              {formData.video && formData.video.url ? (
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-white">Active Video Attached</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Video</span>
                    </button>
                  </div>

                  {/* Editable Video Title */}
                  <div className="mb-3">
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Video Title
                    </label>
                    <input
                      type="text"
                      value={formData.video.title || ''}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          video: { ...prev.video, title: e.target.value }
                        }))
                      }
                      placeholder="e.g. A Special Birthday Clip For You 🎥"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  {/* Playable Video Preview */}
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-black/80 flex items-center justify-center border border-white/10">
                    {formData.video.url.includes('youtube.com') || formData.video.url.includes('youtu.be') ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${
                          formData.video.url.match(/(?:youtu\.be\/|v\/|watch\?v=|shorts\/)([\w-]{11})/)?.[1] || ''
                        }`}
                        title="Video Preview"
                        className="w-full h-full border-0"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={formData.video.url?.startsWith('/uploads/') && (import.meta.env.VITE_API_URL || '') ? `${import.meta.env.VITE_API_URL}${formData.video.url}` : formData.video.url}
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 text-center">
                  <p className="text-xs text-slate-500">
                    No video clip attached yet. Upload an MP4/MOV or paste a link to include a heartfelt video message!
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* 5. GIFT BOX & SURPRISE PRESENT CUSTOMIZATION */}
          <section className="glass-card rounded-2xl p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 mb-6">
              <span className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 flex items-center justify-center text-xs">
                5
              </span>
              <span>Gift Box & Surprise Present Inside 🎁</span>
            </h2>

            <div className="space-y-6">
              {/* Gift Box Style */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  1. Exterior Gift Box Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {Object.entries(GIFT_THEMES).map(([key, val]) => (
                    <button
                      type="button"
                      key={key}
                      onClick={() => handleChange('giftStyle', key)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        formData.giftStyle === key
                          ? 'border-pink-400 bg-pink-500/20 shadow-md'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${val.boxColor}`} />
                      <span className="text-xs font-semibold text-white">{val.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Surprise Gift Type Choice */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  2. What Gift Pops Out When Unboxed? ✨
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {Object.entries(GIFT_ITEMS).map(([key, item]) => (
                    <button
                      type="button"
                      key={key}
                      onClick={() => handleSelectGiftItem(key)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        currentGiftKey === key
                          ? 'border-amber-400 bg-gradient-to-b from-amber-500/20 to-pink-500/10 shadow-lg shadow-amber-500/10'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{item.icon}</span>
                        {currentGiftKey === key && (
                          <span className="p-0.5 rounded-full bg-amber-400 text-slate-950">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white">{item.name}</h4>
                      <p className="text-[10px] text-amber-200/80 mt-1">{item.badge}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Customize Gift Note */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Personal Gift Note (Appears When Recipient Inspects Gift)
                </label>
                <textarea
                  rows={3}
                  value={formData.giftItem?.message || ''}
                  onChange={(e) => handleGiftFieldChange('message', e.target.value)}
                  placeholder="Write a sweet dedication note for the gift..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 leading-relaxed"
                />
              </div>

              {/* Envelope Theme */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  3. Envelope (Lifafa) Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {Object.entries(ENVELOPE_THEMES).map(([key, val]) => (
                    <button
                      type="button"
                      key={key}
                      onClick={() => handleChange('envelopeStyle', key)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        formData.envelopeStyle === key
                          ? 'border-pink-400 bg-pink-500/20 shadow-md'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${val.exterior}`} />
                      <span className="text-xs font-semibold text-white">{val.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* GENERATE SHARE & PREVIEW CTA */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleGenerateAndShare}
              className="w-full sm:w-auto px-10 py-4 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-extrabold text-base sm:text-lg shadow-2xl shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <Share2 className={`w-5 h-5 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? 'Saving Celebration...' : 'Generate Celebration & Share QR 🎁'}</span>
              <Sparkles className="w-4 h-4 text-amber-200 animate-spin-slow" />
            </button>

            <button
              type="button"
              onClick={handlePreviewDirectly}
              className="w-full sm:w-auto px-6 py-4 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-sm sm:text-base border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4 text-pink-400" />
              <span>Direct Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Share & QR Code Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
        celebrationData={formData}
        onOpenPreview={handlePreviewDirectly}
      />
    </div>
  );
}
