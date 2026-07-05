import { useState } from 'react';
import { getModules } from '../lib/store';

export default function Training() {
  const [modules] = useState(getModules());

  return (
    <section data-testid="training">
      <h2 className="portal-h serif">Training</h2>
      <p className="portal-sub">Field doctrine for representatives. Content is managed in Admin.</p>
      <div className="training-grid">
        {modules.map((m) => (
          <article key={m.id} className="module-card" data-testid="module-card">
            <div className="mod-tag">{m.tag}</div>
            <h3 className="serif">{m.title}</h3>
            <p>{m.body}</p>
            <div className="mod-meta">Updated {new Date(m.updatedAt).toLocaleDateString()}</div>
          </article>
        ))}
      </div>
    </section>
  );
}
