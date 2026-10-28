import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, Download, ExternalLink, Share2, Sparkles, Smartphone, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ShareModal({ isOpen, onClose, shareUrl, celebrationData, onOpenPreview }) {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && shareUrl) {
      // Trigger a mini celebratory burst on modal opening!
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 }
      });

      // Generate QR Code with custom styling
      QRCode.toDataURL(shareUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      })
        .then(url => {
          setQrDataUrl(url);
        })
        .catch(err => {
          console.error('QR code generation error:', err);
        });
    }
  }, [isOpen, shareUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `Birthday_QR_${celebrationData?.recipientName || 'Celebration'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Birthday Surprise for ${celebrationData?.recipientName || 'You'}! 🎁`,
        text: `Open your interactive birthday surprise! Tap or scan to unwrap:`,
        url: shareUrl
      }).catch(err => console.log('Share canceled or failed', err));
    } else {
      handleCopyLink();
    }
  };

  const recipient = celebrationData?.recipientName || 'the birthday person';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-pink-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Surprise Ready to Share!</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
          Scan Or Share With {recipient} 🎁
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-sm mx-auto">
          When {recipient} scans this QR code on their phone or clicks the link, their interactive gift and letter will open!
        </p>

        {/* QR Code Card */}
        <div className="my-6 inline-block p-4 rounded-2xl bg-white shadow-xl shadow-pink-500/10 border-4 border-pink-400/30">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Birthday QR Code"
              className="w-48 h-48 sm:w-56 sm:h-56 mx-auto object-contain rounded-lg"
            />
          ) : (
            <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center text-slate-500">
              <QrCode className="w-12 h-12 animate-pulse" />
            </div>
          )}
          <div className="mt-2 text-[11px] font-bold text-slate-800 tracking-wider flex items-center justify-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-pink-600" />
            <span>SCAN WITH ANY PHONE CAMERA</span>
          </div>
        </div>

        {/* Action Buttons: Download QR & Copy Link */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-5">
          <button
            onClick={handleDownloadQr}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs sm:text-sm border border-white/10 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-pink-400" />
            <span>Save QR Image (PNG)</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-pink-600/30 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-300" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Surprise Link</span>
              </>
            )}
          </button>
        </div>

        {/* Share on WhatsApp & Web Share API */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hey ${recipient}! I made a special interactive birthday surprise website for you 🎁✨ Open it here: ${shareUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-medium transition-colors"
          >
            <span>💬 Share on WhatsApp</span>
          </a>

          {navigator.share && (
            <button
              onClick={handleNativeShare}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-medium transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>More Share Options</span>
            </button>
          )}
        </div>

        {/* Direct Test Preview Button */}
        <div className="pt-4 border-t border-white/10">
          <button
            onClick={onOpenPreview}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-500 to-rose-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-pink-500/20 hover:opacity-95 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Preview & Test as {recipient}</span>
            <ExternalLink className="w-4 h-4" />
          </button>
          <p className="text-[11px] text-slate-400 mt-2">
            Tip: You can test the unboxing, letter tearing, and music right now!
          </p>
        </div>
      </div>
    </div>
  );
}
