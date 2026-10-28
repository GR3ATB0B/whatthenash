// tests/terminal.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createShell } from '../js/terminal/commands.js';
import { grade, bar, SWEET } from '../js/terminal/nashpresso.js';

const projects = [
  { slug: 'bob', name: 'BOB', desc: 'agent', status: 'progress', progress: 80 },
  { slug: 'skystream', name: 'Skystream', desc: 'water', status: 'complete' },
];
const sh = () => createShell({ projects, email: 'me@example.com' });

test('help lists the basics and hints there is more', () => {
  const out = sh().run('help').out.join('\n');
  for (const c of ['whois', 'projects', 'ls', 'cat', 'stack', 'keys', 'contact', 'clear', 'exit']) assert.ok(out.includes(c), c);
  assert.ok(!out.includes('nashpresso'), 'hidden stays hidden');
  assert.match(out, /not all/);
});

test('unknown commands say so', () => {
  assert.match(sh().run('frobnicate').out[0], /command not found/);
});

test('discovery counter counts each command once', () => {
  const s = sh();
  s.run('help'); s.run('help'); s.run('whois');
  assert.equal(s.discovered.size, 2);
  assert.equal(s.run('stack').found, 'stack');
  assert.equal(s.run('stack').found, null);
});

test('words in output unlock hidden commands', () => {
  const s = sh();
  const whois = s.run('whois').out.join(' ');
  for (const w of ['auburn', 'esp32', 'spanish', 'grandpa', 'toes', 'coffee', 'chick-fil-a']) {
    assert.ok(whois.includes(w), `${w} appears in whois`);
    assert.doesNotMatch(s.run(w).out[0], /not found/);
  }
  assert.ok(s.run('keys').out.join(' ').includes('clack'));
  assert.doesNotMatch(s.run('clack').out[0], /not found/);
});

test('ls -a reveals the hidden file, cat reads it and counts it', () => {
  const s = sh();
  assert.ok(!s.run('ls').out.join(' ').includes('.espresso'));
  assert.ok(s.run('ls -a').out.join(' ').includes('.espresso'));
  assert.match(s.run('cat .espresso').out.join(' '), /nashpresso/);
  assert.ok(s.discovered.has('.espresso'));
});

test('cat reads projects, with or without .txt', () => {
  const s = sh();
  assert.match(s.run('cat bob').out[0], /BOB/);
  assert.match(s.run('cat skystream.txt').out[2], /done/);
  assert.match(s.run('cat nope').out[0], /no such file/);
});

test('effects: clear, exit, contact, game', () => {
  const s = sh();
  assert.equal(s.run('clear').effect, 'clear');
  assert.equal(s.run('exit').effect, 'exit');
  assert.equal(s.run('quit').effect, 'exit');
  assert.equal(s.run('page').effect, 'contact');
  assert.equal(s.run('nashpresso').effect, 'nashpresso');
});

test('case and spacing do not matter', () => {
  assert.match(sh().run('   WHOIS  ').out[0], /nash/);
});

test('restore ignores junk from storage', () => {
  const s = sh();
  s.restore(['whois', 'not-a-command', '.espresso']);
  assert.deepEqual([...s.discovered].sort(), ['.espresso', 'whois']);
});

test('total counts every findable command', () => {
  const s = sh();
  const all = ['help', 'whois', 'projects', 'ls', 'cat bob', 'stack', 'keys', 'contact', 'clear', 'exit', 'page', 'bob', 'nashpresso',
    'coffee', 'auburn', 'esp32', 'grandpa', 'spanish', 'chick-fil-a', 'clack', 'toes', 'sudo', 'banana', 'cat .espresso'];
  all.forEach(c => s.run(c));
  assert.equal(s.discovered.size, s.total);
});

test('nashpresso grading', () => {
  assert.equal(grade(27).label, 'dialed in');
  assert.equal(grade(SWEET[0]).stars, 3);
  assert.equal(grade(SWEET[1]).stars, 3);
  assert.equal(grade(18).label, 'sour');
  assert.equal(grade(50).label, 'burnt');
  assert.equal(grade(5).label, 'gusher');
});

test('nashpresso bar fills with time and marks the sweet spot', () => {
  assert.match(bar(0), /^\[░+·+░+\]/);
  assert.equal((bar(45).match(/▓/g) || []).length, 30);
});
