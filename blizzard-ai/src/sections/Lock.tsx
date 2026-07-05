import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mountScrubScene } from '../lib/scrubScene';

gsap.registerPlugin(ScrollTrigger);

// "The Lock" — scrub of the vault-lock clip: the platinum layer rotates 45°
// and seats into the gold base with a glow. Scroll drives the mechanism;
// pointer movement adds a live nudge so the motion follows the mouse.
export default function Lock() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerNudge = useRef(0);

  useEffect(() => {
    const root = rootRef.current!;
    let scene: { kill: () => void; rerender?: () => void } = { kill: () => {} };
    let raf = 0;

    mountScrubScene({
      root,
      canvas: canvasRef.current!,
      framesPath: '/frames/lock',
      fallbackImage: '/hero-chip.png',
      fallback: { zoomFrom: 1.05, zoomTo: 1.3, panX: 0, panY: 0.04 },
      extraProgress: () => pointerNudge.current,
    }).then((s) => (scene = s));

    let target = 0;
    const onMove = (e: PointerEvent) => {
      // Horizontal mouse position maps to a ±6% nudge of the mechanism.
      target = (e.clientX / window.innerWidth - 0.5) * 0.12;
    };
    const tick = () => {
      pointerNudge.current += (target - pointerNudge.current) * 0.08;
      scene.rerender?.();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener('pointermove', onMove);

    const copy = root.querySelector('.macro-copy');
    const tween = gsap.fromTo(
      copy,
      { opacity: 0, x: -30 },
      {
        opacity: 1,
        x: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: { trigger: root, start: 'top 40%' },
      },
    );

    return () => {
      scene.kill();
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div ref={rootRef} className="scene" style={{ height: '350vh' }} data-testid="lock-scene">
      <div className="scene-sticky">
        <canvas ref={canvasRef} className="scene-canvas" data-testid="lock-canvas" />
        <div className="hero-veil" />
        <div className="macro-copy left">
          <div className="kicker">The Mechanism</div>
          <h3 className="serif">Forty-five degrees.<br />Then it locks.</h3>
          <p>
            Readiness is a mechanism, not a mood. When every element is seated,
            the whole system turns once — and holds. Move your cursor. It answers.
          </p>
        </div>
      </div>
    </div>
  );
}
