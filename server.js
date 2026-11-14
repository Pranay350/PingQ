// ==============================================================================
// EVENT CURATION PLATFORM - PROTOTYPE BACKEND & REAL-TIME SERVER
// Built with pure Node.js (Zero external dependencies needed)
// Real-time SSE, REST endpoints, In-memory + JSON store with Supabase compatibility
// ==============================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'event_state.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Default State
function getInitialState() {
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
        description: 'Emerging tech, autonomous systems & interactive hardware labs.',
        is_boosted: false,
        boost_multiplier: 2.0,
        capacity: 350,
        stalls: ['stall_1', 'stall_2']
      },
      zone_2: {
        id: 'zone_2',
        name: 'Zone 2: Creator & Entertainment Hub',
        description: 'Esports VR arenas, media creation studios & future mobility.',
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
          weight: "72 kg",
          emergency_contact: {
            name: "Rohan Sharma",
            relation: "Brother / Emergency Primary",
            phone: "+91 98765 43210",
            alt_phone: "+91 98111 22334"
          },
          allergies: "Severe Penicillin allergy, Mild tree nut sensitivity",
          conditions: "Mild bronchial asthma (Carries rescue inhaler in jacket)",
          organ_donor: true,
          medical_notes: "PingQ Medical ID Verified · Encrypted on Wristband Token PQ-7F3K"
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
          weight: "78 kg",
          emergency_contact: {
            name: "Elena Rivera",
            relation: "Spouse",
            phone: "+1 (555) 234-8901",
            alt_phone: "+1 (555) 876-5432"
          },
          allergies: "Sulfa antibiotics allergy",
          conditions: "No chronic conditions reported",
          organ_donor: true,
          medical_notes: "PingQ VIP Passholder · Verified ID"
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
          weight: "54 kg",
          emergency_contact: {
            name: "Dr. Vikram Sharma",
            relation: "Father / Physician",
            phone: "+91 98234 56789",
            alt_phone: "+91 98450 11223"
          },
          allergies: "Severe Peanut allergy (Carries EpiPen in purse)",
          conditions: "Hypoglycemia risk",
          organ_donor: true,
          medical_notes: "Allergic reaction requires immediate EpiPen administration"
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
          weight: "68 kg",
          emergency_contact: {
            name: "Maya Lee",
            relation: "Sister",
            phone: "+1 (555) 901-4455",
            alt_phone: "+1 (555) 678-1234"
          },
          allergies: "No known drug allergies (NKDA)",
          conditions: "Exercise-induced asthma",
          organ_donor: true,
          medical_notes: "Carries standard albuterol inhaler"
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
        description: 'Branded thermal bottle, embroidered tech pouch & sticker bundle.',
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
        points_awarded: 150, // 60 * 2.5
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
        points_awarded: 188, // 75 * 2.5 = 187.5 -> 188
        was_boosted: true,
        multiplier: 2.5,
        timestamp: new Date(Date.now() - 1200000).toISOString()
      }
    ]
  };
}

// Load or initialize state
let state;
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    state = JSON.parse(raw);
  } else {
    state = getInitialState();
    saveState();
  }
} catch (e) {
  console.warn('Could not read state file, initializing fresh state:', e.message);
  state = getInitialState();
  saveState();
}

function saveState() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving state to file:', err.message);
  }
}

// Active SSE Connections
const sseClients = new Set();

function broadcastSSE(eventType, data) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

// Helper: Parse JSON Body
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Send JSON Response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// MIME Types Map
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Create Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // --- API ROUTING ---

  // 1. GET /api/state - Full State
  if (req.method === 'GET' && pathname === '/api/state') {
    return sendJson(res, 200, state);
  }

  // 2. GET /api/events - Realtime SSE Stream
  if (req.method === 'GET' && pathname === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write(`event: init\ndata: ${JSON.stringify({ status: 'connected', timestamp: new Date().toISOString() })}\n\n`);
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  // 3. POST /api/checkin - Process Check-in Scan
  if (req.method === 'POST' && pathname === '/api/checkin') {
    try {
      const { attendeeId, locationId } = await parseJsonBody(req);
      
      const attendeeKey = Object.keys(state.attendees).find(
        key => key === attendeeId || state.attendees[key].id === attendeeId
      ) || 'PASS-ALEX-8821';
      
      const attendee = state.attendees[attendeeKey];
      if (!attendee) {
        return sendJson(res, 404, { error: 'Attendee not found' });
      }

      let locationType = 'stall';
      let locationName = '';
      let zoneId = null;
      let zoneName = '';
      let basePoints = 50;
      let isBoosted = false;
      let multiplier = 1.0;

      if (locationId === 'main_gate') {
        locationType = 'main_gate';
        locationName = state.main_gate.name;
        basePoints = state.main_gate.base_points;
        state.main_gate.live_headcount += 1;
        state.main_gate.total_footfall += 1;
      } else if (state.stalls[locationId]) {
        const stall = state.stalls[locationId];
        locationType = 'stall';
        locationName = stall.name;
        basePoints = stall.base_points;
        zoneId = stall.zone_id;
        
        const zone = state.zones[zoneId];
        zoneName = zone ? zone.name : '';
        if (zone && zone.is_boosted) {
          isBoosted = true;
          multiplier = zone.boost_multiplier || 2.0;
        }

        stall.live_headcount += 1;
        stall.total_footfall += 1;
        stall.verified_scan_count = (stall.verified_scan_count || stall.total_footfall) + 1;
      } else {
        return sendJson(res, 400, { error: `Invalid locationId: ${locationId}` });
      }

      const pointsAwarded = Math.round(basePoints * multiplier);
      attendee.points_balance += pointsAwarded;
      attendee.lifetime_points += pointsAwarded;
      attendee.checkin_count = (attendee.checkin_count || 0) + 1;

      const newCheckin = {
        id: 'chk_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
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

      state.checkins_log.unshift(newCheckin);
      if (state.checkins_log.length > 100) {
        state.checkins_log.pop();
      }

      saveState();

      // Broadcast to all staff dashboards and consumer devices
      broadcastSSE('checkin', {
        checkin: newCheckin,
        attendee: attendee,
        stateSummary: {
          main_gate_headcount: state.main_gate.live_headcount,
          stall_id: locationId,
          stall_headcount: state.stalls[locationId] ? state.stalls[locationId].live_headcount : null,
          stall_footfall: state.stalls[locationId] ? state.stalls[locationId].total_footfall : null
        }
      });

      return sendJson(res, 200, {
        success: true,
        checkin: newCheckin,
        attendee: attendee,
        pointsAwarded,
        isBoosted,
        multiplier
      });
    } catch (err) {
      console.error('Checkin error:', err);
      return sendJson(res, 500, { error: 'Failed to process check-in', details: err.message });
    }
  }

  // 4. POST /api/boost - Toggle or Adjust Zone Boost
  if (req.method === 'POST' && pathname === '/api/boost') {
    try {
      const { zoneId, isBoosted, multiplier } = await parseJsonBody(req);
      if (!state.zones[zoneId]) {
        return sendJson(res, 404, { error: `Zone ${zoneId} not found` });
      }

      const zone = state.zones[zoneId];
      if (typeof isBoosted === 'boolean') {
        zone.is_boosted = isBoosted;
      } else {
        zone.is_boosted = !zone.is_boosted;
      }

      if (multiplier && Number(multiplier) > 1) {
        zone.boost_multiplier = Number(multiplier);
      }

      saveState();

      // Broadcast zone boost change
      broadcastSSE('boost', {
        zoneId,
        zone,
        message: `${zone.name} is now ${zone.is_boosted ? '🔥 BOOSTED (' + zone.boost_multiplier + 'x Points!)' : 'in standard mode'}.`
      });

      return sendJson(res, 200, { success: true, zone });
    } catch (err) {
      return sendJson(res, 500, { error: 'Failed to update zone boost', details: err.message });
    }
  }

  // 5. POST /api/redeem - Redeem Reward Points
  if (req.method === 'POST' && pathname === '/api/redeem') {
    try {
      const { attendeeId, rewardId } = await parseJsonBody(req);
      const attendeeKey = Object.keys(state.attendees).find(
        key => key === attendeeId || state.attendees[key].id === attendeeId
      ) || 'PASS-ALEX-8821';
      const attendee = state.attendees[attendeeKey];

      const reward = state.rewards.find(r => r.id === rewardId);
      if (!reward) {
        return sendJson(res, 404, { error: 'Reward not found' });
      }

      if (attendee.points_balance < reward.points_cost) {
        return sendJson(res, 400, { 
          error: `Insufficient points. Required: ${reward.points_cost}, Current balance: ${attendee.points_balance}` 
        });
      }

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

      state.redemptions.unshift(redemption);
      saveState();

      broadcastSSE('redemption', { redemption, attendee });

      return sendJson(res, 200, {
        success: true,
        voucherCode,
        newBalance: attendee.points_balance,
        redemption
      });
    } catch (err) {
      return sendJson(res, 500, { error: 'Failed to redeem reward', details: err.message });
    }
  }

  // 6. POST /api/reset - Reset Demo Data
  if (req.method === 'POST' && pathname === '/api/reset') {
    state = getInitialState();
    saveState();
    broadcastSSE('reset', { message: 'State has been reset to defaults' });
    return sendJson(res, 200, { success: true, state });
  }

  // 7. GET /api/sponsors/export - CSV Export for Sponsors
  if (req.method === 'GET' && pathname === '/api/sponsors/export') {
    const csvHeader = 'Stall ID,Stall Name,Sponsor Name,Category,Zone,Live Headcount,Total Footfall,Verified Scans,Unique Attendees,Capacity,Fill Rate %\n';
    const csvRows = Object.values(state.stalls).map(stall => {
      const zone = state.zones[stall.zone_id];
      const fillRate = Math.round((stall.live_headcount / stall.capacity) * 100);
      return `"${stall.id}","${stall.name}","${stall.sponsor_name}","${stall.sponsor_category}","${zone ? zone.name : ''}",${stall.live_headcount},${stall.total_footfall},${stall.verified_scan_count || stall.total_footfall},${stall.unique_attendees || Math.round(stall.total_footfall * 0.9)},${stall.capacity},${fillRate}%`;
    }).join('\n');

    res.writeHead(200, {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="sponsor_footfall_validation_report.csv"'
    });
    return res.end(csvHeader + csvRows);
  }

  // 8. POST /api/emergency - Broadcast Emergency SOS & Alert Contacts
  if (req.method === 'POST' && pathname === '/api/emergency') {
    try {
      const { attendeePassId, locationId, reporterType, reporterNote } = await parseJsonBody(req);
      
      const attendeeKey = Object.keys(state.attendees).find(
        k => k === attendeePassId || state.attendees[k].pass_id === attendeePassId
      ) || 'PQ-7F3K';
      const attendee = state.attendees[attendeeKey];

      let locationName = 'General Venue Area';
      if (locationId === 'main_gate') {
        locationName = state.main_gate.name;
      } else if (state.stalls[locationId]) {
        locationName = state.stalls[locationId].name;
      }

      const emergencyIncident = {
        id: 'emg_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        attendee_pass_id: attendee.pass_id,
        attendee_name: attendee.full_name,
        location_id: locationId || 'stall_4',
        location_name: locationName,
        reporter_type: reporterType || 'bystander',
        reporter_note: reporterNote || 'Emergency assistance requested via PingQ app scan',
        dispatched_at: new Date().toISOString(),
        status: 'ACTIVE_DISPATCH',
        paramedic_unit: 'Paramedic Unit #2 (Zone 2 Station)',
        gps_coords: '28.5492° N, 77.2023° E',
        sms_sent_to: attendee.medical_profile?.emergency_contact || null,
        sms_delivery_status: 'DELIVERED',
        medical_snapshot: attendee.medical_profile || null
      };

      state.emergency_incidents = state.emergency_incidents || [];
      state.emergency_incidents.unshift(emergencyIncident);
      state.active_emergency_count = (state.active_emergency_count || 0) + 1;

      saveState();

      broadcastSSE('emergency', {
        incident: emergencyIncident,
        active_emergency_count: state.active_emergency_count
      });

      return sendJson(res, 200, {
        success: true,
        incident: emergencyIncident,
        active_emergency_count: state.active_emergency_count
      });
    } catch (err) {
      return sendJson(res, 500, { error: 'Failed to process emergency alert', details: err.message });
    }
  }

  // 9. POST /api/emergency/resolve - Resolve active emergency incident
  if (req.method === 'POST' && pathname === '/api/emergency/resolve') {
    try {
      const { incidentId } = await parseJsonBody(req);
      state.emergency_incidents = state.emergency_incidents || [];
      const incident = state.emergency_incidents.find(i => i.id === incidentId);
      if (incident) {
        incident.status = 'RESOLVED';
        incident.resolved_at = new Date().toISOString();
      }
      state.active_emergency_count = Math.max(0, (state.active_emergency_count || 1) - 1);
      saveState();

      broadcastSSE('emergency_resolved', {
        incidentId,
        active_emergency_count: state.active_emergency_count
      });

      return sendJson(res, 200, { success: true, active_emergency_count: state.active_emergency_count });
    } catch (err) {
      return sendJson(res, 500, { error: 'Failed to resolve emergency', details: err.message });
    }
  }

  // 10. PUT /api/attendee/medical - Update attendee medical profile
  if (req.method === 'PUT' && pathname === '/api/attendee/medical') {
    try {
      const { passId, medicalProfile } = await parseJsonBody(req);
      const attendeeKey = Object.keys(state.attendees).find(
        k => k === passId || state.attendees[k].pass_id === passId
      );
      if (!attendeeKey) {
        return sendJson(res, 404, { error: 'Attendee not found' });
      }
      state.attendees[attendeeKey].medical_profile = {
        ...state.attendees[attendeeKey].medical_profile,
        ...medicalProfile
      };
      saveState();

      broadcastSSE('attendee_updated', { attendee: state.attendees[attendeeKey] });
      return sendJson(res, 200, { success: true, attendee: state.attendees[attendeeKey] });
    } catch (err) {
      return sendJson(res, 500, { error: 'Failed to update medical profile', details: err.message });
    }
  }

  // --- STATIC FILE SERVING ---
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();

  // Security check: ensure path is inside PUBLIC_DIR
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Access denied');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA-like experience
      filePath = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(filePath, (err2, content) => {
        if (err2) {
          res.writeHead(404);
          res.end('Not found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
          res.end(content);
        }
      });
      return;
    }

    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`PINGQ EVENT & QUEUE PLATFORM RUNNING`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Staff Portal & Consumer Portal ready`);
  console.log(`Supabase Realtime Compatible schema: supabase_schema.sql`);
  console.log(`=======================================================`);
});
