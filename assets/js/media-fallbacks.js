const HEIC_PATTERN = /(\.heic|\.heif)(?:$|[?#])/i;
let heicLoaderPromise = null;

function normalizeFallbackValue(value) {
  return typeof value === 'string' && value.trim().length ? value : null;
}

async function loadHeic2Any() {
  if (window.heic2any) return window.heic2any;
  if (!heicLoaderPromise) {
    heicLoaderPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
      script.async = true;
      script.onload = () => resolve(window.heic2any);
      script.onerror = () => reject(new Error('Failed to load heic2any library'));
      document.head.appendChild(script);
    }).catch((error) => {
      console.error(error);
      return null;
    });
  }
  return heicLoaderPromise;
}

async function convertHeicToJpeg(url) {
  const heic2any = await loadHeic2Any();
  if (!heic2any) return null;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch HEIC asset: ${response.status}`);
  const buffer = await response.arrayBuffer();
  const blob = new Blob([buffer], { type: 'image/heic' });
  const result = await heic2any({ blob, toType: 'image/jpeg', quality: 0.9 });

  const pickBlob = (value) => {
    if (!value) return null;
    if (value instanceof Blob) return value;
    if (value instanceof ArrayBuffer) return new Blob([value], { type: 'image/jpeg' });
    if (Array.isArray(value)) {
      for (const item of value) {
        const blobCandidate = pickBlob(item);
        if (blobCandidate) return blobCandidate;
      }
    }
    if (typeof value === 'object' && value.blob instanceof Blob) {
      return value.blob;
    }
    return null;
  };

  const jpegBlob = pickBlob(result);
  if (!jpegBlob) return null;
  return URL.createObjectURL(jpegBlob);
}

async function handleFallback(img) {
  if (!img || img.dataset.fallbackHandled === 'true') return;
  img.dataset.fallbackHandled = 'true';

  const fallback = normalizeFallbackValue(img.getAttribute('data-fallback'));
  const placeholder = normalizeFallbackValue(img.getAttribute('data-placeholder'));

  if (!fallback) {
    if (placeholder) img.src = placeholder;
    return;
  }

  if (HEIC_PATTERN.test(fallback)) {
    try {
      const blobUrl = await convertHeicToJpeg(fallback);
      if (blobUrl) {
        if (img.dataset.fallbackBlobUrl) {
          URL.revokeObjectURL(img.dataset.fallbackBlobUrl);
        }
        img.dataset.fallbackBlobUrl = blobUrl;
        img.src = blobUrl;
        return;
      }
    } catch (error) {
      console.warn('HEIC conversion failed for', fallback, error);
    }
    if (placeholder) {
      img.src = placeholder;
    }
  } else {
    img.src = fallback;
  }
}

function watchImage(img) {
  if (!img) return;
  const fallback = normalizeFallbackValue(img.getAttribute('data-fallback'));
  if (!fallback) return;

  const onError = () => handleFallback(img);
  img.addEventListener('error', onError, { once: true });

  if (img.complete && (!img.naturalWidth || img.naturalWidth === 0)) {
    window.requestAnimationFrame(() => handleFallback(img));
  }
}

function applyMediaFallbacks(root = document) {
  const scope = root instanceof Element ? root : document;
  scope.querySelectorAll('img[data-fallback]').forEach(watchImage);
}

window.applyMediaFallbacks = applyMediaFallbacks;

document.addEventListener('DOMContentLoaded', () => {
  applyMediaFallbacks(document);
});

window.addEventListener('beforeunload', () => {
  document.querySelectorAll('img[data-fallback-blob-url]').forEach((img) => {
    URL.revokeObjectURL(img.dataset.fallbackBlobUrl);
  });
});
