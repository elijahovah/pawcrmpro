import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { addLead } from '../lib/store';

gsap.registerPlugin(ScrollTrigger);

export default function Waitlist() {
  const ref = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = ref.current!;
    const tween = gsap.fromTo(
      el.querySelectorAll('.waitlist-card > *'),
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 1.1,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 55%' },
      },
    );
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, []);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addLead({
      name: String(fd.get('name') || '').trim(),
      company: String(fd.get('company') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      note: String(fd.get('note') || '').trim(),
    });
    setDone(true);
  };

  return (
    <section ref={ref} className="waitlist" id="waitlist" data-testid="waitlist-section">
      <div className="waitlist-card">
        <div className="kicker">Private Waitlist</div>
        <h2 className="display">Request Consideration</h2>
        <p className="note">
          Placement is reviewed personally. If accepted, you will hear from us
          within one week. We never follow up twice.
        </p>
        {done ? (
          <div className="confirm" data-testid="waitlist-confirm">Received. We read everything.</div>
        ) : (
          <form onSubmit={submit} data-testid="waitlist-form">
            <div className="field">
              <label htmlFor="wl-name">Name</label>
              <input id="wl-name" name="name" required autoComplete="name" />
            </div>
            <div className="field">
              <label htmlFor="wl-company">Company</label>
              <input id="wl-company" name="company" required autoComplete="organization" />
            </div>
            <div className="field">
              <label htmlFor="wl-email">Email</label>
              <input id="wl-email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="field">
              <label htmlFor="wl-note">What should be working better?</label>
              <textarea id="wl-note" name="note" rows={3} />
            </div>
            <button className="btn-gold" type="submit">Request Placement</button>
          </form>
        )}
      </div>
    </section>
  );
}
