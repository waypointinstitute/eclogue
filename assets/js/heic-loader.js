const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const HEIC_PATTERN = /\.(heic|heif)$/i;
const JPEG_TYPE = 'image/jpeg';

let heicObserver = null;

function ensureObserver() {
  if (heicObserver) return heicObserver;
  if ('IntersectionObserver' in window) {
    heicObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        heicObserver?.unobserve(img);
        queueConversion(img);
      });
    }, {
      rootMargin: '200px 0px'
    });
  }
  return heicObserver;
}

function normalizeHeicResult(result) {
  if (!result) return null;
  if (result instanceof Blob) return result;
  if (result instanceof ArrayBuffer) return new Blob([result], { type: JPEG_TYPE });
  if (ArrayBuffer.isView(result)) {
    const { buffer, byteOffset, byteLength } = result;
    const slice = buffer.slice(byteOffset, byteOffset + byteLength);
    return new Blob([slice], { type: JPEG_TYPE });
  }
  return null;
}

function processHeicImages(root = document) {
  const images = root.querySelectorAll('img[data-heic-src]');
  images.forEach((img) => {
    if (!img.dataset.heicSrc || img.dataset.heicProcessed === 'true') return;
    if (img.dataset.heicQueued === 'true') return;
    img.dataset.heicQueued = 'true';

    const observer = ensureObserver();
    if (observer) {
      observer.observe(img);
    } else {
      queueConversion(img);
    }
  });
}

function queueConversion(img) {
  if (!img || img.dataset.heicProcessed === 'true' || img.dataset.heicProcessing === 'true') return;
  img.dataset.heicProcessing = 'true';
  convertHeicImage(img).finally(() => {
    delete img.dataset.heicProcessing;
  });
}

async function convertHeicImage(img) {
  const src = img.dataset.heicSrc;
  const fallback = img.dataset.heicFallback || img.getAttribute('src') || TRANSPARENT_PIXEL;

  try {
    const response = await fetch(src);
    if (!response.ok) throw new Error(`Failed to load HEIC asset: ${src}`);
    const blob = await response.blob();

    let outputBlob = null;

    if (typeof window.heic2any === 'function') {
      const result = await window.heic2any({ blob, toType: JPEG_TYPE, quality: 0.9 });
      if (Array.isArray(result)) {
        outputBlob = normalizeHeicResult(result[0]);
      } else {
        outputBlob = normalizeHeicResult(result);
      }
    }

    if (!outputBlob && typeof window.createImageBitmap === 'function') {
      try {
        const bitmap = await window.createImageBitmap(blob);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const context = canvas.getContext('2d');
        context.drawImage(bitmap, 0, 0);
        outputBlob = await new Promise((resolve) => canvas.toBlob(resolve, JPEG_TYPE, 0.92));
      } catch (bitmapError) {
        console.warn('createImageBitmap could not decode HEIC image', bitmapError);
      }
    }

    if (!outputBlob) throw new Error('No HEIC conversion pipeline available');

    const objectUrl = URL.createObjectURL(outputBlob);
    const revoke = () => {
      URL.revokeObjectURL(objectUrl);
      img.removeEventListener('load', revoke);
      img.removeEventListener('error', revoke);
    };
    img.addEventListener('load', revoke);
    img.addEventListener('error', revoke);
    img.src = objectUrl;
    img.dataset.heicProcessed = 'true';
  } catch (error) {
    console.warn('HEIC conversion failed, falling back to provided image.', error);
    img.src = fallback;
    img.dataset.heicProcessed = 'false';
  } finally {
    delete img.dataset.heicQueued;
  }
}

function applyHeicSource(img, src, fallback) {
  if (!img || !src) return;
  if (HEIC_PATTERN.test(src)) {
    img.dataset.heicSrc = src;
    if (fallback) {
      img.dataset.heicFallback = fallback;
      img.src = fallback;
    } else if (!img.getAttribute('src')) {
      img.src = TRANSPARENT_PIXEL;
    }
    queueConversion(img);
  } else {
    img.src = src;
  }
}

window.applyHeicSource = applyHeicSource;
window.processHeicImages = () => processHeicImages(document);

document.addEventListener('DOMContentLoaded', () => {
  processHeicImages(document);
});

document.addEventListener('heic:refresh', () => {
  processHeicImages(document);
});
