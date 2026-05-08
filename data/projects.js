// data/projects.js
export const PROJECTS = [
  { slug: 'banana',              name: 'Banana / Peel 1',     desc: 'My company. Peel 1 is the Android launcher for Click Communicator — AAC made simple.',  tags: ['software', 'accessibility'], status: 'progress', progress: 40 },
  { slug: 'bob',                 name: 'BOB',                 desc: 'My personal AI agent on Claude. Multi-agent system that runs my digital life.',         tags: ['software', 'ai'],            status: 'progress', progress: 80 },
  { slug: 'claude-approver',     name: 'Claude Approver',     desc: 'ESP32 BLE device that plays a jingle and lights up when Claude finishes a task.',       tags: ['hardware', 'ai'],            status: 'progress', progress: 70 },
  { slug: 'skystream',           name: 'Skystream',           desc: 'Water-harvesting system. Pulls drinking water out of the air using MOF303.',            tags: ['hardware'],                  status: 'complete' },
  { slug: 'ares-ii',             name: 'ARES II',             desc: 'Ionic-thruster airplane. Thousands of volts, zero moving parts. Built at Georgia GHP.', tags: ['hardware'],                  status: 'complete' },
  { slug: 'house-point-counter', name: 'House Point Counter', desc: 'Hardware + dashboard for tracking school house points in real time.',                  tags: ['hardware', 'software'],      status: 'complete' },
];

export const CATEGORY_MATCHES = {
  all:      () => true,
  hardware: p => p.tags.includes('hardware'),
  software: p => p.tags.includes('software'),
  ai:       p => p.tags.includes('ai'),
  progress: p => p.status === 'progress',
  complete: p => p.status === 'complete',
};
