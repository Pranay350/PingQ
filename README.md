# ⚡ PingQ // Intelligent Event Curation & Footfall Platform

A full-fledged working prototype for **Event Curation, Live Footfall Tracking, Dynamic Zone Boosting, and QR Reward Ecosystem**.

Built with an editorial minimalist stone/cream aesthetic, signature electric lime highlights, deep obsidian typography, real-time reactive architecture, and full Supabase compatibility.

---

## 🚀 Quick Start (Instant Launch)

You can run the prototype in two ways:

### Option A: With Node.js Server (Recommended for multi-device / multi-tab live sync)
Open your terminal in this directory and run:
```bash
node server.js
```
Then open your browser at:
👉 **[http://localhost:3000](http://localhost:3000)**

*(Zero external npm dependencies required — uses Node.js standard runtime with built-in SSE and REST APIs)*

### Option B: Standalone Direct Launch
Simply double-click:
👉 `public/index.html`
It runs with the built-in reactive client engine (`localStorage` + `BroadcastChannel`) without needing any local server!

---

## 🎯 Key Features & Requirements Covered

### 1. Editorial Landing Page (Matching Screenshots)
* **Visual Language:** Warm minimalist stone/cream aesthetic (`#f0ece1`), deep ink typography, and high-impact **Electric Lime / Chartreuse** (`#c6ff00`) highlight boxes.
* **Hero Section:**
  * Punchy typographic headline: `Scan once.` / `[Skip the crowd.]` / `[Stay safe.]` with authentic neon highlighter blocks.
  * Subhead explaining multi-venue utility: *"One QR scan gives you a live token, zone check-ins and a one-tap way to call medical help, at a festival stall or a hospital counter."*
  * **Authentic Wristband Card (from Screenshot 1):** `TECHNOVA '26 · BAND`, `■ CHECKED IN` indicator, centered procedural QR code canvas (`PQ-7F3K`), `HOLDER: Aarav S.`, `POINTS: 170`, `STALLS: 6/24`, and the dynamic `Art walk is on 2x points for the next 30 min.` boost alert ticker.
* **3 Feature Columns (from Screenshot 2 top):**
  * `01 · QUEUES Intelligent queues` (`■ 81 IN STALL QUEUES NOW`)
  * `02 · FLOW Crowd & patient flow` (`■ 2 ZONES HEAVY · 1107 INSIDE`)
  * `03 · SAFETY Medical assistance` (`■ 0 OPEN ALERTS`)
* **Interactive Two Workflows Comparison (from Screenshot 2 bottom):**
  * Section title: `Same scan. Two workflows.`
  * Interactive environment switcher (`[Events & Campuses]` vs `[Hospitals & Clinics]`).
  * Live comparison table featuring the signature **electric lime underline highlight** tracking the active environment or tapped row.

### 2. Dummy Staff & Consumer Login System
* **Quick 1-Click Hero Buttons:**
  * `[👤 Login as Consumer (Aarav S. - 170 pts)]`: Enters Aarav's personal portal with his pass and points.
  * `[📊 Login as Staff Hub (Elena R.)]`: Enters the Lead Event Curator command center with live headcounts and zone boosting.
* **Global Dummy Login Modal:**
  * Click **"Dummy Login"** in the top navigation to switch accounts anytime.
  * **Consumer Profiles:** Aarav S. (TechNova '26 Band), Alex Rivera (VIP Passholder), Priya Sharma (Standard Attendee).
  * **Staff Profiles:** Elena Rostova (Lead Curator), Marcus Vance (Main Gate Supervisor).
  * One-click authentication with pre-filled demo credentials, sound effects, and confetti.

### 3. Dual Portal & Mode Switcher
* **Consumer Portal:** Attendee profile, holographic pass with dynamic QR badge, live points wallet, boosted zone radar, interactive demo check-in station, and sponsor rewards redemption store.
* **Staff & Admin Hub:** Live headcounts, dynamic zone traffic boosting controls, sponsor footfall validation analytics, dedicated scanning window, and live database audit stream.
* **Split Demo View:** Puts both the Consumer Portal and the Staff Hub side-by-side on screen. Tap check-in on the consumer side and immediately watch the live headcount and sponsor metrics tick up in real time on the staff side!
* **Profile Switcher:** Easily toggle between test attendees (Alex Rivera - VIP, Priya Sharma - Standard, Jordan Lee - Explorer) to demonstrate multi-tier experiences.

### 2. Live Headcount & Footfall Tracking
* **Main Gate:** Monitors total active attendees inside the venue vs venue capacity (1,000 max), with total cumulative gate footfall.
* **Zone 1 (Tech & Robotics Pavilions):** Live headcount aggregating **Stall 1** (HyperTech AI Showcase) and **Stall 2** (NovaDynamics Robotics Lab).
* **Zone 2 (Creator & Entertainment Hub):** Live headcount aggregating **Stall 3** (SonicMedia Creator Studio), **Stall 4** (ApexPlay VR Arena), and **Stall 5** (VoltMotors Future Mobility).
* **Live Heatmap Floorplan:** Visual diagram with capacity progress bars, occupancy counts, and glow statuses.

### 3. Business Strategy: Dynamic Zone Boosting
* **Problem Solved:** Events often suffer from bottlenecks in one hall while sponsor booths in other areas receive low traffic.
* **Solution:** Staff admins can activate **Flash Zone Boost** on Zone 1 or Zone 2 with selectable multipliers (`1.5x`, `2.0x`, `2.5x`, `3.0x`).
* **Incentive:** Whenever a zone is boosted, attendees earn bonus reward points on every stall check-in in that zone.
* **Real-time Broadcaster:** Immediately pushes glowing alert banners and sound cues to all consumer screens, steering footfall toward boosted sponsor zones.

### 4. Sponsor Validation & Audit
* **Sponsor ROI Proof:** Dedicated validation dashboard tracking verified scans, unique attendees, fill rates, and points awarded per sponsor stall.
* **One-Click CSV Export:** Generates an official `sponsor_footfall_validation_report.csv` file for contract delivery validation.

### 5. Scanning Interface & Database (Supabase)
* **Staff Scanner Viewfinder:** Optical reticle with laser animation, station selector (Main Gate or Stalls 1–5), fast attendee chips, and manual pass input.
* **Supabase Compatibility:** Complete PostgreSQL schema (`supabase_schema.sql`) included with tables for `zones`, `stalls`, `attendees`, `checkins`, `rewards_catalog`, `redemptions`, and views for `sponsor_validation_report`.
* **Realtime Publication:** Configured with `ALTER PUBLICATION supabase_realtime ADD TABLE checkins, zones;` for live database streaming.
* **Connection Modal:** Easily input your Supabase URL & Anon Key in the app settings modal to switch from the local mock engine to live Supabase cloud.

### 6. Interactive Demo QR Check-In
* In the Consumer Portal, attendees have a dedicated **Demo QR Check-In Station**:
  * Select location: Main Gate, Stall 1, Stall 2, Stall 3, Stall 4, or Stall 5.
  * Preview points to be awarded (including the active zone multiplier).
  * Click **"Tap to Check-in with QR Pass"** to trigger sound effects, confetti bursts, reward point additions, and instant headcount updates across all dashboards!

### 7. Sponsor Rewards Store & Redemptions
* Attendees can redeem earned points for sponsor prizes (HyperTech Swag Bag, ApexPlay VIP VR Pass, SonicMedia Sampler, VoltMotors Espresso & Snacks, Grand Keynote Raffle).
* Generates a digital claim voucher modal with unique voucher code and QR ticket.

---

## 📁 Project Structure

```
event-curation-app/
├── package.json               # Project manifest
├── server.js                  # Zero-dependency Node.js HTTP & SSE real-time server
├── supabase_schema.sql        # Supabase PostgreSQL schema with seed data & RLS
├── data/
│   └── event_state.json       # Persisted state store
└── public/
    ├── index.html             # Main single-page application UI
    ├── styles.css             # Cyberpunk obsidian glassmorphic styling
    ├── app.js                 # Frontend engine, QR renderer, Web Audio SFX, Supabase client
    └── supabase_schema.sql    # Public copy for schema viewer
```

---

## 🛠️ Supabase Setup Instructions

1. Log into [Supabase](https://supabase.com) and create a new project.
2. Open the **SQL Editor** in your Supabase dashboard.
3. Open `supabase_schema.sql` (or click the **⚡ Supabase Settings** button in the app top bar and click "Copy SQL Schema").
4. Paste the SQL script and run it.
5. In your Supabase Project Settings > API, copy the **Project URL** and **Anon Public Key**.
6. In the CuraEvent web app, click the **⚡ Supabase** icon in the header, paste your credentials, and click **Save & Connect**.
