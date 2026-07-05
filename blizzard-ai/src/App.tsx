import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from './sections/Hero';
import Story from './sections/Story';
import Lock from './sections/Lock';
import Macro from './sections/Macro';
import Exploded from './sections/Exploded';
import Edition from './sections/Edition';
import Waitlist from './sections/Waitlist';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <nav className="nav">
        <a href="#top" className="wordmark">Blizzard</a>
        <div className="nav-right">
          <a href="#story">Initiative</a>
          <a href="#engineering">Engineering</a>
          <a href="#waitlist">Waitlist</a>
          <a href="#/portal">Portal</a>
        </div>
      </nav>
      <main id="top">
        <Hero />
        <Story />
        <Lock />
        <Macro />
        <Exploded />
        <Edition />
        <Waitlist />
      </main>
      <footer className="footer">
        <span>Blizzard AI Solutions · Las Vegas, Nevada</span>
        <span>The AI Readiness Initiative</span>
        <a href="#/portal">Rep Portal</a>
      </footer>
    </>
  );
}
