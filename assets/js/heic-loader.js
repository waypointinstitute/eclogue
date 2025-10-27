const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const HEIC_PATTERN = /\.(heic|heif)$/i;

function processHeicImages(root = document) {
  const images = root.querySelectorAll('img[data-heic-src]:not([data-heic-processing])');
  images.forEach((img) => {
    if (!img.dataset.heicSrc || img.dataset.heicProcessed === 'true') return;
    img.dataset.heicProcessing = 'true';
    convertHeicImage(img);
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
      const result = await window.heic2any({ blob, toType: 'image/webp', quality: 0.9 });
      if (Array.isArray(result)) {
        outputBlob = result[0] ?? null;
      } else if (result instanceof Blob) {
        outputBlob = result;
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
        outputBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
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
    delete img.dataset.heicProcessing;
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
