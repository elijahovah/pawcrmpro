import { useState } from 'react';
import { portalLogin, portalLogout, portalSession } from '../lib/store';
import Pipeline from './Pipeline';
import Training from './Training';
import Admin from './Admin';

type Tab = 'pipeline' | 'training' | 'admin';

export default function Portal() {
  const [session, setSession] = useState(portalSession());
  const [tab, setTab] = useState<Tab>('pipeline');
  const [err, setErr] = useState('');

  if (!session) {
    return (
      <div className="portal-login" data-testid="portal-login">
        <div className="login-card">
          <div className="kicker">Blizzard AI Solutions</div>
          <h1 className="display">Rep Portal</h1>
          <p>Back office access for initiative representatives.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const ok = portalLogin(String(fd.get('name') || ''), String(fd.get('code') || ''));
              if (ok) setSession(portalSession());
              else setErr('That access code is not recognized.');
            }}
          >
            <div className="field">
              <label htmlFor="pl-name">Your name</label>
              <input id="pl-name" name="name" required />
            </div>
            <div className="field">
              <label htmlFor="pl-code">Access code</label>
              <input id="pl-code" name="code" type="password" required placeholder="••••••••" />
            </div>
            {err && <div className="err" data-testid="login-error">{err}</div>}
            <button className="btn-gold" type="submit">Enter</button>
          </form>
          <p style={{ marginTop: 28 }}><a href="#top" style={{ color: 'var(--ink-dim)' }}>← Return to site</a></p>
        </div>
      </div>
    );
  }

  return (
    <div className="portal" data-testid="portal">
      <header className="portal-top">
        <div className="wordmark">
          Blizzard <small>Rep Portal — {session.name}</small>
        </div>
        <nav className="portal-tabs">
          <button className={tab === 'pipeline' ? 'active' : ''} onClick={() => setTab('pipeline')} data-testid="tab-pipeline">Pipeline</button>
          <button className={tab === 'training' ? 'active' : ''} onClick={() => setTab('training')} data-testid="tab-training">Training</button>
          <button className={tab === 'admin' ? 'active' : ''} onClick={() => setTab('admin')} data-testid="tab-admin">Admin</button>
          <button onClick={() => { portalLogout(); setSession(null); }}>Sign out</button>
          <button onClick={() => { window.location.hash = ''; }}>Site</button>
        </nav>
      </header>
      <main className="portal-main">
        {tab === 'pipeline' && <Pipeline />}
        {tab === 'training' && <Training />}
        {tab === 'admin' && <Admin />}
      </main>
    </div>
  );
}
