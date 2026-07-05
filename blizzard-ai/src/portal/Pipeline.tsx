import { useState } from 'react';
import { getLeads, updateLead, deleteLead, type Lead } from '../lib/store';

const STATUSES: Lead['status'][] = ['new', 'contacted', 'qualified', 'closed'];

export default function Pipeline() {
  const [leads, setLeads] = useState<Lead[]>(getLeads());

  const counts = {
    total: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    qualified: leads.filter((l) => l.status === 'qualified').length,
    closed: leads.filter((l) => l.status === 'closed').length,
  };

  return (
    <section data-testid="pipeline">
      <h2 className="portal-h serif">Pipeline</h2>
      <p className="portal-sub">Waitlist requests from the site land here as leads.</p>

      <div className="stat-row">
        <div className="stat-cell"><div className="stat-num">{counts.total}</div><div className="stat-label">Requests</div></div>
        <div className="stat-cell"><div className="stat-num">{counts.new}</div><div className="stat-label">New</div></div>
        <div className="stat-cell"><div className="stat-num">{counts.qualified}</div><div className="stat-label">Qualified</div></div>
        <div className="stat-cell"><div className="stat-num">{88 - counts.closed}</div><div className="stat-label">Of 88 remaining</div></div>
      </div>

      {leads.length === 0 ? (
        <div className="empty" data-testid="pipeline-empty">
          No requests yet. Waitlist submissions from the landing page appear here.
        </div>
      ) : (
        <table className="leads" data-testid="leads-table">
          <thead>
            <tr>
              <th>Prospect</th><th>Company</th><th>Note</th><th>Status</th><th>Assigned</th><th>Received</th><th />
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id}>
                <td className="lead-name">
                  {l.name}
                  <div className="lead-email">{l.email}</div>
                </td>
                <td>{l.company}</td>
                <td style={{ maxWidth: 260, color: 'var(--ink-dim)', fontSize: 13 }}>{l.note || '—'}</td>
                <td>
                  <select
                    value={l.status}
                    onChange={(e) => setLeads(updateLead(l.id, { status: e.target.value as Lead['status'] }))}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div style={{ marginTop: 8 }}><span className={`status-pill ${l.status}`}>{l.status}</span></div>
                </td>
                <td>
                  <input
                    style={{ width: 110 }}
                    defaultValue={l.assignedTo}
                    placeholder="rep name"
                    onBlur={(e) => setLeads(updateLead(l.id, { assignedTo: e.target.value }))}
                  />
                </td>
                <td style={{ fontSize: 12, color: 'var(--ink-dim)' }}>{new Date(l.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="btn-ghost danger" onClick={() => setLeads(deleteLead(l.id))}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
