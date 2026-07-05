import { useState } from 'react';
import { getModules, saveModule, deleteModule, type TrainingModule } from '../lib/store';

const EMPTY = { id: '', tag: '', title: '', body: '' };

export default function Admin() {
  const [modules, setModules] = useState<TrainingModule[]>(getModules());
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    setModules(
      saveModule({
        id: form.id || undefined,
        tag: form.tag.trim() || `Module ${String(modules.length + 1).padStart(2, '0')}`,
        title: form.title.trim(),
        body: form.body,
      }),
    );
    setForm(EMPTY);
  };

  return (
    <section data-testid="admin">
      <h2 className="portal-h serif">Admin</h2>
      <p className="portal-sub">Publish and edit the training area. Changes appear to reps immediately.</p>

      <form className="admin-form" onSubmit={submit} data-testid="admin-form">
        <div className="row">
          <div>
            <label htmlFor="ad-tag">Tag</label>
            <input id="ad-tag" style={{ width: '100%' }} value={form.tag}
              onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="Module 04" />
          </div>
          <div>
            <label htmlFor="ad-title">Title</label>
            <input id="ad-title" style={{ width: '100%' }} value={form.title} required
              onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Handling objections" />
          </div>
        </div>
        <div>
          <label htmlFor="ad-body">Content</label>
          <textarea id="ad-body" style={{ width: '100%' }} value={form.body} required
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Write the training content reps will see…" />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-gold" type="submit" style={{ marginTop: 0 }} data-testid="admin-save">
            {form.id ? 'Save changes' : 'Publish module'}
          </button>
          {form.id && (
            <button type="button" className="btn-ghost" onClick={() => setForm(EMPTY)}>Cancel edit</button>
          )}
        </div>
      </form>

      {modules.map((m) => (
        <div key={m.id} className="admin-list-item" data-testid="admin-module-row">
          <div>
            <div className="kicker" style={{ fontSize: 9 }}>{m.tag}</div>
            <div className="ali-title">{m.title}</div>
          </div>
          <div className="ali-actions">
            <button className="btn-ghost" onClick={() => setForm({ id: m.id, tag: m.tag, title: m.title, body: m.body })}>
              Edit
            </button>
            <button className="btn-ghost danger" onClick={() => setModules(deleteModule(m.id))}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}
