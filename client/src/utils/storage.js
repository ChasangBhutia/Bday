import { DEFAULT_CELEBRATION } from './defaultCelebration';

const STORAGE_KEY_PREFIX = 'bday_surprises_';
const LATEST_KEY = 'bday_latest_id';

// Use environment variable if set (e.g. VITE_API_URL=https://api.yourdomain.com), otherwise relative ''
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// --- INDEXEDDB STORAGE FOR LARGE VIDEO / AUDIO BLOBS ---
const IDB_NAME = 'BirthdayMediaDB';
const IDB_VERSION = 1;
const IDB_STORE = 'videos';

function openVideoDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB not supported'));
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveVideoToIndexedDB(fileOrBlob, id = 'active_birthday_video') {
  try {
    const db = await openVideoDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const putReq = store.put({
        id,
        blob: fileOrBlob,
        name: fileOrBlob.name || 'birthday_video',
        type: fileOrBlob.type || 'video/mp4',
        updatedAt: Date.now()
      });
      putReq.onsuccess = () => resolve(true);
      putReq.onerror = () => reject(putReq.error);
    });
  } catch (e) {
    console.warn('IndexedDB save warning:', e);
    return false;
  }
}

export async function getVideoFromIndexedDB(id = 'active_birthday_video') {
  try {
    const db = await openVideoDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        if (getReq.result && getReq.result.blob) {
          const blobUrl = URL.createObjectURL(getReq.result.blob);
          resolve(blobUrl);
        } else {
          resolve(null);
        }
      };
      getReq.onerror = () => reject(getReq.error);
    });
  } catch (e) {
    console.warn('IndexedDB get warning:', e);
    return null;
  }
}

/**
 * Upload Video to Server with progress / offline fallback
 */
export async function uploadVideoFile(file) {
  if (!file) return null;

  // 1. Try uploading to backend server via multipart/form-data
  try {
    const formData = new FormData();
    formData.append('video', file);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s for video upload

    const res = await fetch(`${API_BASE_URL}/api/upload-video`, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        // Also save to IndexedDB as local instant backup
        try {
          await saveVideoToIndexedDB(file);
        } catch {}

        return {
          url: json.data.url,
          title: json.data.title || file.name.replace(/\.[^/.]+$/, '') || 'Special Birthday Video Message',
          isLocal: false
        };
      }
    }
  } catch (err) {
    console.warn('Backend video upload unavailable or failed; using high-capacity local storage:', err.message);
  }

  // 2. High-capacity offline fallback: Save blob in IndexedDB and create an Object URL
  try {
    await saveVideoToIndexedDB(file);
    const blobUrl = URL.createObjectURL(file);
    return {
      url: blobUrl,
      title: file.name.replace(/\.[^/.]+$/, '') || 'Special Birthday Video Message',
      isLocal: true
    };
  } catch (err) {
    console.error('Error generating local video fallback:', err);
  }

  // 3. Fallback to FileReader DataURL if small
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        url: e.target.result,
        title: file.name.replace(/\.[^/.]+$/, '') || 'Special Birthday Video Message',
        isLocal: true
      });
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

// Compress/encode string to safe base64
export function encodeCelebrationData(data) {
  try {
    const jsonStr = JSON.stringify(data);
    return encodeURIComponent(btoa(unescape(encodeURIComponent(jsonStr))));
  } catch (e) {
    console.error('Encoding error:', e);
    return '';
  }
}

// Decode base64 to data
export function decodeCelebrationData(encoded) {
  try {
    const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(encoded))));
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Decoding error:', e);
    return null;
  }
}

/**
 * Save celebration:
 * 1. Safely saves to localStorage without hitting QuotaExceeded
 * 2. Syncs to Express / MongoDB backend API
 */
export async function saveCelebration(data) {
  const id = data.id || `bday_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const payload = { ...data, id, updatedAt: new Date().toISOString() };

  // Prepare a safe payload for localStorage (omitting base64 strings >200kb to prevent QuotaExceededError)
  const localSafePayload = {
    ...payload,
    video: payload.video && payload.video.url && payload.video.url.startsWith('data:') && payload.video.url.length > 200000
      ? { ...payload.video, url: '' } // Preserve title, actual blob stored in IndexedDB or backend
      : payload.video
  };

  // 1. Instant local persistence
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + id, JSON.stringify(localSafePayload));
    localStorage.setItem(LATEST_KEY, id);
  } catch (e) {
    console.warn('LocalStorage save notice (handling gracefully):', e);
  }

  // 2. Sync to Backend API with generous timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${API_BASE_URL}/api/celebrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Backend server sync skipped or offline; local cache preserved:', err.message);
  }

  return payload;
}

/**
 * Load celebration by id or from URL hash:
 * 1. Checks URL hash for inline encoded `data=`
 * 2. Checks browser localStorage for instant retrieval
 * 3. Fetches from backend API `/api/celebrations/:id`
 * 4. Recovers local IndexedDB video if available
 * 5. Falls back to default celebration
 */
export async function loadCelebration(idFromUrl) {
  try {
    let result = null;
    const hash = window.location.hash || '';

    // 1. Check if full data is encoded in the URL hash query
    if (hash.includes('data=')) {
      const match = hash.match(/data=([^&]+)/);
      if (match && match[1]) {
        const decoded = decodeCelebrationData(match[1]);
        if (decoded) result = decoded;
      }
    }

    // 2. Check if specific ID is requested in hash or parameter
    let idToFetch = idFromUrl;
    if (!idToFetch && hash.includes('id=')) {
      const match = hash.match(/id=([^&]+)/);
      if (match && match[1]) {
        idToFetch = match[1];
      }
    }

    if (!idToFetch) {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has('id')) {
        idToFetch = searchParams.get('id');
      }
    }

    if (!idToFetch) {
      idToFetch = localStorage.getItem(LATEST_KEY);
    }

    // Check localStorage
    let localData = null;
    if (idToFetch) {
      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + idToFetch);
      if (stored) {
        try {
          localData = JSON.parse(stored);
        } catch {}
      }
    }

    // 3. Fetch from Backend API (crucial for sharing across devices/browsers)
    if (idToFetch) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(`${API_BASE_URL}/api/celebrations/${encodeURIComponent(idToFetch)}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          if (json && json.success && json.data) {
            result = json.data;
            try {
              localStorage.setItem(STORAGE_KEY_PREFIX + idToFetch, JSON.stringify(json.data));
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Backend fetch notice:', err.message);
      }
    }

    if (!result && localData) {
      result = localData;
    }

    if (!result) {
      result = { ...DEFAULT_CELEBRATION };
    }

    // Check if video URL is missing or blob expired, and check IndexedDB
    if (result && (!result.video?.url || result.video.url.startsWith('blob:'))) {
      try {
        const idbVideoUrl = await getVideoFromIndexedDB();
        if (idbVideoUrl) {
          result.video = {
            ...result.video,
            url: idbVideoUrl
          };
        }
      } catch {}
    }

    return result;
  } catch (e) {
    console.error('Error loading celebration:', e);
  }

  return DEFAULT_CELEBRATION;
}

/**
 * Generate shareable URL for QR code and copy link.
 */
export function generateShareUrl(data) {
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  const id = data.id || 'bday_sample';

  // Create a clean payload (exclude massive >50kb base64 to keep QR code scannable)
  const compactData = {
    id: data.id,
    recipientName: data.recipientName,
    senderName: data.senderName,
    milestone: data.milestone,
    relationship: data.relationship,
    message: data.message,
    envelopeStyle: data.envelopeStyle,
    giftStyle: data.giftStyle,
    giftItem: data.giftItem,
    music: data.music,
    images: (data.images || [])
      .map(img => ({
        id: img.id,
        url: img.url && img.url.length > 50000 ? '' : img.url,
        caption: img.caption
      }))
      .filter(img => img.url),
    video: data.video && data.video.url && data.video.url.length > 50000
      ? { title: data.video.title, url: '' }
      : data.video,
    wishes: data.wishes
  };

  const encoded = encodeCelebrationData(compactData);
  // QR codes are easiest to scan with URLs under ~1800 characters
  if (encoded && encoded.length < 1800) {
    return `${origin}${pathname}#celebrate?id=${id}&data=${encoded}`;
  }

  return `${origin}${pathname}#celebrate?id=${id}`;
}
