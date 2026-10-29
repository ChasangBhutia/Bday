import { DEFAULT_CELEBRATION } from './defaultCelebration';

const STORAGE_KEY_PREFIX = 'bday_surprises_';
const LATEST_KEY = 'bday_latest_id';

// Fallback to user's Render backend URL if not set
const FALLBACK_RENDER_API = 'https://bday-ved0.onrender.com';
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' &&
   (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? ''
    : FALLBACK_RENDER_API);

// In-memory instant cache for active session
export const inMemoryCelebrationCache = new Map();

// --- INDEXEDDB STORAGE FOR LARGE VIDEO / AUDIO / FULL CELEBRATIONS ---
const IDB_NAME = 'BirthdayMediaDB';
const IDB_VERSION = 2;
const IDB_STORE_VIDEOS = 'videos';
const IDB_STORE_CELEBRATIONS = 'celebrations';

function openAppDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB not supported'));
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE_VIDEOS)) {
        db.createObjectStore(IDB_STORE_VIDEOS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(IDB_STORE_CELEBRATIONS)) {
        db.createObjectStore(IDB_STORE_CELEBRATIONS, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveCelebrationToIndexedDB(celebration) {
  if (!celebration || !celebration.id) return false;
  try {
    const db = await openAppDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_CELEBRATIONS, 'readwrite');
      const store = tx.objectStore(IDB_STORE_CELEBRATIONS);
      const putReq = store.put({
        id: celebration.id,
        data: celebration,
        updatedAt: Date.now()
      });
      // Also cache as active_celebration
      store.put({
        id: 'active_celebration',
        data: celebration,
        updatedAt: Date.now()
      });
      putReq.onsuccess = () => resolve(true);
      putReq.onerror = () => reject(putReq.error);
    });
  } catch (e) {
    console.warn('IndexedDB celebration save warning:', e);
    return false;
  }
}

export async function getCelebrationFromIndexedDB(id) {
  try {
    const db = await openAppDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_CELEBRATIONS, 'readonly');
      const store = tx.objectStore(IDB_STORE_CELEBRATIONS);
      const targetId = id || 'active_celebration';
      const getReq = store.get(targetId);
      getReq.onsuccess = () => {
        if (getReq.result && getReq.result.data) {
          resolve(getReq.result.data);
        } else {
          // If requested specific ID not found, check active_celebration
          if (targetId !== 'active_celebration') {
            const fallbackReq = store.get('active_celebration');
            fallbackReq.onsuccess = () => {
              if (fallbackReq.result && fallbackReq.result.data) {
                resolve(fallbackReq.result.data);
              } else {
                resolve(null);
              }
            };
            fallbackReq.onerror = () => resolve(null);
          } else {
            resolve(null);
          }
        }
      };
      getReq.onerror = () => reject(getReq.error);
    });
  } catch (e) {
    console.warn('IndexedDB celebration get notice:', e);
    return null;
  }
}

export async function saveVideoToIndexedDB(fileOrBlob, id = 'active_birthday_video') {
  try {
    const db = await openAppDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_VIDEOS, 'readwrite');
      const store = tx.objectStore(IDB_STORE_VIDEOS);
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
    const db = await openAppDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE_VIDEOS, 'readonly');
      const store = tx.objectStore(IDB_STORE_VIDEOS);
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

    const uploadEndpoint = API_BASE_URL ? `${API_BASE_URL}/api/upload-video` : '/api/upload-video';
    const res = await fetch(uploadEndpoint, {
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
 * 1. Immediate in-memory cache update
 * 2. High-capacity IndexedDB persistence (stores full photos/video without quota limits)
 * 3. Safe localStorage persistence (never throws QuotaExceeded)
 * 4. Syncs to Express / MongoDB backend API
 */
export async function saveCelebration(data) {
  // Generate a clean, unique ID if default or empty
  const id = (data.id && data.id !== 'bday_sample')
    ? data.id
    : `bday_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const payload = {
    ...data,
    id,
    updatedAt: new Date().toISOString()
  };

  // 1. Instant in-memory cache
  inMemoryCelebrationCache.set(id, payload);
  inMemoryCelebrationCache.set('active_celebration', payload);

  // 2. High-capacity IndexedDB save (can store hundreds of megabytes safely)
  try {
    await saveCelebrationToIndexedDB(payload);
  } catch (e) {
    console.warn('IndexedDB save warning:', e);
  }

  // 3. Prepare quota-safe payload for localStorage
  // Large base64 strings (>50KB) are stripped from localStorage to prevent QuotaExceededError
  try {
    const localSafePayload = {
      ...payload,
      images: (payload.images || []).map(img => ({
        id: img.id,
        caption: img.caption,
        alt: img.alt,
        url: img.url && img.url.length < 50000 ? img.url : ''
      })),
      video: payload.video && payload.video.url && payload.video.url.length > 50000
        ? { title: payload.video.title, url: '' }
        : payload.video
    };

    localStorage.setItem(STORAGE_KEY_PREFIX + id, JSON.stringify(localSafePayload));
    localStorage.setItem(LATEST_KEY, id);
    // Also save as draft celebration
    localStorage.setItem('bday_draft_celebration', JSON.stringify(localSafePayload));
  } catch (e) {
    console.warn('LocalStorage save notice (handled gracefully):', e);
  }

  // 4. Sync to Backend API with 20s timeout (allows cold Render instance to wake)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const apiEndpoint = API_BASE_URL ? `${API_BASE_URL}/api/celebrations` : '/api/celebrations';
    const res = await fetch(apiEndpoint, {
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
        // Merge saved data into caches
        inMemoryCelebrationCache.set(id, json.data);
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Backend server sync notice (using local storage):', err.message);
  }

  return payload;
}

/**
 * Load celebration by id or from URL hash:
 * 1. Checks in-memory session cache
 * 2. Checks URL hash for inline encoded `data=`
 * 3. Checks IndexedDB for full celebration data
 * 4. Checks browser localStorage
 * 5. Fetches from backend API `/api/celebrations/:id`
 * 6. Recovers local IndexedDB video if available
 * 7. Falls back to default celebration only if no custom data exists
 */
export async function loadCelebration(idFromUrl) {
  try {
    let result = null;
    const hash = window.location.hash || '';

    // 1. Check if specific ID is requested
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

    // A. Check in-memory session cache first (instant!)
    if (idToFetch && inMemoryCelebrationCache.has(idToFetch)) {
      result = inMemoryCelebrationCache.get(idToFetch);
    } else if (inMemoryCelebrationCache.has('active_celebration')) {
      const active = inMemoryCelebrationCache.get('active_celebration');
      if (active && (!idToFetch || active.id === idToFetch || idToFetch === 'bday_sample')) {
        result = active;
      }
    }

    // B. Check if full data is encoded in the URL hash query
    if (!result && hash.includes('data=')) {
      const match = hash.match(/data=([^&]+)/);
      if (match && match[1]) {
        const decoded = decodeCelebrationData(match[1]);
        if (decoded) result = decoded;
      }
    }

    // C. Check IndexedDB for full rich celebration
    if (!result && idToFetch) {
      try {
        const idbData = await getCelebrationFromIndexedDB(idToFetch);
        if (idbData && idbData.recipientName) {
          result = idbData;
        }
      } catch (idbErr) {
        console.warn('IndexedDB celebration lookup notice:', idbErr);
      }
    }

    // D. Check localStorage
    if (!result && idToFetch) {
      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + idToFetch);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.recipientName) {
            result = parsed;
          }
        } catch {}
      }
    }

    // Also check draft celebration if nothing found yet
    if (!result) {
      const draft = localStorage.getItem('bday_draft_celebration');
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft);
          if (parsedDraft && parsedDraft.recipientName && (!idToFetch || parsedDraft.id === idToFetch)) {
            result = parsedDraft;
          }
        } catch {}
      }
    }

    // E. Fetch from Backend API (essential for cross-device sharing)
    if (idToFetch && idToFetch !== 'bday_sample') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const apiEndpoint = API_BASE_URL
          ? `${API_BASE_URL}/api/celebrations/${encodeURIComponent(idToFetch)}`
          : `/api/celebrations/${encodeURIComponent(idToFetch)}`;

        const res = await fetch(apiEndpoint, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          if (json && json.success && json.data) {
            result = json.data;
            inMemoryCelebrationCache.set(idToFetch, json.data);
            try {
              await saveCelebrationToIndexedDB(json.data);
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Backend fetch notice:', err.message);
      }
    }

    // F. If still no result, fallback to DEFAULT_CELEBRATION
    if (!result) {
      result = { ...DEFAULT_CELEBRATION };
    }

    // G. Recover local IndexedDB video if missing or blob expired
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
  const id = data.id || `bday_${Date.now()}`;

  // Create a clean payload (exclude massive >50kb base64 to keep QR code scannable)
  const compactData = {
    id: data.id,
    recipientName: data.recipientName,
    senderName: data.senderName,
    date: data.date,
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
