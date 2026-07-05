import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Story() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const items = el.querySelectorAll('.reveal');
    const tweens = Array.from(items).map((item, i) =>
      gsap.fromTo(
        item,
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 1.4,
          ease: 'power3.out',
          delay: i * 0.12,
          scrollTrigger: { trigger: item, start: 'top 78%' },
        },
      ),
    );
    return () => tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
  }, []);

  return (
    <section ref={ref} className="story" id="story" data-testid="story-section">
      <div className="story-inner">
        <div className="kicker reveal">The Initiative</div>
        <h2 className="display reveal">Crafted in Darkness</h2>
        <hr className="hairline-rule reveal" style={{ margin: '0 auto 34px' }} />
        <p className="lede reveal">
          Most firms sell tools. We engineer <em>readiness</em>.
          The Elohim Core is our standard — every workflow examined,
          every component placed, nothing installed before its time.
          Built quietly, in Las Vegas, for businesses that intend to last.
        </p>
      </div>
    </section>
  );
}
