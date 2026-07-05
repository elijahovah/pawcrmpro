// Canvas frame-sequence scrubber. Loads a numbered JPEG sequence and draws
// the frame matching a 0..1 progress value, cover-fitted to the canvas.

export interface FrameSequence {
  draw: (progress: number) => void;
  ready: Promise<void>;
  frameCount: number;
}

export function createFrameSequence(
  canvas: HTMLCanvasElement,
  urlForFrame: (i: number) => string,
  frameCount: number,
): FrameSequence {
  const ctx = canvas.getContext('2d')!;
  const images: (HTMLImageElement | null)[] = new Array(frameCount).fill(null);
  let lastDrawn = -1;

  const load = (i: number) =>
    new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        images[i] = img;
        resolve();
      };
      img.onerror = () => resolve();
      img.src = urlForFrame(i);
    });

  // First frame synchronously prioritized, rest in parallel.
  const ready = load(0).then(async () => {
    drawFrame(0);
    await Promise.all(Array.from({ length: frameCount - 1 }, (_, k) => load(k + 1)));
  });

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { clientWidth, clientHeight } = canvas;
    if (canvas.width !== clientWidth * dpr || canvas.height !== clientHeight * dpr) {
      canvas.width = clientWidth * dpr;
      canvas.height = clientHeight * dpr;
    }
  }

  function drawFrame(i: number) {
    const img = images[i] ?? images[lastDrawn] ?? images[0];
    if (!img) return;
    resize();
    const cw = canvas.width;
    const ch = canvas.height;
    const scale = Math.max(cw / img.width, ch / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    if (images[i]) lastDrawn = i;
  }

  return {
    frameCount,
    ready,
    draw(progress: number) {
      const i = Math.max(0, Math.min(frameCount - 1, Math.round(progress * (frameCount - 1))));
      drawFrame(i);
    },
  };
}
