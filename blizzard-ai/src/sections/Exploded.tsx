import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { mountScrubScene } from '../lib/scrubScene';

gsap.registerPlugin(ScrollTrigger);

const SPECS = [
  { num: '24k', label: 'Brushed gold housing', pos: { left: '10%', top: '22%' } },
  { num: '45°', label: 'Platinum core, set to lock', pos: { right: '12%', top: '30%' } },
  { num: '217', label: 'Precision components', pos: { left: '14%', bottom: '24%' } },
  { num: '72h', label: 'Readiness reserve', pos: { right: '10%', bottom: '18%' } },
];

// Exploded engineering view — scrubs the assembly clip when present; spec
// callouts draw in at staggered scroll positions either way.
export default function Exploded() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    let scene: { kill: () => void } = { kill: () => {} };

    mountScrubScene({
      root,
      canvas: canvasRef.current!,
      framesPath: '/frames/exploded',
      fallbackImage: '/hero-chip.png',
      fallback: { zoomFrom: 1.35, zoomTo: 1.05, panX: -0.1, panY: 0.08 },
    }).then((s) => (scene = s));

    const callouts = root.querySelectorAll('.spec-callout');
    const triggers: ScrollTrigger[] = [];
    callouts.forEach((el, i) => {
      const startP = 0.18 + i * 0.16;
      triggers.push(
        ScrollTrigger.create({
          trigger: root,
          start: `${startP * 100}% bottom`,
          onEnter: () => {
            gsap.to(el, { opacity: 1, duration: 0.9, ease: 'power2.out' });
            gsap.to(el.querySelector('.spec-line'), { scaleX: 1, duration: 0.8, ease: 'power3.out' });
          },
        }),
      );
    });

    return () => {
      scene.kill();
      triggers.forEach((t) => t.kill());
    };
  }, []);

  return (
    <div ref={rootRef} className="scene" style={{ height: '380vh' }} id="engineering" data-testid="exploded-scene">
      <div className="scene-sticky">
        <canvas ref={canvasRef} className="scene-canvas" data-testid="exploded-canvas" />
        <div className="hero-veil" />
        <div className="macro-copy left" style={{ top: '14%', transform: 'none' }}>
          <div className="kicker">The Engineering</div>
          <h3 className="serif">Assembled, not installed.</h3>
        </div>
        {SPECS.map((s) => (
          <div key={s.label} className="spec-callout" style={s.pos as React.CSSProperties} data-testid="spec-callout">
            <div className="spec-line" />
            <div className="spec-num serif">{s.num}</div>
            <div className="spec-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
