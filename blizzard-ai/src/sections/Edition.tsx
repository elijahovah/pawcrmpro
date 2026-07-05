import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Edition() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const tweens = [
      gsap.fromTo(
        el.querySelector('.edition-number'),
        { opacity: 0, scale: 0.94 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 60%' },
        },
      ),
      gsap.fromTo(
        el.querySelectorAll('.edition-overlay > *'),
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.14,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 45%' },
        },
      ),
    ];
    return () => tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
  }, []);

  return (
    <section ref={ref} className="edition" id="edition" data-testid="edition-section">
      <div className="edition-inner">
        <span className="edition-number">88</span>
        <div className="edition-overlay">
          <div className="kicker">The Readiness Assessment</div>
          <h2 className="display">Edition of 88</h2>
          <p>
            Eighty-eight engagements. Each concludes with the Readiness
            Assessment — a sealed report of where you stand, and the order
            in which to move. Then the ledger closes.
          </p>
        </div>
      </div>
    </section>
  );
}
