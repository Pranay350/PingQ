

(function() {
  'use strict';

  let soundEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type, duration, delay = 0) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(audioCtx.currentTime + delay);
      osc.stop(audioCtx.currentTime + delay + duration);
    } catch (e) {
      // Audio might be blocked until user gesture
    }
  }

  function playScanBeep() {
    playTone(980, 'sine', 0.08, 0);
    playTone(1320, 'sine', 0.12, 0.08);
  }

  function playSuccessChime() {
    playTone(523.25, 'triangle', 0.1, 0);     // C5
    playTone(659.25, 'triangle', 0.1, 0.08);  // E5
    playTone(783.99, 'triangle', 0.15, 0.16); // G5
    playTone(1046.50, 'sine', 0.25, 0.24);    // C6
  }

  function playBoostSound() {
    playTone(440, 'sawtooth', 0.12, 0);
    playTone(554.37, 'sawtooth', 0.12, 0.1);
    playTone(659.25, 'sawtooth', 0.15, 0.2);
    playTone(880, 'sawtooth', 0.3, 0.3);
  }

  // --- CONFETTI PARTICLE SYSTEM ---
  const confettiCanvas = document.getElementById('confettiCanvas');
  const ctxConfetti = confettiCanvas ? confettiCanvas.getContext('2d') : null;
  let particles = [];
  let confettiAnimId = null;

  function resizeConfetti() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfetti);
  resizeConfetti();

  function triggerConfetti() {
    if (!ctxConfetti) return;
    const colors = ['#6366f1', '#06b6d4', '#f59e0b', '#10b981', '#f43f5e', '#ffffff'];
    particles = [];
    for (let i = 0; i < 75; i++) {
      particles.push({
        x: window.innerWidth / 2 + (Math.random() * 200 - 100),
        y: window.innerHeight * 0.4,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.7) * 16,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 12,
        opacity: 1
      });
    }

    if (!confettiAnimId) {
      updateConfetti();
    }
  }

  function updateConfetti() {
    if (!ctxConfetti) return;
    ctxConfetti.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    particles.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4; // gravity
      p.rotation += p.vr;
      p.opacity -= 0.015;

      ctxConfetti.save();
      ctxConfetti.translate(p.x, p.y);
      ctxConfetti.rotate((p.rotation * Math.PI) / 180);
      ctxConfetti.globalAlpha = Math.max(0, p.opacity);
      ctxConfetti.fillStyle = p.color;
      ctxConfetti.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
      ctxConfetti.restore();

      if (p.opacity <= 0) {
        particles.splice(idx, 1);
      }
    });

    if (particles.length > 0) {
      confettiAnimId = requestAnimationFrame(updateConfetti);
    } else {
      confettiAnimId = null;
      ctxConfetti.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  // --- PROCEDURAL QR CODE CANVAS GENERATOR ---
  function drawQRCode(canvas, text) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Simple pseudo-random deterministic matrix based on text hash
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }

    const gridSize = 21; // 21x21 modules standard Version 1 QR
    const cellSize = Math.floor((width - 16) / gridSize);
    const offsetX = Math.floor((width - gridSize * cellSize) / 2);
    const offsetY = Math.floor((height - gridSize * cellSize) / 2);

    ctx.fillStyle = '#0f172a';

    // Helper to draw a position detection square (Finder Pattern)
    function drawFinder(r0, c0) {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isOuter = (r === 0 || r === 6 || c === 0 || c === 6);
          const isInner = (r >= 2 && r <= 4 && c >= 2 && c <= 4);
          if (isOuter || isInner) {
            ctx.fillRect(offsetX + (c0 + c) * cellSize, offsetY + (r0 + r) * cellSize, cellSize, cellSize);
          }
        }
      }
    }

    // Draw 3 Finders
    drawFinder(0, 0);
    drawFinder(0, gridSize - 7);
    drawFinder(gridSize - 7, 0);

    // Draw Timing patterns
    for (let i = 8; i < gridSize - 8; i++) {
      if (i % 2 === 0) {
        ctx.fillRect(offsetX + i * cellSize, offsetY + 6 * cellSize, cellSize, cellSize);
        ctx.fillRect(offsetX + 6 * cellSize, offsetY + i * cellSize, cellSize, cellSize);
      }
    }

    // Pseudo-random data modules seeded by hash
    let seed = Math.abs(hash);
    function nextRand() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    }

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Skip finder pattern zones
        const inTopLeft = (r < 8 && c < 8);
        const inTopRight = (r < 8 && c >= gridSize - 8);
        const inBottomLeft = (r >= gridSize - 8 && c < 8);
        const inTiming = (r === 6 || c === 6);

        if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming) {
          if (nextRand() > 0.45) {
            ctx.fillRect(offsetX + c * cellSize, offsetY + r * cellSize, cellSize, cellSize);
          }
        }
      }
    }
  }

  // --- CROSS-TAB REACTIVE BUS (BroadcastChannel) ---
  const bus = window.BroadcastChannel ? new BroadcastChannel('pingq_sync') : null;
  if (bus) {
    bus.onmessage = (event) => {
      if (event.data && event.data.type === 'SYNC_STATE') {
        appState = event.data.state;
        renderAll();
      }
    };
  }

  function broadcastLocalState() {
    if (bus) {
      bus.postMessage({ type: 'SYNC_STATE', state: appState });
    }
    try {
      localStorage.setItem('pingq_local_state', JSON.stringify(appState));
    } catch (e) {}
  }

  // --- INITIAL APPLICATION STATE ---
  function createDefaultState() {
    return {
      main_gate: {
        id: 'main_gate',
        name: 'Main Gate (Venue Entrance)',
        live_headcount: 184,
        total_footfall: 1167,
        capacity: 1000,
        base_points: 25
      },
      zones: {
        zone_1: {
          id: 'zone_1',
          name: 'Zone 1: Tech & Robotics Pavilions',
          description: 'Front hall featuring emerging technologies, robotics & AI.',
          is_boosted: false,
          boost_multiplier: 2.0,
          capacity: 350,
          stalls: ['stall_1', 'stall_2']
        },
        zone_2: {
          id: 'zone_2',
          name: 'Zone 2: Creator & Entertainment Hub',
          description: 'Gaming VR arena, audio creator labs & future EV mobility.',
          is_boosted: true,
          boost_multiplier: 2.5,
          capacity: 550,
          stalls: ['stall_3', 'stall_4', 'stall_5']
        }
      },
      stalls: {
        stall_1: {
          id: 'stall_1',
          zone_id: 'zone_1',
          name: 'Stall 1 - HyperTech AI Showcase',
          sponsor_name: 'HyperTech Systems',
          sponsor_category: 'Cloud & AI Infrastructure',
          base_points: 50,
          live_headcount: 28,
          total_footfall: 215,
          capacity: 120,
          verified_scan_count: 215,
          unique_attendees: 198
        },
        stall_2: {
          id: 'stall_2',
          zone_id: 'zone_1',
          name: 'Stall 2 - NovaDynamics Robotics Lab',
          sponsor_name: 'NovaDynamics',
          sponsor_category: 'Autonomous Robotics',
          base_points: 50,
          live_headcount: 21,
          total_footfall: 168,
          capacity: 100,
          verified_scan_count: 168,
          unique_attendees: 154
        },
        stall_3: {
          id: 'stall_3',
          zone_id: 'zone_2',
          name: 'Stall 3 - SonicMedia Creator Studio',
          sponsor_name: 'SonicMedia Studios',
          sponsor_category: 'Audio & Digital Creation',
          base_points: 60,
          live_headcount: 46,
          total_footfall: 312,
          capacity: 150,
          verified_scan_count: 312,
          unique_attendees: 280
        },
        stall_4: {
          id: 'stall_4',
          zone_id: 'zone_2',
          name: 'Stall 4 - ApexPlay VR & Esports Arena',
          sponsor_name: 'ApexPlay Interactive',
          sponsor_category: 'Gaming & Immersive Tech',
          base_points: 75,
          live_headcount: 59,
          total_footfall: 384,
          capacity: 180,
          verified_scan_count: 384,
          unique_attendees: 342
        },
        stall_5: {
          id: 'stall_5',
          zone_id: 'zone_2',
          name: 'Stall 5 - VoltMotors Future Mobility',
          sponsor_name: 'VoltMotors Global',
          sponsor_category: 'EV & Clean Energy Tech',
          base_points: 50,
          live_headcount: 30,
          total_footfall: 246,
          capacity: 120,
          verified_scan_count: 246,
          unique_attendees: 228
        }
      },
      attendees: {
        'PQ-7F3K': {
          id: 'e5555555-5555-5555-5555-555555555555',
          pass_id: 'PQ-7F3K',
          full_name: 'Aarav S.',
          email: 'aarav.s@technova26.io',
          role: 'consumer',
          tier: "TechNova '26 · Band",
          avatar_initials: 'AS',
          points_balance: 170,
          lifetime_points: 240,
          checkin_count: 6,
          medical_profile: {
            blood_group: 'O+',
            age: 24,
            height: "5' 11\" (180 cm)",
            weight: '72 kg',
            emergency_contact: { name: 'Rohan Sharma', relation: 'Brother / Emergency Primary', phone: '+91 98765 43210', alt_phone: '+91 98111 22334' },
            allergies: 'Severe Penicillin allergy, Mild tree nut sensitivity',
            conditions: 'Mild bronchial asthma (Carries rescue inhaler in jacket)',
            organ_donor: true,
            medical_notes: 'PingQ Medical ID Verified · Encrypted on Wristband Token PQ-7F3K'
          }
        },
        'PASS-ALEX-8821': {
          id: 'a1111111-1111-1111-1111-111111111111',
          pass_id: 'PASS-ALEX-8821',
          full_name: 'Alex Rivera',
          email: 'alex.rivera@example.com',
          role: 'consumer',
          tier: 'VIP All-Access',
          avatar_initials: 'AR',
          points_balance: 380,
          lifetime_points: 620,
          checkin_count: 5,
          medical_profile: {
            blood_group: 'A-',
            age: 28,
            height: "6' 1\" (185 cm)",
            weight: '78 kg',
            emergency_contact: { name: 'Elena Rivera', relation: 'Spouse', phone: '+1 (555) 234-8901', alt_phone: '+1 (555) 876-5432' },
            allergies: 'Sulfa antibiotics allergy',
            conditions: 'No chronic conditions reported',
            organ_donor: true,
            medical_notes: 'PingQ VIP Passholder · Verified ID'
          }
        },
        'PASS-PRIYA-4920': {
          id: 'b2222222-2222-2222-2222-222222222222',
          pass_id: 'PASS-PRIYA-4920',
          full_name: 'Priya Sharma',
          email: 'priya.sharma@example.com',
          role: 'consumer',
          tier: 'Standard Pass',
          avatar_initials: 'PS',
          points_balance: 190,
          lifetime_points: 290,
          checkin_count: 3,
          medical_profile: {
            blood_group: 'B+',
            age: 22,
            height: "5' 4\" (163 cm)",
            weight: '54 kg',
            emergency_contact: { name: 'Dr. Vikram Sharma', relation: 'Father / Physician', phone: '+91 98234 56789', alt_phone: '+91 98450 11223' },
            allergies: 'Severe Peanut allergy (Carries EpiPen in purse)',
            conditions: 'Hypoglycemia risk',
            organ_donor: true,
            medical_notes: 'Allergic reaction requires immediate EpiPen administration'
          }
        },
        'PASS-JORDAN-3104': {
          id: 'c3333333-3333-3333-3333-333333333333',
          pass_id: 'PASS-JORDAN-3104',
          full_name: 'Jordan Lee',
          email: 'jordan.lee@example.com',
          role: 'consumer',
          tier: 'Tech Explorer Pass',
          avatar_initials: 'JL',
          points_balance: 125,
          lifetime_points: 175,
          checkin_count: 2,
          medical_profile: {
            blood_group: 'AB+',
            age: 26,
            height: "5' 8\" (173 cm)",
            weight: '68 kg',
            emergency_contact: { name: 'Maya Lee', relation: 'Sister', phone: '+1 (555) 901-4455', alt_phone: '+1 (555) 678-1234' },
            allergies: 'No known drug allergies (NKDA)',
            conditions: 'Exercise-induced asthma',
            organ_donor: true,
            medical_notes: 'Carries standard albuterol inhaler'
          }
        }
      },
      emergency_incidents: [],
      active_emergency_count: 0,
      rewards: [
        {
          id: 'rew_1',
          title: 'HyperTech Limited Edition Swag Bag',
          sponsor: 'HyperTech Systems',
          points_cost: 150,
          icon: '🎁',
          description: 'Thermal bottle, embroidered tech pouch & sticker bundle.',
          stock: 38
        },
        {
          id: 'rew_2',
          title: 'ApexPlay VIP Gaming Fast-Track Pass',
          sponsor: 'ApexPlay Interactive',
          points_cost: 250,
          icon: '🎮',
          description: 'Skip the line at VR flight simulators + complimentary energy drink.',
          stock: 18
        },
        {
          id: 'rew_3',
          title: 'SonicMedia Studio Sampler & Pass',
          sponsor: 'SonicMedia Studios',
          points_cost: 100,
          icon: '🎧',
          description: 'Lossless master audio pack & 3-month creator cloud pass.',
          stock: 85
        },
        {
          id: 'rew_4',
          title: 'VoltMotors Espresso & Refreshment',
          sponsor: 'VoltMotors Global',
          points_cost: 80,
          icon: '☕',
          description: 'Fresh barista beverage and artisan snack at the EV lounge.',
          stock: 52
        },
        {
          id: 'rew_5',
          title: 'Grand Keynote Stage Raffle Entry',
          sponsor: 'Event Curation Board',
          points_cost: 200,
          icon: '🎟️',
          description: 'Golden ticket for the flagship stage gadget giveaway.',
          stock: 120
        }
      ],
      redemptions: [
        {
          id: 'red_demo_1',
          attendee_pass_id: 'PASS-ALEX-8821',
          reward_id: 'rew_4',
          reward_title: 'VoltMotors Espresso & Refreshment',
          points_spent: 80,
          voucher_code: 'VOLT-9472-EXP',
          status: 'Active',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ],
      checkins_log: [
        {
          id: 'chk_101',
          attendee_pass_id: 'PASS-ALEX-8821',
          attendee_name: 'Alex Rivera',
          location_type: 'main_gate',
          location_id: 'main_gate',
          location_name: 'Main Gate (Venue Entrance)',
          zone_id: null,
          zone_name: 'Entry Portal',
          points_awarded: 25,
          was_boosted: false,
          multiplier: 1.0,
          timestamp: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: 'chk_102',
          attendee_pass_id: 'PASS-ALEX-8821',
          attendee_name: 'Alex Rivera',
          location_type: 'stall',
          location_id: 'stall_3',
          location_name: 'Stall 3 - SonicMedia Creator Studio',
          zone_id: 'zone_2',
          zone_name: 'Zone 2 (Boosted)',
          points_awarded: 150,
          was_boosted: true,
          multiplier: 2.5,
          timestamp: new Date(Date.now() - 4800000).toISOString()
        },
        {
          id: 'chk_103',
          attendee_pass_id: 'PASS-PRIYA-4920',
          attendee_name: 'Priya Sharma',
          location_type: 'stall',
          location_id: 'stall_1',
          location_name: 'Stall 1 - HyperTech AI Showcase',
          zone_id: 'zone_1',
          zone_name: 'Zone 1',
          points_awarded: 50,
          was_boosted: false,
          multiplier: 1.0,
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'chk_104',
          attendee_pass_id: 'PASS-ALEX-8821',
          attendee_name: 'Alex Rivera',
          location_type: 'stall',
          location_id: 'stall_4',
          location_name: 'Stall 4 - ApexPlay VR & Esports Arena',
          zone_id: 'zone_2',
          zone_name: 'Zone 2 (Boosted)',
          points_awarded: 188,
          was_boosted: true,
          multiplier: 2.5,
          timestamp: new Date(Date.now() - 1200000).toISOString()
        }
      ]
    };
  }

  let appState = null;
  let activeAttendeePassId = 'PQ-7F3K';
  let isServerAvailable = false;

  // Load state from server or localStorage
  async function loadInitialState() {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        appState = await res.json();
        isServerAvailable = true;
        setupSSE();
        renderAll();
        return;
      }
    } catch (e) {
      // Local fallback
    }

    const localSaved = localStorage.getItem('pingq_local_state') || localStorage.getItem('curaevent_local_state');
    if (localSaved) {
      try {
        appState = JSON.parse(localSaved);
      } catch (err) {
        appState = createDefaultState();
      }
    } else {
      appState = createDefaultState();
    }
    renderAll();
  }

  // Real-time Server-Sent Events setup
  function setupSSE() {
    if (!window.EventSource) return;
    try {
      const evtSource = new EventSource('/api/events');
      evtSource.addEventListener('checkin', (e) => {
        const payload = JSON.parse(e.data);
        if (payload.checkin && appState) {
          appState.checkins_log.unshift(payload.checkin);
          if (appState.checkins_log.length > 100) appState.checkins_log.pop();
          
          if (payload.attendee && appState.attendees[payload.attendee.pass_id]) {
            appState.attendees[payload.attendee.pass_id] = payload.attendee;
          }

          if (payload.checkin.location_id === 'main_gate') {
            appState.main_gate.live_headcount += 1;
            appState.main_gate.total_footfall += 1;
          } else if (appState.stalls[payload.checkin.location_id]) {
            const s = appState.stalls[payload.checkin.location_id];
            s.live_headcount += 1;
            s.total_footfall += 1;
            s.verified_scan_count = (s.verified_scan_count || s.total_footfall) + 1;
          }

          renderAll();
          showToast(`⚡ Live Scan: ${payload.checkin.attendee_name} checked in at ${payload.checkin.location_name}`);
        }
      });

      evtSource.addEventListener('boost', (e) => {
        const payload = JSON.parse(e.data);
        if (payload.zoneId && appState.zones[payload.zoneId]) {
          appState.zones[payload.zoneId] = payload.zone;
          renderAll();
          showToast(payload.message, 'boost');
        }
      });

      evtSource.addEventListener('redemption', (e) => {
        const payload = JSON.parse(e.data);
        if (payload.redemption && appState) {
          appState.redemptions.unshift(payload.redemption);
          if (payload.attendee && appState.attendees[payload.attendee.pass_id]) {
            appState.attendees[payload.attendee.pass_id] = payload.attendee;
          }
          renderAll();
        }
      });

      evtSource.addEventListener('reset', () => {
        loadInitialState();
        showToast('🔄 Demo state was reset to initial baseline.');
      });
    } catch (err) {
      console.warn('SSE not connected, running in local reactive mode.');
    }
  }

  // --- ACTIONS: CHECK-IN ENGINE ---
  async function performCheckin(attendeePassId, locationId) {
    initAudio();
    playScanBeep();

    if (isServerAvailable) {
      try {
        const res = await fetch('/api/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attendeeId: attendeePassId, locationId })
        });
        if (res.ok) {
          const data = await res.json();
          setTimeout(playSuccessChime, 150);
          triggerConfetti();
          return data;
        }
      } catch (e) {
        console.warn('Backend fetch failed, processing locally:', e);
      }
    }

    // Local execution engine
    const attendee = appState.attendees[attendeePassId] || appState.attendees['PASS-ALEX-8821'];
    let locationType = 'stall';
    let locationName = '';
    let zoneId = null;
    let zoneName = '';
    let basePoints = 50;
    let isBoosted = false;
    let multiplier = 1.0;

    if (locationId === 'main_gate') {
      locationType = 'main_gate';
      locationName = appState.main_gate.name;
      basePoints = appState.main_gate.base_points;
      appState.main_gate.live_headcount += 1;
      appState.main_gate.total_footfall += 1;
    } else if (appState.stalls[locationId]) {
      const stall = appState.stalls[locationId];
      locationName = stall.name;
      basePoints = stall.base_points;
      zoneId = stall.zone_id;
      const zone = appState.zones[zoneId];
      zoneName = zone ? zone.name : '';
      if (zone && zone.is_boosted) {
        isBoosted = true;
        multiplier = zone.boost_multiplier || 2.0;
      }
      stall.live_headcount += 1;
      stall.total_footfall += 1;
      stall.verified_scan_count = (stall.verified_scan_count || stall.total_footfall) + 1;
    }

    const pointsAwarded = Math.round(basePoints * multiplier);
    attendee.points_balance += pointsAwarded;
    attendee.lifetime_points += pointsAwarded;
    attendee.checkin_count = (attendee.checkin_count || 0) + 1;

    const newCheckin = {
      id: 'chk_' + Date.now().toString(36),
      attendee_pass_id: attendee.pass_id,
      attendee_name: attendee.full_name,
      location_type: locationType,
      location_id: locationId,
      location_name: locationName,
      zone_id: zoneId,
      zone_name: zoneName || (locationType === 'main_gate' ? 'Entry Portal' : 'Zone'),
      points_awarded: pointsAwarded,
      was_boosted: isBoosted,
      multiplier: multiplier,
      timestamp: new Date().toISOString()
    };

    appState.checkins_log.unshift(newCheckin);
    if (appState.checkins_log.length > 100) appState.checkins_log.pop();

    broadcastLocalState();
    renderAll();

    setTimeout(playSuccessChime, 150);
    triggerConfetti();

    return {
      success: true,
      checkin: newCheckin,
      attendee,
      pointsAwarded,
      isBoosted,
      multiplier
    };
  }

  // --- ACTIONS: ZONE BOOST ENGINE ---
  async function updateZoneBoost(zoneId, isBoosted, multiplier) {
    initAudio();
    playBoostSound();

    if (isServerAvailable) {
      try {
        const res = await fetch('/api/boost', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zoneId, isBoosted, multiplier })
        });
        if (res.ok) {
          const data = await res.json();
          return data;
        }
      } catch (e) {
        console.warn('Backend fetch failed, updating boost locally:', e);
      }
    }

    // Local engine
    if (appState.zones[zoneId]) {
      const z = appState.zones[zoneId];
      z.is_boosted = isBoosted;
      if (multiplier) z.boost_multiplier = Number(multiplier);
      broadcastLocalState();
      renderAll();
      showToast(`${z.name} is now ${z.is_boosted ? '🔥 BOOSTED (' + z.boost_multiplier + 'x Points!)' : 'standard'}!`, 'boost');
    }
  }

  // --- ACTIONS: REWARDS REDEMPTION ---
  async function redeemReward(rewardId) {
    initAudio();
    const attendee = appState.attendees[activeAttendeePassId];
    const reward = appState.rewards.find(r => r.id === rewardId);
    if (!reward) return;

    if (attendee.points_balance < reward.points_cost) {
      showToast(`❌ Insufficient points! You have ${attendee.points_balance} pts, need ${reward.points_cost} pts.`);
      return;
    }

    if (isServerAvailable) {
      try {
        const res = await fetch('/api/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attendeeId: activeAttendeePassId, rewardId })
        });
        if (res.ok) {
          const data = await res.json();
          openVoucherModal(reward.title, data.voucherCode, reward.points_cost);
          playSuccessChime();
          triggerConfetti();
          return;
        }
      } catch (e) {
        console.warn('Backend fetch failed, redeeming locally:', e);
      }
    }

    // Local redemption
    attendee.points_balance -= reward.points_cost;
    reward.stock = Math.max(0, (reward.stock || 10) - 1);
    const voucherCode = `${reward.sponsor.split(' ')[0].toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;

    const redemption = {
      id: 'red_' + Date.now().toString(36),
      attendee_pass_id: attendee.pass_id,
      reward_id: reward.id,
      reward_title: reward.title,
      points_spent: reward.points_cost,
      voucher_code: voucherCode,
      status: 'Active',
      timestamp: new Date().toISOString()
    };

    appState.redemptions.unshift(redemption);
    broadcastLocalState();
    renderAll();

    openVoucherModal(reward.title, voucherCode, reward.points_cost);
    playSuccessChime();
    triggerConfetti();
  }

  // --- RENDER FUNCTIONS ---

  function renderLandingPage() {
    const attendee = appState.attendees[activeAttendeePassId] || appState.attendees['PQ-7F3K'] || appState.attendees['PASS-ALEX-8821'];
    
    // Draw QR on hero wristband card from Screenshot 1
    const heroQr = document.getElementById('heroWristbandQrCanvas');
    if (heroQr) {
      drawQRCode(heroQr, attendee.pass_id);
    }

    const wbHolder = document.getElementById('landingHolderName');
    const wbPts = document.getElementById('landingPointsVal');
    const wbStalls = document.getElementById('landingStallsVal');

    if (wbHolder) wbHolder.textContent = attendee.full_name;
    if (wbPts) wbPts.textContent = attendee.points_balance.toLocaleString();
    if (wbStalls) wbStalls.textContent = `${attendee.checkin_count || 6}/24`;

    // Live metrics
    const gateCount = document.getElementById('landingGateCount');
    if (gateCount) gateCount.textContent = `${appState.main_gate.live_headcount} Live Inside`;

    const boostStatus = document.getElementById('landingZoneBoostStatus');
    const wbAlert = document.getElementById('landingWristbandAlertText');
    
    if (appState.zones.zone_2.is_boosted) {
      if (boostStatus) boostStatus.textContent = `Zone 2 Boosted (${appState.zones.zone_2.boost_multiplier}x Points Active)`;
      if (wbAlert) wbAlert.innerHTML = `Art walk (Zone 2) is on <strong>${appState.zones.zone_2.boost_multiplier}x points</strong> for the next 30 min.`;
    } else if (appState.zones.zone_1.is_boosted) {
      if (boostStatus) boostStatus.textContent = `Zone 1 Boosted (${appState.zones.zone_1.boost_multiplier}x Points Active)`;
      if (wbAlert) wbAlert.innerHTML = `Tech Pavilions (Zone 1) on <strong>${appState.zones.zone_1.boost_multiplier}x points</strong> for the next 30 min.`;
    } else {
      if (boostStatus) boostStatus.textContent = `Standard Pace (1.0x Points)`;
      if (wbAlert) wbAlert.innerHTML = `All stalls active. Collect reward points across venue.`;
    }

    const featFlow = document.getElementById('featFlowText');
    if (featFlow) featFlow.textContent = `2 ZONES HEAVY · ${appState.main_gate.total_footfall} INSIDE`;
  }

  function renderAll() {
    if (!appState) return;
    renderTopBar();
    renderLandingPage();
    renderConsumerPortal();
    renderStaffHub();
  }

  function renderTopBar() {
    // Flash banner update based on boost status
    const banner = document.getElementById('boostFlashBanner');
    const bannerText = document.getElementById('boostBannerText');
    const isZone1Boosted = appState.zones.zone_1.is_boosted;
    const isZone2Boosted = appState.zones.zone_2.is_boosted;

    if (isZone1Boosted && isZone2Boosted) {
      banner.style.display = 'flex';
      bannerText.innerHTML = `<strong>MEGA BOOST ACTIVE:</strong> Both Zone 1 & Zone 2 are currently awarding up to <strong>${appState.zones.zone_2.boost_multiplier}x BONUS POINTS</strong>!`;
    } else if (isZone2Boosted) {
      banner.style.display = 'flex';
      bannerText.innerHTML = `<strong>FLASH ZONE BOOST ACTIVE:</strong> Zone 2 (Stalls 3, 4, 5) is awarding <strong>${appState.zones.zone_2.boost_multiplier}x REWARD POINTS</strong> on all check-ins!`;
    } else if (isZone1Boosted) {
      banner.style.display = 'flex';
      bannerText.innerHTML = `<strong>FLASH ZONE BOOST ACTIVE:</strong> Zone 1 (Stalls 1, 2) is awarding <strong>${appState.zones.zone_1.boost_multiplier}x REWARD POINTS</strong> on all check-ins!`;
    } else {
      banner.style.display = 'none';
    }
  }

  function renderConsumerPortal() {
    const attendee = appState.attendees[activeAttendeePassId] || appState.attendees['PASS-ALEX-8821'];

    // Profile card
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userPassId = document.getElementById('userPassId');
    const userTierBadge = document.getElementById('userTierBadge');
    const userCheckinsCount = document.getElementById('userCheckinsCount');

    if (userAvatar) userAvatar.textContent = attendee.avatar_initials || attendee.full_name.substring(0, 2).toUpperCase();
    if (userName) userName.textContent = attendee.full_name;
    if (userPassId) userPassId.textContent = attendee.pass_id;
    if (userTierBadge) userTierBadge.textContent = attendee.tier;
    if (userCheckinsCount) userCheckinsCount.textContent = attendee.checkin_count || 0;

    // Draw QR Badge
    const qrCanvas = document.getElementById('userQrCanvas');
    if (qrCanvas) {
      drawQRCode(qrCanvas, attendee.pass_id);
    }

    // Points Balance
    const userPointsBalance = document.getElementById('userPointsBalance');
    const userLifetimePoints = document.getElementById('userLifetimePoints');
    if (userPointsBalance) userPointsBalance.textContent = attendee.points_balance.toLocaleString();
    if (userLifetimePoints) userLifetimePoints.textContent = `${attendee.lifetime_points.toLocaleString()} PTS`;

    // Boost Radar Widget
    const radarTitle = document.getElementById('radarTitle');
    const radarDesc = document.getElementById('radarDesc');
    const isZone1Boosted = appState.zones.zone_1.is_boosted;
    const isZone2Boosted = appState.zones.zone_2.is_boosted;

    if (isZone2Boosted && !isZone1Boosted) {
      if (radarTitle) radarTitle.textContent = `Zone 2 is currently Boosted!`;
      if (radarDesc) radarDesc.innerHTML = `Visit Stall 3, 4, or 5 to collect <strong>${appState.zones.zone_2.boost_multiplier}x bonus points</strong> per scan!`;
    } else if (isZone1Boosted && !isZone2Boosted) {
      if (radarTitle) radarTitle.textContent = `Zone 1 is currently Boosted!`;
      if (radarDesc) radarDesc.innerHTML = `Visit Stall 1 or 2 to collect <strong>${appState.zones.zone_1.boost_multiplier}x bonus points</strong> per scan!`;
    } else if (isZone1Boosted && isZone2Boosted) {
      if (radarTitle) radarTitle.textContent = `All Event Zones are Boosted!`;
      if (radarDesc) radarDesc.innerHTML = `Check in anywhere for massive bonus multipliers across the entire venue!`;
    } else {
      if (radarTitle) radarTitle.textContent = `Standard Event Mode`;
      if (radarDesc) radarDesc.innerHTML = `Check in at sponsor stalls to collect standard points and claim merch!`;
    }

    // Zone Blocks in Guide
    const z1Block = document.getElementById('consumerZone1Block');
    const z2Block = document.getElementById('consumerZone2Block');
    const z1Badge = document.getElementById('userZone1Badge');
    const z2Badge = document.getElementById('userZone2Badge');

    if (z1Block && z1Badge) {
      if (isZone1Boosted) {
        z1Block.classList.add('boosted');
        z1Badge.className = 'zone-status-badge boosted';
        z1Badge.textContent = `🔥 BOOSTED (${appState.zones.zone_1.boost_multiplier}x)`;
      } else {
        z1Block.classList.remove('boosted');
        z1Badge.className = 'zone-status-badge';
        z1Badge.textContent = 'Standard (1.0x)';
      }
    }

    if (z2Block && z2Badge) {
      if (isZone2Boosted) {
        z2Block.classList.add('boosted');
        z2Badge.className = 'zone-status-badge boosted';
        z2Badge.textContent = `🔥 BOOSTED (${appState.zones.zone_2.boost_multiplier}x)`;
      } else {
        z2Block.classList.remove('boosted');
        z2Badge.className = 'zone-status-badge';
        z2Badge.textContent = 'Standard (1.0x)';
      }
    }

    // Update Stalls mini card points text
    updateStallCardPoints();

    // Update Demo Check-in Station Preview Box
    updateDemoCheckinPreview();

    // Render Rewards Store Catalog
    renderRewardsStore(attendee.points_balance);

    // Render User Activity Timeline
    renderUserActivity(attendee.pass_id);

    // Render Medical Profile Section in Consumer Portal
    renderMedicalProfile(attendee);

    // Update landing page safety live counter
    renderSafetyAlertCounter();
  }

  function updateStallCardPoints() {
    const s1 = appState.stalls.stall_1;
    const s2 = appState.stalls.stall_2;
    const s3 = appState.stalls.stall_3;
    const s4 = appState.stalls.stall_4;
    const s5 = appState.stalls.stall_5;

    const z1Mult = appState.zones.zone_1.is_boosted ? appState.zones.zone_1.boost_multiplier : 1.0;
    const z2Mult = appState.zones.zone_2.is_boosted ? appState.zones.zone_2.boost_multiplier : 1.0;

    const stallCards = document.querySelectorAll('.stall-mini-card');
    stallCards.forEach(card => {
      const stallId = card.getAttribute('data-stall');
      const ptsElem = card.querySelector('.stall-pts');
      if (!ptsElem || !appState.stalls[stallId]) return;

      const stall = appState.stalls[stallId];
      const isZ1 = (stallId === 'stall_1' || stallId === 'stall_2');
      const mult = isZ1 ? z1Mult : z2Mult;
      const calcPts = Math.round(stall.base_points * mult);

      ptsElem.textContent = `+${calcPts} PTS`;
      if (mult > 1.0) {
        ptsElem.classList.add('glow-pts');
        card.classList.add('boosted');
      } else {
        ptsElem.classList.remove('glow-pts');
        card.classList.remove('boosted');
      }
    });
  }

  function updateDemoCheckinPreview() {
    const locSelect = document.getElementById('demoLocationSelect');
    if (!locSelect) return;
    const locId = locSelect.value;
    const previewLocName = document.getElementById('previewLocName');
    const previewZoneBadge = document.getElementById('previewZoneBadge');
    const previewPointsCalc = document.getElementById('previewPointsCalc');

    if (locId === 'main_gate') {
      previewLocName.textContent = 'Main Gate (Venue Entrance)';
      previewZoneBadge.className = 'badge';
      previewZoneBadge.textContent = 'Entry Gate (Headcount Portal)';
      previewPointsCalc.textContent = `+${appState.main_gate.base_points} Reward Points`;
      return;
    }

    const stall = appState.stalls[locId];
    if (stall) {
      previewLocName.textContent = stall.name;
      const zone = appState.zones[stall.zone_id];
      const isBoosted = zone && zone.is_boosted;
      const mult = isBoosted ? zone.boost_multiplier : 1.0;
      const pts = Math.round(stall.base_points * mult);

      if (isBoosted) {
        previewZoneBadge.className = 'badge badge-boost';
        previewZoneBadge.textContent = `🔥 ${zone.name.split(':')[0]} (${mult}x Boost Active)`;
        previewPointsCalc.textContent = `+${pts} Reward Points (${stall.base_points} × ${mult})`;
      } else {
        previewZoneBadge.className = 'badge';
        previewZoneBadge.textContent = `${zone ? zone.name.split(':')[0] : 'Zone'} (Standard 1.0x)`;
        previewPointsCalc.textContent = `+${pts} Reward Points`;
      }
    }
  }

  function renderRewardsStore(currentBalance) {
    const grid = document.getElementById('rewardsCatalogGrid');
    if (!grid) return;
    grid.innerHTML = '';

    appState.rewards.forEach(reward => {
      const canAfford = currentBalance >= reward.points_cost;
      const card = document.createElement('div');
      card.className = 'reward-card';
      card.innerHTML = `
        <div class="reward-top">
          <div class="reward-icon">${reward.icon}</div>
          <div class="reward-meta">
            <h4>${reward.title}</h4>
            <span class="reward-sponsor">Sponsored by ${reward.sponsor}</span>
          </div>
        </div>
        <p class="reward-desc">${reward.description}</p>
        <div class="reward-bottom">
          <span class="reward-cost">${reward.points_cost} PTS</span>
          <button class="btn btn-sm ${canAfford ? 'btn-primary' : 'btn-secondary'}" 
                  data-reward="${reward.id}" 
                  ${canAfford ? '' : 'disabled title="Need more points to redeem"'}>
            ${canAfford ? 'Redeem Voucher' : 'Need Points'}
          </button>
        </div>
      `;

      const btn = card.querySelector('button');
      if (canAfford) {
        btn.addEventListener('click', () => redeemReward(reward.id));
      }
      grid.appendChild(card);
    });
  }

  function renderUserActivity(attendeePassId) {
    const timeline = document.getElementById('userActivityTimeline');
    if (!timeline) return;
    timeline.innerHTML = '';

    const userCheckins = appState.checkins_log.filter(c => c.attendee_pass_id === attendeePassId);

    if (userCheckins.length === 0) {
      timeline.innerHTML = `<div style="padding: 16px; color: var(--text-dim); text-align: center;">No check-ins logged yet. Tap the Demo Check-In button to earn points!</div>`;
      return;
    }

    userCheckins.forEach(chk => {
      const item = document.createElement('div');
      item.className = 'timeline-item';
      const timeStr = new Date(chk.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      item.innerHTML = `
        <div class="timeline-left">
          <span class="timeline-icon">${chk.location_type === 'main_gate' ? '🚪' : '🎪'}</span>
          <div>
            <div class="timeline-loc">${chk.location_name}</div>
            <span class="timeline-time">${timeStr} • ${chk.zone_name}</span>
          </div>
        </div>
        <div class="timeline-points ${chk.was_boosted ? 'boosted' : ''}">
          +${chk.points_awarded} PTS ${chk.was_boosted ? '🔥' : ''}
        </div>
      `;
      timeline.appendChild(item);
    });
  }

  function renderStaffHub() {
    // 1. Metric highlights
    const statMainGateHeadcount = document.getElementById('statMainGateHeadcount');
    const statTotalGateFootfall = document.getElementById('statTotalGateFootfall');
    const mainGateCapFill = document.getElementById('mainGateCapFill');

    if (statMainGateHeadcount) statMainGateHeadcount.textContent = appState.main_gate.live_headcount.toLocaleString();
    if (statTotalGateFootfall) statTotalGateFootfall.textContent = appState.main_gate.total_footfall.toLocaleString();
    if (mainGateCapFill) {
      const pct = Math.min(100, Math.round((appState.main_gate.live_headcount / appState.main_gate.capacity) * 100));
      mainGateCapFill.style.width = `${pct}%`;
    }

    // Zone 1
    const z1Live = appState.stalls.stall_1.live_headcount + appState.stalls.stall_2.live_headcount;
    const z1Footfall = appState.stalls.stall_1.total_footfall + appState.stalls.stall_2.total_footfall;
    const statZone1Headcount = document.getElementById('statZone1Headcount');
    const statZone1Footfall = document.getElementById('statZone1Footfall');
    const zone1CapFill = document.getElementById('zone1CapFill');
    const zone1AdminBadge = document.getElementById('zone1AdminBadge');

    if (statZone1Headcount) statZone1Headcount.textContent = z1Live;
    if (statZone1Footfall) statZone1Footfall.textContent = z1Footfall.toLocaleString();
    if (zone1CapFill) {
      const pct = Math.min(100, Math.round((z1Live / appState.zones.zone_1.capacity) * 100));
      zone1CapFill.style.width = `${pct}%`;
    }
    if (zone1AdminBadge) {
      if (appState.zones.zone_1.is_boosted) {
        zone1AdminBadge.className = 'metric-badge-status boosted';
        zone1AdminBadge.textContent = `🔥 ${appState.zones.zone_1.boost_multiplier}x BOOST`;
      } else {
        zone1AdminBadge.className = 'metric-badge-status';
        zone1AdminBadge.textContent = 'Standard';
      }
    }

    // Zone 2
    const z2Live = appState.stalls.stall_3.live_headcount + appState.stalls.stall_4.live_headcount + appState.stalls.stall_5.live_headcount;
    const z2Footfall = appState.stalls.stall_3.total_footfall + appState.stalls.stall_4.total_footfall + appState.stalls.stall_5.total_footfall;
    const statZone2Headcount = document.getElementById('statZone2Headcount');
    const statZone2Footfall = document.getElementById('statZone2Footfall');
    const zone2CapFill = document.getElementById('zone2CapFill');
    const zone2AdminBadge = document.getElementById('zone2AdminBadge');

    if (statZone2Headcount) statZone2Headcount.textContent = z2Live;
    if (statZone2Footfall) statZone2Footfall.textContent = z2Footfall.toLocaleString();
    if (zone2CapFill) {
      const pct = Math.min(100, Math.round((z2Live / appState.zones.zone_2.capacity) * 100));
      zone2CapFill.style.width = `${pct}%`;
    }
    if (zone2AdminBadge) {
      if (appState.zones.zone_2.is_boosted) {
        zone2AdminBadge.className = 'metric-badge-status boosted';
        zone2AdminBadge.textContent = `🔥 ${appState.zones.zone_2.boost_multiplier}x BOOST`;
      } else {
        zone2AdminBadge.className = 'metric-badge-status';
        zone2AdminBadge.textContent = 'Standard';
      }
    }

    // Total Scans & Points
    let totalScans = 0;
    Object.values(appState.stalls).forEach(s => totalScans += (s.verified_scan_count || s.total_footfall));
    const statTotalScans = document.getElementById('statTotalScans');
    if (statTotalScans) statTotalScans.textContent = totalScans.toLocaleString();

    // 2. Zone Boosting Control switches
    const z1Toggle = document.getElementById('zone1BoostToggle');
    const z2Toggle = document.getElementById('zone2BoostToggle');
    const z1Box = document.getElementById('zone1ControlBox');
    const z2Box = document.getElementById('zone2ControlBox');

    if (z1Toggle) z1Toggle.checked = appState.zones.zone_1.is_boosted;
    if (z2Toggle) z2Toggle.checked = appState.zones.zone_2.is_boosted;

    if (z1Box) z1Box.className = `boost-control-item ${appState.zones.zone_1.is_boosted ? 'active-boosted' : ''}`;
    if (z2Box) z2Box.className = `boost-control-item ${appState.zones.zone_2.is_boosted ? 'active-boosted' : ''}`;

    // Highlight active multiplier chips
    highlightMultiplierChip('zone1MultiplierChips', appState.zones.zone_1.boost_multiplier);
    highlightMultiplierChip('zone2MultiplierChips', appState.zones.zone_2.boost_multiplier);

    // 3. Interactive Venue Floorplan Nodes
    renderFloorplanNodes(z1Live, z2Live);

    // 4. Sponsor Validation Table
    renderSponsorValidationTable();

    // 5. Live Check-in Database Stream
    renderLiveAuditFeed();
  }

  function highlightMultiplierChip(containerId, value) {
    const wrap = document.getElementById(containerId);
    if (!wrap) return;
    const chips = wrap.querySelectorAll('.mult-chip');
    chips.forEach(c => {
      if (Number(c.getAttribute('data-val')) === Number(value)) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });
  }

  function renderFloorplanNodes(z1Live, z2Live) {
    const fpMainHeadcount = document.getElementById('fpMainHeadcount');
    if (fpMainHeadcount) fpMainHeadcount.textContent = appState.main_gate.live_headcount;

    const fpZone1Count = document.getElementById('fpZone1Count');
    const fpZone2Count = document.getElementById('fpZone2Count');
    if (fpZone1Count) fpZone1Count.textContent = z1Live;
    if (fpZone2Count) fpZone2Count.textContent = z2Live;

    const fpZone1Box = document.getElementById('fpZone1Box');
    const fpZone2Box = document.getElementById('fpZone2Box');
    const fpZone1Status = document.getElementById('fpZone1Status');
    const fpZone2Status = document.getElementById('fpZone2Status');

    if (fpZone1Box && fpZone1Status) {
      if (appState.zones.zone_1.is_boosted) {
        fpZone1Box.classList.add('boosted');
        fpZone1Status.className = 'status-pill boosted';
        fpZone1Status.textContent = `🔥 FLASH BOOSTED (${appState.zones.zone_1.boost_multiplier}x)`;
      } else {
        fpZone1Box.classList.remove('boosted');
        fpZone1Status.className = 'status-pill';
        fpZone1Status.textContent = 'Normal Traffic';
      }
    }

    if (fpZone2Box && fpZone2Status) {
      if (appState.zones.zone_2.is_boosted) {
        fpZone2Box.classList.add('boosted');
        fpZone2Status.className = 'status-pill boosted';
        fpZone2Status.textContent = `🔥 FLASH BOOSTED (${appState.zones.zone_2.boost_multiplier}x)`;
      } else {
        fpZone2Box.classList.remove('boosted');
        fpZone2Status.className = 'status-pill';
        fpZone2Status.textContent = 'Normal Traffic';
      }
    }

    // Individual Stall nodes in Floorplan
    for (let i = 1; i <= 5; i++) {
      const stall = appState.stalls[`stall_${i}`];
      if (!stall) continue;
      const livePill = document.getElementById(`stall${i}LivePill`);
      const totalFootfall = document.getElementById(`stall${i}TotalFootfall`);
      const nodeBar = document.getElementById(`stall${i}NodeBar`);

      if (livePill) livePill.textContent = `${stall.live_headcount} Live`;
      if (totalFootfall) totalFootfall.textContent = stall.total_footfall.toLocaleString();
      if (nodeBar) {
        const pct = Math.min(100, Math.round((stall.live_headcount / stall.capacity) * 100));
        nodeBar.style.width = `${pct}%`;
      }
    }
  }

  function renderSponsorValidationTable() {
    const tbody = document.getElementById('sponsorTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    Object.values(appState.stalls).forEach(stall => {
      const zone = appState.zones[stall.zone_id];
      const isBoosted = zone && zone.is_boosted;
      const fillPct = Math.round((stall.live_headcount / stall.capacity) * 100);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <strong>${stall.name}</strong><br>
          <span style="color: var(--color-cyan); font-size: 11px;">${stall.sponsor_name}</span>
        </td>
        <td>
          ${zone ? zone.name.split(':')[0] : 'Zone'} 
          ${isBoosted ? `<span class="badge badge-boost" style="margin-left: 4px;">🔥 ${zone.boost_multiplier}x</span>` : ''}
        </td>
        <td>
          <strong style="color: ${fillPct > 80 ? 'var(--color-rose)' : 'var(--color-emerald)'}">${stall.live_headcount}</strong>
          <span style="color: var(--text-dim); font-size: 11px;"> / ${stall.capacity}</span>
        </td>
        <td><strong>${stall.total_footfall.toLocaleString()}</strong></td>
        <td><strong style="color: var(--color-cyan);">${(stall.verified_scan_count || stall.total_footfall).toLocaleString()}</strong></td>
        <td>${stall.unique_attendees || Math.round(stall.total_footfall * 0.9)}</td>
        <td>
          <span class="badge-verified">
            <span>🛡️</span> Verified
          </span>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderLiveAuditFeed() {
    const tbody = document.getElementById('liveAuditFeedBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const recent = appState.checkins_log.slice(0, 8);
    recent.forEach(chk => {
      const tr = document.createElement('tr');
      const timeStr = new Date(chk.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      tr.innerHTML = `
        <td style="font-family: var(--font-mono); color: var(--text-dim);">${timeStr}</td>
        <td><strong>${chk.attendee_name}</strong></td>
        <td><code style="font-size: 11px; color: var(--color-cyan);">${chk.attendee_pass_id}</code></td>
        <td>${chk.location_name}</td>
        <td>${chk.was_boosted ? `<span class="text-amber">🔥 ${chk.multiplier}x Boost</span>` : '1.0x Standard'}</td>
        <td><strong class="text-emerald">+${chk.points_awarded}</strong></td>
        <td><span class="db-sync-badge">✓ SUPABASE COMMIT</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- TOAST NOTIFICATIONS ---
  function showToast(message, type = 'info') {
    const stack = document.getElementById('toastStack');
    if (!stack) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'boost' ? 'toast-boost' : type === 'success' ? 'toast-success' : ''}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'boost' ? '🔥' : type === 'success' ? '✓' : '⚡'}</span>
      <span class="toast-text">${message}</span>
    `;
    stack.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // --- VOUCHER MODAL ---
  function openVoucherModal(title, code, pointsSpent) {
    const backdrop = document.getElementById('voucherModalBackdrop');
    const titleElem = document.getElementById('voucherTitle');
    const codeElem = document.getElementById('voucherCodeDisplay');
    const spentElem = document.getElementById('voucherPointsSpent');
    const qrCanvas = document.getElementById('voucherQrCanvas');

    if (titleElem) titleElem.textContent = title;
    if (codeElem) codeElem.textContent = code;
    if (spentElem) spentElem.textContent = pointsSpent;
    if (qrCanvas) drawQRCode(qrCanvas, code);
    if (backdrop) backdrop.classList.add('show');
  }

  function closeVoucherModal() {
    const backdrop = document.getElementById('voucherModalBackdrop');
    if (backdrop) backdrop.classList.remove('show');
  }

  // =========================================================================
  // EMERGENCY MEDICAL PROFILE & TRIAGE SYSTEM
  // =========================================================================

  let currentEmergencyPassId = null;
  let emergencyCallTimer = null;
  let staffScannerEmergencyMode = false;

  function getBloodGroupLabel(bg) {
    const labels = {
      'O+': 'Universal Donor (RBC)', 'O-': 'Universal Donor (All)',
      'A+': 'Type A Positive', 'A-': 'Type A Negative',
      'B+': 'Type B Positive', 'B-': 'Type B Negative',
      'AB+': 'Universal Recipient', 'AB-': 'Type AB Negative'
    };
    return labels[bg] || bg;
  }

  function renderMedicalProfile(attendee) {
    const med = attendee.medical_profile;
    if (!med) return;

    const el = (id) => document.getElementById(id);

    // Pass card blood badge
    const passBlood = el('userPassBloodBadge');
    if (passBlood) passBlood.textContent = '🩸 ' + (med.blood_group || 'N/A');

    // Consumer medical card vitals
    const bg = el('consumerBloodGroup');
    if (bg) bg.textContent = med.blood_group || '—';

    const bgSub = el('consumerBloodSub');
    if (bgSub) bgSub.textContent = getBloodGroupLabel(med.blood_group);

    const age = el('consumerAge');
    if (age) age.textContent = (med.age || '—') + ' yrs';

    const h = el('consumerHeight');
    if (h) {
      const hParts = (med.height || '').split('(');
      h.textContent = hParts[0].trim();
    }

    const hm = el('consumerHeightMetric');
    if (hm) {
      const hParts = (med.height || '').match(/\(([^)]+)\)/);
      hm.textContent = hParts ? hParts[1] : '';
    }

    const w = el('consumerWeight');
    if (w) w.textContent = med.weight || '—';

    // Emergency contact
    const ec = med.emergency_contact || {};
    const cn = el('consumerContactName');
    if (cn) cn.textContent = ec.name || '—';

    const cr = el('consumerContactRelation');
    if (cr) cr.textContent = '(' + (ec.relation || 'Contact') + ')';

    const cp = el('consumerContactPhone');
    if (cp) cp.textContent = ec.phone || '—';

    // Allergies & conditions
    const al = el('consumerAllergies');
    if (al) al.textContent = med.allergies || 'No known allergies (NKDA)';

    const co = el('consumerConditions');
    if (co) co.textContent = med.conditions || 'No chronic conditions reported';
  }

  function renderSafetyAlertCounter() {
    const alertCount = appState.active_emergency_count || 0;
    const safetyText = document.getElementById('featSafetyText');
    if (safetyText) {
      if (alertCount > 0) {
        safetyText.textContent = alertCount + ' ACTIVE ALERT' + (alertCount > 1 ? 'S' : '') + ' · DISPATCHED';
        safetyText.style.color = '#e74c3c';
      } else {
        safetyText.textContent = '0 OPEN ALERTS';
        safetyText.style.color = '';
      }
    }
  }

  function openEmergencyModal(passId, locationId) {
    const attendee = appState.attendees[passId];
    if (!attendee) {
      showToast('❌ Pass ID not found: ' + passId, 'error');
      return;
    }

    currentEmergencyPassId = passId;
    const med = attendee.medical_profile || {};
    const ec = med.emergency_contact || {};
    const el = (id) => document.getElementById(id);

    // Fill patient identity
    const av = el('emgPatientAvatar');
    if (av) av.textContent = attendee.avatar_initials || attendee.full_name.substring(0, 2).toUpperCase();

    const nm = el('emgPatientName');
    if (nm) nm.textContent = attendee.full_name;

    const pid = el('emgPatientPassId');
    if (pid) pid.textContent = attendee.pass_id;

    // Location
    let locName = 'General Venue Area';
    if (locationId === 'main_gate') {
      locName = appState.main_gate.name;
    } else if (appState.stalls[locationId]) {
      locName = appState.stalls[locationId].name;
    }
    const loc = el('emgIncidentLocName');
    if (loc) loc.textContent = locName;

    // Vitals
    const bg = el('emgBloodGroup');
    if (bg) bg.textContent = med.blood_group || '—';

    const bgs = el('emgBloodSub');
    if (bgs) bgs.textContent = getBloodGroupLabel(med.blood_group);

    const age = el('emgAge');
    if (age) age.textContent = (med.age || '—') + ' Yrs';

    const ht = el('emgHeight');
    if (ht) ht.textContent = med.height || '—';

    const wt = el('emgWeight');
    if (wt) wt.textContent = med.weight || '—';

    const od = el('emgOrganDonor');
    if (od) od.textContent = med.organ_donor ? 'Registered ✓' : 'Not Registered';

    // Allergies & conditions
    const alg = el('emgAllergies');
    if (alg) alg.textContent = med.allergies || 'No known allergies (NKDA)';

    const cond = el('emgConditions');
    if (cond) cond.textContent = med.conditions || 'No chronic conditions reported';

    const notes = el('emgMedicalNotes');
    if (notes) notes.textContent = med.medical_notes || '';

    // Emergency contact
    const ecn = el('emgContactName');
    if (ecn) ecn.innerHTML = (ec.name || '—') + ' <span class="contact-rel-pill">' + (ec.relation || 'Contact') + '</span>';

    const ecp = el('emgContactPhone');
    if (ecp) ecp.textContent = ec.phone || '—';

    // Reset dispatch status
    const smsPreview = el('simulatedSmsPreview');
    if (smsPreview) smsPreview.style.display = 'none';

    const paramCard = el('paramedicTimelineCard');
    if (paramCard) paramCard.style.display = 'none';

    const alertHead = el('emgAlertHeadline');
    if (alertHead) alertHead.textContent = 'Emergency Contacts Ready to be Alerted';

    const alertDot = el('emgAlertDot');
    if (alertDot) alertDot.className = 'live-dot-pulse-amber';

    // Fill SMS preview data
    const smsName = el('smsPatientName');
    if (smsName) smsName.textContent = attendee.full_name;

    const smsLoc = el('smsLocation');
    if (smsLoc) smsLoc.textContent = locName;

    const smsBlood = el('smsBlood');
    if (smsBlood) smsBlood.textContent = med.blood_group || '—';

    const smsPhone = el('smsPhoneNum');
    if (smsPhone) smsPhone.textContent = ec.phone || '—';

    const paramLoc = el('paramedicLoc');
    if (paramLoc) paramLoc.textContent = locName;

    // Show modal
    const modal = el('emergencyModalBackdrop');
    if (modal) modal.classList.add('show');

    // Play alert tone
    playEmergencyAlertTone();

    showToast('🚨 EMERGENCY TRIAGE OPENED for ' + attendee.full_name, 'emergency');
  }

  function playEmergencyAlertTone() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      // Two-tone siren: high then low
      [880, 660].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        gain.gain.value = 0.08;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + (i + 1) * 0.15);
      });
    } catch (e) { /* audio not available */ }
  }

  function dispatchEmergencySms() {
    const el = (id) => document.getElementById(id);
    const smsPreview = el('simulatedSmsPreview');
    if (smsPreview) {
      smsPreview.style.display = 'block';
      smsPreview.classList.add('fade-in-up');
    }

    const sentTime = el('smsSentTime');
    if (sentTime) sentTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const alertHead = el('emgAlertHeadline');
    if (alertHead) {
      alertHead.textContent = '✓ SMS Alert Dispatched · Carrier Confirmed Delivery';
      alertHead.style.color = '#27ae60';
    }

    const alertDot = el('emgAlertDot');
    if (alertDot) alertDot.className = 'live-dot-pulse-green';

    playSuccessChime();
    showToast('📲 Emergency SMS Alert dispatched with GPS coordinates!', 'emergency');

    // Update state
    appState.active_emergency_count = (appState.active_emergency_count || 0) + 1;
    broadcastLocalState();
    renderSafetyAlertCounter();
  }

  function dispatchParamedic() {
    const el = (id) => document.getElementById(id);
    const paramCard = el('paramedicTimelineCard');
    if (paramCard) {
      paramCard.style.display = 'block';
      paramCard.classList.add('fade-in-up');
    }

    const eta = el('paramedicEta');
    if (eta) {
      let seconds = 60;
      eta.textContent = 'ETA: ' + seconds + ' SEC';
      const interval = setInterval(() => {
        seconds -= 5;
        if (seconds <= 0) {
          eta.textContent = 'ARRIVED ✓';
          eta.style.background = '#27ae60';
          clearInterval(interval);
        } else {
          eta.textContent = 'ETA: ' + seconds + ' SEC';
        }
      }, 2000);
    }

    showToast('🚑 Paramedic Unit #2 dispatched to incident location!', 'emergency');
  }

  function simulateEmergencyCall() {
    const attendee = appState.attendees[currentEmergencyPassId];
    if (!attendee) return;

    const ec = attendee.medical_profile?.emergency_contact || {};
    const el = (id) => document.getElementById(id);

    const callName = el('callName');
    if (callName) callName.textContent = ec.name || 'Emergency Contact';

    const callNum = el('callNumber');
    if (callNum) callNum.textContent = ec.phone || '—';

    const callAvatar = el('callAvatar');
    if (callAvatar) callAvatar.textContent = (ec.name || 'EC').substring(0, 2).toUpperCase();

    const callStatus = el('callStatusText');
    if (callStatus) callStatus.textContent = 'Connecting via PingQ Emergency Relay...';

    const callTimerEl = el('callTimer');
    if (callTimerEl) callTimerEl.style.display = 'none';

    const modal = el('emergencyCallModalBackdrop');
    if (modal) modal.classList.add('show');

    // Simulate ringing then connected
    setTimeout(() => {
      if (callStatus) callStatus.textContent = 'Ringing...';
    }, 1200);

    setTimeout(() => {
      if (callStatus) callStatus.textContent = 'Connected · Call Active';
      if (callTimerEl) {
        callTimerEl.style.display = 'block';
        let seconds = 0;
        emergencyCallTimer = setInterval(() => {
          seconds++;
          const m = String(Math.floor(seconds / 60)).padStart(2, '0');
          const s = String(seconds % 60).padStart(2, '0');
          callTimerEl.textContent = m + ':' + s;
        }, 1000);
      }
    }, 3000);
  }

  function endEmergencyCall() {
    if (emergencyCallTimer) {
      clearInterval(emergencyCallTimer);
      emergencyCallTimer = null;
    }
    const modal = document.getElementById('emergencyCallModalBackdrop');
    if (modal) modal.classList.remove('show');
    showToast('📞 Emergency call ended');
  }

  function resolveEmergency() {
    appState.active_emergency_count = Math.max(0, (appState.active_emergency_count || 1) - 1);
    broadcastLocalState();
    renderSafetyAlertCounter();

    const modal = document.getElementById('emergencyModalBackdrop');
    if (modal) modal.classList.remove('show');

    showToast('✓ Emergency incident resolved and alerts cleared', 'success');
    playSuccessChime();
    triggerConfetti();
  }

  function openEditMedicalModal() {
    const attendee = appState.attendees[activeAttendeePassId];
    if (!attendee) return;

    const med = attendee.medical_profile || {};
    const ec = med.emergency_contact || {};
    const el = (id) => document.getElementById(id);

    const bg = el('editBloodGroup');
    if (bg) bg.value = med.blood_group || 'O+';

    const age = el('editAge');
    if (age) age.value = med.age || 24;

    const ht = el('editHeight');
    if (ht) ht.value = med.height || '';

    const wt = el('editWeight');
    if (wt) wt.value = med.weight || '';

    const cn = el('editContactName');
    if (cn) cn.value = ec.name || '';

    const cr = el('editContactRelation');
    if (cr) cr.value = ec.relation || '';

    const cp = el('editContactPhone');
    if (cp) cp.value = ec.phone || '';

    const al = el('editAllergies');
    if (al) al.value = med.allergies || '';

    const co = el('editConditions');
    if (co) co.value = med.conditions || '';

    const modal = el('editMedicalModalBackdrop');
    if (modal) modal.classList.add('show');
  }

  function saveMedicalProfile() {
    const attendee = appState.attendees[activeAttendeePassId];
    if (!attendee) return;

    const el = (id) => document.getElementById(id);

    attendee.medical_profile = {
      ...attendee.medical_profile,
      blood_group: el('editBloodGroup')?.value || 'O+',
      age: parseInt(el('editAge')?.value) || 24,
      height: el('editHeight')?.value || '',
      weight: el('editWeight')?.value || '',
      emergency_contact: {
        ...(attendee.medical_profile?.emergency_contact || {}),
        name: el('editContactName')?.value || '',
        relation: el('editContactRelation')?.value || '',
        phone: el('editContactPhone')?.value || ''
      },
      allergies: el('editAllergies')?.value || '',
      conditions: el('editConditions')?.value || ''
    };

    broadcastLocalState();
    renderAll();

    const modal = el('editMedicalModalBackdrop');
    if (modal) modal.classList.remove('show');

    showToast('✓ Medical Emergency ID updated successfully!', 'success');
    playSuccessChime();
  }

  function openBystanderScanModal() {
    const modal = document.getElementById('bystanderScanModalBackdrop');
    if (modal) modal.classList.add('show');
  }

  // --- EVENT LISTENERS INITIALIZATION ---
  function initEventHandlers() {
    // Mode Switcher Tabs
    const tabLandingBtn = document.getElementById('tabLandingBtn');
    const tabConsumerBtn = document.getElementById('tabConsumerBtn');
    const tabStaffBtn = document.getElementById('tabStaffBtn');
    const tabSplitBtn = document.getElementById('tabSplitBtn');
    const landingPageView = document.getElementById('landingPageView');
    const consumerPortalView = document.getElementById('consumerPortalView');
    const staffPortalView = document.getElementById('staffPortalView');
    const mainViewport = document.getElementById('mainViewport');

    function setViewMode(mode) {
      if (tabLandingBtn) tabLandingBtn.classList.remove('active');
      if (tabConsumerBtn) tabConsumerBtn.classList.remove('active');
      if (tabStaffBtn) tabStaffBtn.classList.remove('active');
      if (tabSplitBtn) tabSplitBtn.classList.remove('active');
      if (mainViewport) mainViewport.classList.remove('split-mode');

      if (landingPageView) landingPageView.classList.remove('active');
      if (consumerPortalView) consumerPortalView.classList.remove('active');
      if (staffPortalView) staffPortalView.classList.remove('active');

      if (mode === 'landing') {
        if (tabLandingBtn) tabLandingBtn.classList.add('active');
        if (landingPageView) landingPageView.classList.add('active');
      } else if (mode === 'consumer') {
        if (tabConsumerBtn) tabConsumerBtn.classList.add('active');
        if (consumerPortalView) consumerPortalView.classList.add('active');
      } else if (mode === 'staff') {
        if (tabStaffBtn) tabStaffBtn.classList.add('active');
        if (staffPortalView) staffPortalView.classList.add('active');
      } else if (mode === 'split') {
        if (tabSplitBtn) tabSplitBtn.classList.add('active');
        if (consumerPortalView) consumerPortalView.classList.add('active');
        if (staffPortalView) staffPortalView.classList.add('active');
        if (mainViewport) mainViewport.classList.add('split-mode');
      }
    }

    if (tabLandingBtn) tabLandingBtn.addEventListener('click', () => setViewMode('landing'));
    if (tabConsumerBtn) tabConsumerBtn.addEventListener('click', () => setViewMode('consumer'));
    if (tabStaffBtn) tabStaffBtn.addEventListener('click', () => setViewMode('staff'));
    if (tabSplitBtn) tabSplitBtn.addEventListener('click', () => setViewMode('split'));

    // Set initial view to Landing Page
    setViewMode('landing');

    // --- LANDING PAGE QUICK ACTIONS ---
    const heroConsumerLoginBtn = document.getElementById('heroConsumerLoginBtn');
    const heroStaffLoginBtn = document.getElementById('heroStaffLoginBtn');
    const heroOpenModalBtn = document.getElementById('heroOpenModalBtn');
    const navDemoLoginBtn = document.getElementById('navDemoLoginBtn');
    const wristbandEnterPortalBtn = document.getElementById('wristbandEnterPortalBtn');
    const authModalBackdrop = document.getElementById('authModalBackdrop');
    const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');

    if (heroConsumerLoginBtn) {
      heroConsumerLoginBtn.addEventListener('click', () => {
        activeAttendeePassId = 'PQ-7F3K';
        const attendeeSelect = document.getElementById('attendeeSelect');
        if (attendeeSelect) attendeeSelect.value = 'PQ-7F3K';
        initAudio();
        playSuccessChime();
        triggerConfetti();
        renderAll();
        setViewMode('consumer');
        showToast('👤 Logged in as Aarav S. (TechNova \'26 · Band Pass)');
      });
    }

    if (heroStaffLoginBtn) {
      heroStaffLoginBtn.addEventListener('click', () => {
        initAudio();
        playScanBeep();
        setViewMode('staff');
        showToast('🛡️ Logged into Staff & Admin Command Hub');
      });
    }

    if (wristbandEnterPortalBtn) {
      wristbandEnterPortalBtn.addEventListener('click', () => {
        activeAttendeePassId = 'PQ-7F3K';
        const attendeeSelect = document.getElementById('attendeeSelect');
        if (attendeeSelect) attendeeSelect.value = 'PQ-7F3K';
        initAudio();
        playSuccessChime();
        renderAll();
        setViewMode('consumer');
        showToast('⚡ Entered Consumer Portal with Pass PQ-7F3K');
      });
    }

    function openAuthModal() {
      if (authModalBackdrop) authModalBackdrop.classList.add('show');
    }
    function closeAuthModal() {
      if (authModalBackdrop) authModalBackdrop.classList.remove('show');
    }

    if (heroOpenModalBtn) heroOpenModalBtn.addEventListener('click', openAuthModal);
    if (navDemoLoginBtn) navDemoLoginBtn.addEventListener('click', openAuthModal);
    if (closeAuthModalBtn) closeAuthModalBtn.addEventListener('click', closeAuthModal);

    // Auth Modal Tabs
    const authTabConsumerBtn = document.getElementById('authTabConsumerBtn');
    const authTabStaffBtn = document.getElementById('authTabStaffBtn');
    const paneAuthConsumer = document.getElementById('paneAuthConsumer');
    const paneAuthStaff = document.getElementById('paneAuthStaff');

    if (authTabConsumerBtn && authTabStaffBtn) {
      authTabConsumerBtn.addEventListener('click', () => {
        authTabConsumerBtn.classList.add('active');
        authTabStaffBtn.classList.remove('active');
        if (paneAuthConsumer) paneAuthConsumer.classList.add('active');
        if (paneAuthStaff) paneAuthStaff.classList.remove('active');
      });

      authTabStaffBtn.addEventListener('click', () => {
        authTabStaffBtn.classList.add('active');
        authTabConsumerBtn.classList.remove('active');
        if (paneAuthStaff) paneAuthStaff.classList.add('active');
        if (paneAuthConsumer) paneAuthConsumer.classList.remove('active');
      });
    }

    // Dummy Consumer Cards Selection
    let selectedConsumerPass = 'PQ-7F3K';
    const consumerAccCards = document.querySelectorAll('#paneAuthConsumer .dummy-acc-card');
    consumerAccCards.forEach(card => {
      card.addEventListener('click', () => {
        consumerAccCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedConsumerPass = card.getAttribute('data-user-pass');
        const passInput = document.getElementById('dummyPassInput');
        if (passInput) passInput.value = selectedConsumerPass;

        const nameH4 = card.querySelector('.acc-details h4');
        const loginSelectedName = document.getElementById('loginSelectedName');
        if (loginSelectedName && nameH4) {
          loginSelectedName.textContent = nameH4.childNodes[0].textContent.trim();
        }
      });
    });

    // Confirm Consumer Login
    const confirmConsumerLoginBtn = document.getElementById('confirmConsumerLoginBtn');
    if (confirmConsumerLoginBtn) {
      confirmConsumerLoginBtn.addEventListener('click', () => {
        activeAttendeePassId = selectedConsumerPass;
        const attendeeSelect = document.getElementById('attendeeSelect');
        if (attendeeSelect) attendeeSelect.value = selectedConsumerPass;
        closeAuthModal();
        initAudio();
        playSuccessChime();
        triggerConfetti();
        renderAll();
        setViewMode('consumer');
        const att = appState.attendees[selectedConsumerPass];
        showToast(`👤 Signed in as ${att ? att.full_name : selectedConsumerPass}!`);
      });
    }

    // Dummy Staff Cards Selection
    const staffAccCards = document.querySelectorAll('#paneAuthStaff .dummy-acc-card');
    staffAccCards.forEach(card => {
      card.addEventListener('click', () => {
        staffAccCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });

    // Confirm Staff Login
    const confirmStaffLoginBtn = document.getElementById('confirmStaffLoginBtn');
    if (confirmStaffLoginBtn) {
      confirmStaffLoginBtn.addEventListener('click', () => {
        closeAuthModal();
        initAudio();
        playScanBeep();
        setViewMode('staff');
        showToast('🛡️ Signed in to Staff & Admin Hub!');
      });
    }

    // --- TWO WORKFLOWS COMPARISON INTERACTIVITY (From Screenshot 2) ---
    const btnEnvEvents = document.getElementById('btnEnvEvents');
    const btnEnvHospitals = document.getElementById('btnEnvHospitals');
    const wfRows = document.querySelectorAll('.workflows-table-body .wf-row');

    if (btnEnvEvents && btnEnvHospitals) {
      btnEnvEvents.addEventListener('click', () => {
        btnEnvEvents.classList.add('active');
        btnEnvHospitals.classList.remove('active');
        wfRows.forEach(row => {
          row.classList.add('active-env-left');
          row.classList.remove('active-env-right');
        });
      });

      btnEnvHospitals.addEventListener('click', () => {
        btnEnvHospitals.classList.add('active');
        btnEnvEvents.classList.remove('active');
        wfRows.forEach(row => {
          row.classList.add('active-env-right');
          row.classList.remove('active-env-left');
        });
      });
    }

    // Row click toggle
    wfRows.forEach(row => {
      row.addEventListener('click', () => {
        if (row.classList.contains('active-env-left')) {
          row.classList.remove('active-env-left');
          row.classList.add('active-env-right');
        } else {
          row.classList.remove('active-env-right');
          row.classList.add('active-env-left');
        }
      });
    });

    // Attendee Switcher
    const attendeeSelect = document.getElementById('attendeeSelect');
    if (attendeeSelect) {
      attendeeSelect.addEventListener('change', (e) => {
        activeAttendeePassId = e.target.value;
        const manualPass = document.getElementById('manualPassInput');
        if (manualPass) manualPass.value = activeAttendeePassId;
        renderAll();
        showToast(`👤 Switched profile to ${appState.attendees[activeAttendeePassId].full_name}`);
      });
    }

    // Copy Pass ID
    const copyPassIdBtn = document.getElementById('copyPassIdBtn');
    if (copyPassIdBtn) {
      copyPassIdBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(activeAttendeePassId);
        showToast(`📋 Copied Pass ID: ${activeAttendeePassId}`);
      });
    }

    // Demo QR Check-in Station Button
    const triggerDemoCheckinBtn = document.getElementById('triggerDemoCheckinBtn');
    const demoLocationSelect = document.getElementById('demoLocationSelect');
    if (triggerDemoCheckinBtn && demoLocationSelect) {
      triggerDemoCheckinBtn.addEventListener('click', async () => {
        const locId = demoLocationSelect.value;
        const res = await performCheckin(activeAttendeePassId, locId);
        if (res && res.success) {
          showToast(`⚡ Check-in Confirmed! +${res.pointsAwarded} PTS awarded at ${res.checkin.location_name}!`, res.isBoosted ? 'boost' : 'success');
        }
      });

      demoLocationSelect.addEventListener('change', updateDemoCheckinPreview);
    }

    // Fast Jump Location Chips
    const fastLocChips = document.querySelectorAll('.checkin-quick-buttons .chip-btn');
    fastLocChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const loc = chip.getAttribute('data-loc');
        if (demoLocationSelect) {
          demoLocationSelect.value = loc;
          updateDemoCheckinPreview();
        }
      });
    });

    // Radar action button
    const radarActionBtn = document.getElementById('radarActionBtn');
    if (radarActionBtn) {
      radarActionBtn.addEventListener('click', () => {
        const z2Block = document.getElementById('consumerZone2Block');
        if (z2Block) {
          z2Block.scrollIntoView({ behavior: 'smooth', block: 'center' });
          z2Block.style.boxShadow = '0 0 30px rgba(245, 158, 11, 0.6)';
          setTimeout(() => z2Block.style.boxShadow = '', 1500);
        }
      });
    }

    // Admin Zone Boost controls
    const zone1BoostToggle = document.getElementById('zone1BoostToggle');
    const zone2BoostToggle = document.getElementById('zone2BoostToggle');
    const saveBoostSettingsBtn = document.getElementById('saveBoostSettingsBtn');

    // Multiplier chips for Zone 1
    const z1Chips = document.querySelectorAll('#zone1MultiplierChips .mult-chip');
    z1Chips.forEach(chip => {
      chip.addEventListener('click', () => {
        z1Chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });

    // Multiplier chips for Zone 2
    const z2Chips = document.querySelectorAll('#zone2MultiplierChips .mult-chip');
    z2Chips.forEach(chip => {
      chip.addEventListener('click', () => {
        z2Chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });

    if (saveBoostSettingsBtn) {
      saveBoostSettingsBtn.addEventListener('click', () => {
        const z1Active = zone1BoostToggle ? zone1BoostToggle.checked : false;
        const z2Active = zone2BoostToggle ? zone2BoostToggle.checked : false;

        const activeZ1Chip = document.querySelector('#zone1MultiplierChips .mult-chip.active');
        const activeZ2Chip = document.querySelector('#zone2MultiplierChips .mult-chip.active');

        const z1Mult = activeZ1Chip ? Number(activeZ1Chip.getAttribute('data-val')) : 2.0;
        const z2Mult = activeZ2Chip ? Number(activeZ2Chip.getAttribute('data-val')) : 2.5;

        updateZoneBoost('zone_1', z1Active, z1Mult);
        updateZoneBoost('zone_2', z2Active, z2Mult);

        showToast('⚡ Zone Boost strategy updated across live venue!');
      });
    }

    // Staff Scanner window
    const submitScanBtn = document.getElementById('submitScanBtn');
    const manualPassInput = document.getElementById('manualPassInput');
    const scannerStationSelect = document.getElementById('scannerStationSelect');
    const scanResultFeedback = document.getElementById('scanResultFeedback');

    if (submitScanBtn && manualPassInput && scannerStationSelect) {
      submitScanBtn.addEventListener('click', async () => {
        const pass = manualPassInput.value.trim() || activeAttendeePassId;
        const station = scannerStationSelect.value;
        const res = await performCheckin(pass, station);

        if (res && res.success) {
          if (scanResultFeedback) {
            scanResultFeedback.style.display = 'block';
            document.getElementById('resAttendeeName').textContent = res.attendee.full_name;
            document.getElementById('resLocName').textContent = res.checkin.location_name;
            document.getElementById('resPtsAwarded').textContent = `+${res.pointsAwarded} PTS ${res.isBoosted ? '(Boosted ' + res.multiplier + 'x 🔥)' : ''}`;
          }
        }
      });
    }

    // Quick attendee chips in scanner
    const scannerAttendeeChips = document.querySelectorAll('.quick-attendee-chips .chip-btn');
    scannerAttendeeChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const pass = chip.getAttribute('data-pass');
        if (manualPassInput) manualPassInput.value = pass;
      });
    });

    // Sound toggle button
    const toggleSoundBtn = document.getElementById('toggleSoundBtn');
    const soundIcon = document.getElementById('soundIcon');
    if (toggleSoundBtn && soundIcon) {
      toggleSoundBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
        showToast(`Sound feedback ${soundEnabled ? 'enabled' : 'muted'}`);
      });
    }

    // Reset Demo Data
    const resetDemoBtn = document.getElementById('resetDemoBtn');
    if (resetDemoBtn) {
      resetDemoBtn.addEventListener('click', async () => {
        if (!confirm('Reset all headcount, check-ins, and reward points to baseline?')) return;
        if (isServerAvailable) {
          await fetch('/api/reset', { method: 'POST' });
        } else {
          appState = createDefaultState();
          broadcastLocalState();
          renderAll();
        }
        showToast('🔄 Demo state reset to initial baseline.');
      });
    }

    // Export CSV
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        if (isServerAvailable) {
          window.location.href = '/api/sponsors/export';
        } else {
          downloadLocalSponsorCsv();
        }
      });
    }

    // Supabase Modal & Tabs
    const openSupabaseModalBtn = document.getElementById('openSupabaseModalBtn');
    const closeSupabaseModalBtn = document.getElementById('closeSupabaseModalBtn');
    const supabaseModalBackdrop = document.getElementById('supabaseModalBackdrop');

    if (openSupabaseModalBtn && supabaseModalBackdrop) {
      openSupabaseModalBtn.addEventListener('click', () => {
        supabaseModalBackdrop.classList.add('show');
        loadSqlSchemaPreview();
      });
    }
    if (closeSupabaseModalBtn && supabaseModalBackdrop) {
      closeSupabaseModalBtn.addEventListener('click', () => {
        supabaseModalBackdrop.classList.remove('show');
      });
    }

    // Modal Tabs
    const modalTabs = document.querySelectorAll('.modal-tab');
    modalTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        modalTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.getAttribute('data-tab');
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        if (target === 'credentials') document.getElementById('paneCreds').classList.add('active');
        if (target === 'schema') document.getElementById('paneSchema').classList.add('active');
        if (target === 'instructions') document.getElementById('paneInstructions').classList.add('active');
      });
    });

    // Copy SQL Schema
    const copySchemaBtn = document.getElementById('copySchemaBtn');
    if (copySchemaBtn) {
      copySchemaBtn.addEventListener('click', () => {
        const code = document.getElementById('schemaCodeText').innerText;
        navigator.clipboard.writeText(code);
        showToast('📋 Supabase SQL Schema copied to clipboard!');
      });
    }

    // Save Supabase Credentials
    const saveSupabaseCredsBtn = document.getElementById('saveSupabaseCredsBtn');
    if (saveSupabaseCredsBtn) {
      saveSupabaseCredsBtn.addEventListener('click', () => {
        const url = document.getElementById('sbUrlInput').value.trim();
        const key = document.getElementById('sbKeyInput').value.trim();
        if (url && key) {
          localStorage.setItem('curaevent_sb_url', url);
          localStorage.setItem('curaevent_sb_key', key);
          document.getElementById('sbConnectionStatusText').textContent = `Connected to ${url.replace('https://', '')}`;
          showToast('⚡ Supabase credentials saved and synced!');
        } else {
          showToast('Please provide both URL and Anon Key');
        }
      });
    }

    // Close Voucher modal
    const closeVoucherModalBtn = document.getElementById('closeVoucherModalBtn');
    const voucherDoneBtn = document.getElementById('voucherDoneBtn');
    if (closeVoucherModalBtn) closeVoucherModalBtn.addEventListener('click', closeVoucherModal);
    if (voucherDoneBtn) voucherDoneBtn.addEventListener('click', closeVoucherModal);

    // Dismiss Flash Banner
    const dismissBannerBtn = document.getElementById('dismissBannerBtn');
    if (dismissBannerBtn) {
      dismissBannerBtn.addEventListener('click', () => {
        document.getElementById('boostFlashBanner').style.display = 'none';
      });
    }

    // =========================================================================
    // EMERGENCY, MEDICAL ID & TRIAGE EVENT HANDLERS
    // =========================================================================

    // Landing page wristband emergency scan
    const heroEmergencyScanBtn = document.getElementById('heroEmergencyScanBtn');
    if (heroEmergencyScanBtn) {
      heroEmergencyScanBtn.addEventListener('click', () => {
        openEmergencyModal('PQ-7F3K', 'stall_4');
      });
    }

    // Consumer portal: Preview Emergency Triage
    const btnOpenResponderPreview = document.getElementById('btnOpenResponderPreview');
    if (btnOpenResponderPreview) {
      btnOpenResponderPreview.addEventListener('click', () => {
        const locationSelect = document.getElementById('demoLocationSelect');
        const locId = locationSelect ? locationSelect.value : 'stall_4';
        openEmergencyModal(activeAttendeePassId, locId);
      });
    }

    // Consumer portal: Edit Medical Profile
    const btnEditMedicalProfile = document.getElementById('btnEditMedicalProfile');
    if (btnEditMedicalProfile) {
      btnEditMedicalProfile.addEventListener('click', openEditMedicalModal);
    }

    // Consumer portal: Bystander scan from consumer
    const btnBystanderScanFromConsumer = document.getElementById('btnBystanderScanFromConsumer');
    if (btnBystanderScanFromConsumer) {
      btnBystanderScanFromConsumer.addEventListener('click', openBystanderScanModal);
    }

    // Staff scanner: Emergency mode toggle
    const staffModeNormalBtn = document.getElementById('staffModeNormalBtn');
    const staffModeEmergencyBtn = document.getElementById('staffModeEmergencyBtn');
    if (staffModeNormalBtn) {
      staffModeNormalBtn.addEventListener('click', () => {
        staffScannerEmergencyMode = false;
        staffModeNormalBtn.classList.add('active');
        if (staffModeEmergencyBtn) staffModeEmergencyBtn.classList.remove('active');
        const vf = document.getElementById('staffScannerViewfinder');
        if (vf) vf.classList.remove('emergency-viewfinder');
        const lb = document.getElementById('staffLaserBeam');
        if (lb) { lb.classList.remove('laser-red'); }
        const dot = document.getElementById('scannerLiveDot');
        if (dot) { dot.classList.remove('pulse-red'); dot.classList.add('pulse'); }
        const statusText = document.getElementById('scannerStatusText');
        if (statusText) statusText.textContent = 'OPTICAL RETICLE ACTIVE';
        showToast('🏷️ Scanner set to Standard Check-In Mode');
      });
    }
    if (staffModeEmergencyBtn) {
      staffModeEmergencyBtn.addEventListener('click', () => {
        staffScannerEmergencyMode = true;
        staffModeEmergencyBtn.classList.add('active');
        if (staffModeNormalBtn) staffModeNormalBtn.classList.remove('active');
        const vf = document.getElementById('staffScannerViewfinder');
        if (vf) vf.classList.add('emergency-viewfinder');
        const lb = document.getElementById('staffLaserBeam');
        if (lb) { lb.classList.add('laser-red'); }
        const dot = document.getElementById('scannerLiveDot');
        if (dot) { dot.classList.remove('pulse'); dot.classList.add('pulse-red'); }
        const statusText = document.getElementById('scannerStatusText');
        if (statusText) statusText.textContent = '🚨 EMERGENCY TRIAGE MODE ACTIVE';
        showToast('🚨 Scanner switched to Emergency Triage Mode!', 'emergency');
      });
    }

    // Staff scanner: Emergency scan button
    const btnStaffEmergencyScan = document.getElementById('btnStaffEmergencyScan');
    if (btnStaffEmergencyScan) {
      btnStaffEmergencyScan.addEventListener('click', () => {
        const passInput = document.getElementById('manualPassInput');
        const passId = passInput ? passInput.value.trim() : 'PQ-7F3K';
        const stationSelect = document.getElementById('scannerStationSelect');
        const locId = stationSelect ? stationSelect.value : 'stall_4';
        openEmergencyModal(passId || 'PQ-7F3K', locId);
      });
    }

    // Emergency modal: Dispatch SMS
    const btnDispatchSms = document.getElementById('btnDispatchEmergencySms');
    if (btnDispatchSms) {
      btnDispatchSms.addEventListener('click', dispatchEmergencySms);
    }

    // Emergency modal: Dispatch Paramedic
    const btnDispatchMedic = document.getElementById('btnDispatchParamedic');
    if (btnDispatchMedic) {
      btnDispatchMedic.addEventListener('click', dispatchParamedic);
    }

    // Emergency modal: Simulate Call
    const btnCallContact = document.getElementById('btnCallEmergencyContact');
    if (btnCallContact) {
      btnCallContact.addEventListener('click', simulateEmergencyCall);
    }

    // Emergency modal: Resolve
    const btnResolve = document.getElementById('btnResolveEmergency');
    if (btnResolve) {
      btnResolve.addEventListener('click', resolveEmergency);
    }

    // Emergency modal: Dismiss
    const btnDismissEmg = document.getElementById('btnDismissEmergencyModal');
    const closeEmgBtn = document.getElementById('closeEmergencyModalBtn');
    if (btnDismissEmg) {
      btnDismissEmg.addEventListener('click', () => {
        document.getElementById('emergencyModalBackdrop').classList.remove('show');
      });
    }
    if (closeEmgBtn) {
      closeEmgBtn.addEventListener('click', () => {
        document.getElementById('emergencyModalBackdrop').classList.remove('show');
      });
    }

    // Emergency call: End
    const btnEndCall = document.getElementById('btnEndEmergencyCall');
    if (btnEndCall) {
      btnEndCall.addEventListener('click', endEmergencyCall);
    }

    // Edit Medical modal: Save & Cancel
    const saveMedBtn = document.getElementById('saveMedicalProfileBtn');
    if (saveMedBtn) {
      saveMedBtn.addEventListener('click', saveMedicalProfile);
    }
    const cancelMedBtn = document.getElementById('cancelEditMedicalBtn');
    const closeMedBtn = document.getElementById('closeEditMedicalModalBtn');
    if (cancelMedBtn) {
      cancelMedBtn.addEventListener('click', () => {
        document.getElementById('editMedicalModalBackdrop').classList.remove('show');
      });
    }
    if (closeMedBtn) {
      closeMedBtn.addEventListener('click', () => {
        document.getElementById('editMedicalModalBackdrop').classList.remove('show');
      });
    }

    // Copy emergency contact phone
    const copyContactBtn = document.getElementById('copyContactPhoneBtn');
    if (copyContactBtn) {
      copyContactBtn.addEventListener('click', () => {
        const phone = document.getElementById('consumerContactPhone')?.textContent;
        if (phone) {
          navigator.clipboard.writeText(phone).then(() => {
            showToast('📋 Emergency contact phone copied!');
          });
        }
      });
    }

    // Bystander scanner modal
    const closeBystanderBtn = document.getElementById('closeBystanderScanModalBtn');
    if (closeBystanderBtn) {
      closeBystanderBtn.addEventListener('click', () => {
        document.getElementById('bystanderScanModalBackdrop').classList.remove('show');
      });
    }

    const btnBystanderConfirm = document.getElementById('btnBystanderScanConfirm');
    if (btnBystanderConfirm) {
      btnBystanderConfirm.addEventListener('click', () => {
        const passInput = document.getElementById('bystanderPassInput');
        const passId = passInput ? passInput.value.trim() : 'PQ-7F3K';
        document.getElementById('bystanderScanModalBackdrop').classList.remove('show');
        openEmergencyModal(passId || 'PQ-7F3K', 'stall_4');
      });
    }

    // Bystander quick chips
    document.querySelectorAll('[data-bystander-pass]').forEach(chip => {
      chip.addEventListener('click', () => {
        const passId = chip.getAttribute('data-bystander-pass');
        document.getElementById('bystanderScanModalBackdrop').classList.remove('show');
        openEmergencyModal(passId, 'stall_4');
      });
    });
  }

  function downloadLocalSponsorCsv() {
    const csvHeader = 'Stall ID,Stall Name,Sponsor Name,Category,Zone,Live Headcount,Total Footfall,Verified Scans,Unique Attendees,Capacity\n';
    const csvRows = Object.values(appState.stalls).map(stall => {
      const zone = appState.zones[stall.zone_id];
      return `"${stall.id}","${stall.name}","${stall.sponsor_name}","${stall.sponsor_category}","${zone ? zone.name : ''}",${stall.live_headcount},${stall.total_footfall},${stall.verified_scan_count || stall.total_footfall},${stall.unique_attendees || Math.round(stall.total_footfall * 0.9)},${stall.capacity}`;
    }).join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sponsor_footfall_validation_report.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥 Downloaded Sponsor Footfall CSV Report');
  }

  async function loadSqlSchemaPreview() {
    const codeElem = document.getElementById('schemaCodeText');
    if (!codeElem) return;
    try {
      const res = await fetch('/supabase_schema.sql');
      if (res.ok) {
        codeElem.textContent = await res.text();
        return;
      }
    } catch (e) {}

    codeElem.textContent = `-- ==============================================================================
-- CURAEVENT SUPABASE POSTGRESQL SCHEMA
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.zones (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_boosted BOOLEAN DEFAULT false,
    boost_multiplier NUMERIC(3,1) DEFAULT 2.0,
    capacity INTEGER DEFAULT 500,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stalls (
    id TEXT PRIMARY KEY,
    zone_id TEXT REFERENCES public.zones(id),
    name TEXT NOT NULL,
    sponsor_name TEXT NOT NULL,
    sponsor_category TEXT,
    base_points INTEGER DEFAULT 50,
    live_headcount INTEGER DEFAULT 0,
    total_footfall INTEGER DEFAULT 0,
    capacity INTEGER DEFAULT 150
);

CREATE TABLE IF NOT EXISTS public.attendees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pass_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    tier TEXT DEFAULT 'Standard Pass',
    points_balance INTEGER DEFAULT 100
);

CREATE TABLE IF NOT EXISTS public.checkins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    attendee_pass_id TEXT NOT NULL,
    location_id TEXT NOT NULL,
    points_awarded INTEGER DEFAULT 0,
    was_boosted BOOLEAN DEFAULT false,
    multiplier NUMERIC(3,1) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.checkins, public.zones, public.stalls;`;
  }

  // --- INITIALIZE ON DOM READY ---
  document.addEventListener('DOMContentLoaded', () => {
    initEventHandlers();
    loadInitialState();
  });

})();
