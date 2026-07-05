// Shared helper: a pinned scene whose canvas scrubs a frame sequence with
// scroll progress; falls back to a scroll-driven pan/zoom of a still image
// when the sequence hasn't been rendered yet.

import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createFrameSequence } from './frames';

export interface ScrubSceneOptions {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  framesPath: string; // e.g. '/frames/macro'
  fallbackImage: string;
  // Fallback motion: pan from -> to (relative center offsets) while zooming.
  fallback?: { zoomFrom: number; zoomTo: number; panX?: number; panY?: number };
  scrub?: number;
  onProgress?: (p: number) => void;
  extraProgress?: () => number; // additive nudge (e.g. pointer), 0..0.1
}

export async function mountScrubScene(opts: ScrubSceneOptions) {
  const { root, canvas, framesPath, fallbackImage } = opts;
  const fb = { zoomFrom: 1.15, zoomTo: 1.65, panX: 0.12, panY: -0.06, ...(opts.fallback ?? {}) };
  let draw: (p: number) => void;
  let killed = false;

  try {
    const res = await fetch(`${framesPath}/manifest.json`);
    if (!res.ok) throw new Error('no manifest');
    const { count } = (await res.json()) as { count: number };
    const seq = createFrameSequence(
      canvas,
      (i) => `${framesPath}/frame_${String(i + 1).padStart(4, '0')}.jpg`,
      count,
    );
    await seq.ready;
    draw = (p) => seq.draw(p);
  } catch {
    const img = new Image();
    img.src = fallbackImage;
    await new Promise((r) => { img.onload = r; img.onerror = r; });
    const ctx = canvas.getContext('2d')!;
    draw = (p) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      const zoom = fb.zoomFrom + (fb.zoomTo - fb.zoomFrom) * p;
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height) * zoom;
      const w = img.width * scale;
      const h = img.height * scale;
      const ox = (canvas.width - w) / 2 + fb.panX! * canvas.width * (p - 0.5);
      const oy = (canvas.height - h) / 2 + fb.panY! * canvas.height * (p - 0.5);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, ox, oy, w, h);
    };
  }
  if (killed) return { kill: () => {} };

  let base = 0;
  const render = () => {
    const extra = opts.extraProgress ? opts.extraProgress() : 0;
    const p = Math.max(0, Math.min(1, base + extra));
    draw(p);
    opts.onProgress?.(p);
  };
  draw(0);

  const st = ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: 'bottom bottom',
    scrub: opts.scrub ?? 0.6,
    onUpdate: (self) => {
      base = self.progress;
      render();
    },
  });

  const onResize = () => render();
  window.addEventListener('resize', onResize);

  return {
    rerender: render,
    kill() {
      killed = true;
      st.kill();
      window.removeEventListener('resize', onResize);
    },
  };
}
