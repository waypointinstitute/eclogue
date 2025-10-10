import { gameState } from '@core/state';

class AmbientTrack {
  private audio: HTMLAudioElement;

  constructor(src: string, volume = 0.4) {
    this.audio = new Audio(src);
    this.audio.loop = true;
    this.audio.volume = volume;
  }

  play() {
    void this.audio.play().catch(() => {
      /* autoplay disabled */
    });
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
  }
}

const SILENCE = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';

const tracks: Record<string, AmbientTrack> = {
  waking: new AmbientTrack(SILENCE),
  dream: new AmbientTrack(SILENCE),
  meta: new AmbientTrack(SILENCE)
};

let currentTrack: AmbientTrack | null = null;

export function updateAudioLayer() {
  const layer = gameState.layer;
  if (layer === 'menu') {
    currentTrack?.stop();
    currentTrack = null;
    return;
  }
  const next = tracks[layer];
  if (currentTrack !== next) {
    currentTrack?.stop();
    currentTrack = next;
    currentTrack?.play();
  }
}
