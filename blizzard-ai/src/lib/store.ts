// localStorage-backed data layer shared by the public site and the portal.
// Swap these for API calls when a backend lands.

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  note: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  createdAt: string;
  assignedTo: string;
}

export interface TrainingModule {
  id: string;
  tag: string;
  title: string;
  body: string;
  updatedAt: string;
}

const LEADS_KEY = 'blizzard_leads';
const MODULES_KEY = 'blizzard_training_modules';
const SESSION_KEY = 'blizzard_portal_session';

const uid = () => Math.random().toString(36).slice(2, 10);

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---------- Leads ----------

export function getLeads(): Lead[] {
  return read<Lead[]>(LEADS_KEY, []);
}

export function addLead(input: Pick<Lead, 'name' | 'company' | 'email' | 'note'>): Lead {
  const lead: Lead = {
    id: uid(),
    ...input,
    status: 'new',
    createdAt: new Date().toISOString(),
    assignedTo: '',
  };
  const leads = getLeads();
  leads.unshift(lead);
  write(LEADS_KEY, leads);
  return lead;
}

export function updateLead(id: string, patch: Partial<Lead>): Lead[] {
  const leads = getLeads().map((l) => (l.id === id ? { ...l, ...patch } : l));
  write(LEADS_KEY, leads);
  return leads;
}

export function deleteLead(id: string): Lead[] {
  const leads = getLeads().filter((l) => l.id !== id);
  write(LEADS_KEY, leads);
  return leads;
}

// ---------- Training modules ----------

const DEFAULT_MODULES: TrainingModule[] = [
  {
    id: 'm1',
    tag: 'Module 01',
    title: 'Presenting the Readiness Assessment',
    body: 'Lead with the outcome, not the technology. The Assessment is a diagnosis of where a business loses time, and a sequenced plan to reclaim it.\n\nNever open with tooling. Open with their workflow.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'm2',
    tag: 'Module 02',
    title: 'Qualifying a Candidate',
    body: 'A qualified candidate has: (1) a repeatable process handled by people, (2) decision-maker access, (3) urgency they can name.\n\nIf any of the three is missing, nurture — do not book.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'm3',
    tag: 'Module 03',
    title: 'The Edition of 88',
    body: 'The initiative accepts eighty-eight engagements. Scarcity is real: capacity is limited by senior consulting hours, not marketing.\n\nState it plainly, once. Never pressure.',
    updatedAt: new Date().toISOString(),
  },
];

export function getModules(): TrainingModule[] {
  const existing = read<TrainingModule[] | null>(MODULES_KEY, null);
  if (existing && existing.length) return existing;
  write(MODULES_KEY, DEFAULT_MODULES);
  return DEFAULT_MODULES;
}

export function saveModule(input: Partial<TrainingModule> & { title: string; body: string; tag: string }): TrainingModule[] {
  const modules = getModules();
  const now = new Date().toISOString();
  let next: TrainingModule[];
  if (input.id) {
    next = modules.map((m) => (m.id === input.id ? { ...m, ...input, updatedAt: now } : m));
  } else {
    next = [...modules, { id: uid(), tag: input.tag, title: input.title, body: input.body, updatedAt: now }];
  }
  write(MODULES_KEY, next);
  return next;
}

export function deleteModule(id: string): TrainingModule[] {
  const next = getModules().filter((m) => m.id !== id);
  write(MODULES_KEY, next);
  return next;
}

// ---------- Portal session ----------
// Demo credential gate. Replace with real auth before production.
const PORTAL_ACCESS_CODE = 'ELOHIM88';

export function portalLogin(name: string, code: string): boolean {
  if (code.trim().toUpperCase() !== PORTAL_ACCESS_CODE) return false;
  write(SESSION_KEY, { name: name.trim() || 'Rep', at: new Date().toISOString() });
  return true;
}

export function portalSession(): { name: string } | null {
  return read<{ name: string } | null>(SESSION_KEY, null);
}

export function portalLogout() {
  localStorage.removeItem(SESSION_KEY);
}
