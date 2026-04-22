// data/projects.js
export const PROJECTS = [
  { slug: 'banana',              name: 'Banana / Peel 1',     desc: 'iOS app, launching soon.',            tags: ['software'],           status: 'progress', progress: 40 },
  { slug: 'bob',                 name: 'BOB',                  desc: 'Discord bot with personality.',       tags: ['software', 'ai'],     status: 'complete' },
  { slug: 'skystream',           name: 'Skystream',            desc: 'Weather API + visualizer.',           tags: ['software'],           status: 'complete' },
  { slug: 'ares-ii',             name: 'ARES II',              desc: 'Robotic arm — precision tool.',       tags: ['hardware'],           status: 'progress', progress: 65 },
  { slug: 'house-point-counter', name: 'House Point Counter',  desc: 'Hardware + dashboard.',               tags: ['hardware'],           status: 'complete' },
  // Additional projects below use the existing project page stubs. Nash can fill in real data later.
  { slug: 'project1', name: 'Project 1', desc: 'TBD.', tags: ['hardware'], status: 'progress', progress: 20 },
  { slug: 'project2', name: 'Project 2', desc: 'TBD.', tags: ['software'], status: 'progress', progress: 50 },
  { slug: 'project3', name: 'Project 3', desc: 'TBD.', tags: ['ai'],       status: 'progress', progress: 30 },
  { slug: 'project4', name: 'Project 4', desc: 'TBD.', tags: ['hardware'], status: 'complete' },
  { slug: 'project5', name: 'Project 5', desc: 'TBD.', tags: ['software'], status: 'complete' },
];

export const CATEGORY_MATCHES = {
  all:      () => true,
  hardware: p => p.tags.includes('hardware'),
  software: p => p.tags.includes('software'),
  ai:       p => p.tags.includes('ai'),
  progress: p => p.status === 'progress',
  complete: p => p.status === 'complete',
};
