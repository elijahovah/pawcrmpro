import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mountScrubScene } from '../lib/scrubScene';

gsap.registerPlugin(ScrollTrigger);

// Macro fly-through scene — scrubs the macro clip when its frames exist,
// otherwise a slow scroll-driven macro push across the 2K hero still.
export default function Macro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    let scene: { kill: () => void } = { kill: () => {} };

    mountScrubScene({
      root,
      canvas: canvasRef.current!,
      framesPath: '/frames/macro',
      fallbackImage: '/hero-chip.png',
      fallback: { zoomFrom: 1.6, zoomTo: 2.6, panX: 0.3, panY: -0.12 },
    }).then((s) => (scene = s));

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
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <div ref={rootRef} className="scene" style={{ height: '350vh' }} id="craft" data-testid="macro-scene">
      <div className="scene-sticky">
        <canvas ref={canvasRef} className="scene-canvas" data-testid="macro-canvas" />
        <div className="hero-veil" />
        <div className="macro-copy left">
          <div className="kicker">The Detail</div>
          <h3 className="serif">Nothing is decorative.</h3>
          <p>
            Every trace under the sapphire carries load. Our assessments read a
            business the same way — at magnification, where the losses live.
          </p>
        </div>
      </div>
    </div>
  );
}
