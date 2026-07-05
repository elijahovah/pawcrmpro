# Blizzard AI Solutions — The AI Readiness Initiative

Cinematic 3D-scroll credibility site for **blizzardaisolutions.com** (Las Vegas, NV), featuring **The Elohim Core** and **The Readiness Assessment**, plus a rep back office.

> **Note:** this folder is parked inside `pawcrmpro` temporarily because the session's GitHub credential can't create new repositories. It is a standalone Vite app with no dependency on the surrounding repo — to give it its own home, create `blizzardaisolutions` on GitHub and copy this folder there (or ask Claude to push it once the repo exists and is added to the session).

## Run

```bash
npm install
npm run dev        # http://localhost:5173
node verify/verify.mjs   # Playwright end-to-end checks (17 scroll/CRM assertions)
```

## What's inside

- **Landing page** (`/`): Lenis smooth scroll + GSAP ScrollTrigger.
  - Hero — canvas frame-sequence scrub of a Seedance 2.0 360° turntable (`public/frames/orbit`, 121 frames @1080p); scrolling rotates the chip.
  - The Lock — scroll + live mouse-nudge scrub of the 45° lock-with-glow clip (`public/frames/lock`).
  - Crafted in Darkness story, macro detail, exploded engineering view with spec callouts, Edition of 88, private waitlist.
- **Rep portal** (`/#/portal`, access code `ELOHIM88` — demo gate, swap for real auth before production):
  - **Pipeline** — waitlist submissions land here as leads (status, assignment, of-88 counter).
  - **Training** — field doctrine modules for reps.
  - **Admin** — publish/edit/delete training modules; changes appear to reps immediately.
- Data layer is `localStorage` (`src/lib/store.ts`) — swap for an API when a backend lands.

## Adding the remaining clips

Macro fly-through and exploded assembly scenes auto-upgrade from still treatments to real footage when frames exist. After generating a clip:

```bash
ffmpeg -i macro.mp4 -vf "fps=15,scale=1600:-2" -q:v 3 public/frames/macro/frame_%04d.jpg
echo "{\"count\": $(ls public/frames/macro | grep -c jpg)}" > public/frames/macro/manifest.json
```

Same for `public/frames/exploded`. No code changes needed.

Source stills and clips live in `assets/` (hero image + orbit/lock MP4s from Higgsfield Seedance 2.0).
