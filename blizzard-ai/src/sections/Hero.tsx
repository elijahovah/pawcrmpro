import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createFrameSequence } from '../lib/frames';

gsap.registerPlugin(ScrollTrigger);

const BRAND = 'BLIZZARD';

// Scroll-scrubbed hero: the orbit clip is baked to a JPEG frame sequence in
// /frames/orbit (manifest.json holds the count). Scrolling scrubs the
// turntable so the chip rotates under the visitor's finger. If the sequence
// isn't present yet, the hero still image gets a slow scroll-driven push-in.
export default function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const canvas = canvasRef.current!;
    let killed = false;
    const triggers: ScrollTrigger[] = [];

    // Brand letters track in.
    const letters = root.querySelectorAll('.brand-track span');
    gsap.fromTo(
      letters,
      { yPercent: 110, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1.6, ease: 'power4.out', stagger: 0.055, delay: 0.3 },
    );
    gsap.fromTo(
      root.querySelectorAll('.hero-sub, .scroll-cue'),
      { opacity: 0 },
      { opacity: 1, duration: 1.4, ease: 'power2.out', delay: 1.5 },
    );

    async function setup() {
      let progress = { p: 0 };
      let draw: (p: number) => void;

      try {
        const res = await fetch('/frames/orbit/manifest.json');
        if (!res.ok) throw new Error('no manifest');
        const { count } = (await res.json()) as { count: number };
        const seq = createFrameSequence(
          canvas,
          (i) => `/frames/orbit/frame_${String(i + 1).padStart(4, '0')}.jpg`,
          count,
        );
        await seq.ready;
        draw = (p) => seq.draw(p);
      } catch {
        // Fallback: slow push-in on the hero still.
        const img = new Image();
        img.src = '/hero-chip.png';
        await new Promise((r) => { img.onload = r; img.onerror = r; });
        const ctx = canvas.getContext('2d')!;
        draw = (p) => {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          canvas.width = canvas.clientWidth * dpr;
          canvas.height = canvas.clientHeight * dpr;
          const zoom = 1 + p * 0.18;
          const scale = Math.max(canvas.width / img.width, canvas.height / img.height) * zoom;
          const w = img.width * scale;
          const h = img.height * scale;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
        };
      }
      if (killed) return;

      draw(0);
      const st = ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        onUpdate: (self) => {
          progress.p = self.progress;
          draw(self.progress);
        },
      });
      triggers.push(st);

      // Copy recedes as the orbit begins.
      triggers.push(
        ScrollTrigger.create({
          trigger: root,
          start: 'top top',
          end: '30% top',
          scrub: true,
          animation: gsap.to(root.querySelector('.hero-copy'), {
            opacity: 0,
            yPercent: -12,
            ease: 'none',
          }),
        }),
      );

      const onResize = () => draw(progress.p);
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }

    const cleanupPromise = setup();
    return () => {
      killed = true;
      triggers.forEach((t) => t.kill());
      cleanupPromise.then((fn) => fn && fn());
    };
  }, []);

  return (
    <div ref={rootRef} className="scene" style={{ height: '400vh' }} data-testid="hero-scene">
      <div className="scene-sticky hero">
        <canvas ref={canvasRef} data-testid="hero-canvas" />
        <div className="hero-veil" />
        <div className="hero-copy">
          <div className="kicker">Blizzard AI Solutions · Las Vegas</div>
          <h1 className="brand-track" aria-label={BRAND} style={{ marginTop: 22 }}>
            {BRAND.split('').map((c, i) => (
              <span key={i}>{c}</span>
            ))}
          </h1>
          <div className="hero-sub">The AI Readiness Initiative</div>
        </div>
        <div className="scroll-cue">Scroll</div>
      </div>
    </div>
  );
}
