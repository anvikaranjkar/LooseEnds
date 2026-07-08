# Loose Ends — demo

A scoped, playable slice of the full concept: power on John's old laptop, watch the BIOS/XP boot sequence, then explore a desktop where every icon is a small dose of the bureaucracy his family now has to untangle — a locked documents folder, an Instagram nobody can log into, a Netflix profile with declined billing, MyGov timing out. Fatigue builds until a hidden trigger appears near the base of the monitor. Click it for the reveal.

No build step. No dependencies. Plain HTML/CSS/JS.

## Run locally
Just open `index.html` in a browser, or serve it:
```
npx serve .
```

## Deploy to Vercel
**Option A — CLI (fastest):**
```
npm i -g vercel   # if you don't have it
cd loose-ends
vercel
```
Accept the defaults — Vercel auto-detects a static site (no framework, no build command needed).

**Option B — GitHub:**
1. Push this folder to a new GitHub repo.
2. Go to vercel.com → New Project → import the repo.
3. Framework preset: "Other". Leave build command blank, output directory blank.
4. Deploy.

## Swapping assets
- `assets/logo.svg` — swap with your own logo any time; nothing else references branding directly.
- `assets/wallpaper.jpg`, `assets/room-bg.jpg`, `assets/instagram.jpg`, `assets/netflix.jpg`, `assets/death-certificate.jpg` — replace in place, same filenames, no code changes needed.

## Where this sits in the bigger vision
This is the "laptop scene" — one complete emotional arc (boot → mounting dread → hidden discovery → reveal) built to demo well on its own. The full pitch doc describes a much larger game (the apartment, phone calls with support reps, the secret room, etc.) — this slice is deliberately the highest-leverage piece for a 6-hour solo build and a live demo in front of judges.

Ideas for next passes, roughly in order of payoff:
1. Draggable windows + a couple more "customer service" chat windows (bank, insurance) for more escalation before the reveal.
2. A short intro card before boot: "Emma. Two days after the funeral." — grounds the player in whose apartment this is.
3. Real ambient audio bed (rain, hum) via Howler.js once you're not counting every request against a budget.
4. The physical apartment (pre-laptop) as its own scene, feeding into this one.
