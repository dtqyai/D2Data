import test from 'node:test';
import assert from 'node:assert/strict';
import {getNext,fmtCountdown} from '../web/boss-timer.mjs';

test('boss schedule returns the first boundary strictly after now', () => {
  const base = 1_000_000;
  const interval = 600_000; // 10 min
  // Mid-cycle: the next boundary is one full interval out.
  assert.equal(getNext(base + 250_000, base, interval), base + interval);
  // Exactly on a boundary: the due spawn is consumed, show the following one.
  assert.equal(getNext(base + interval, base, interval), base + 2 * interval);
  // Long elapsed spans land on the first future boundary.
  assert.equal(getNext(base + 10.3 * interval, base, interval), base + 11 * interval);
  // A base time still in the future is returned as-is.
  assert.equal(getNext(base - 5_000, base, interval), base);
});

test('boss countdown formats with and without the hours column', () => {
  assert.equal(fmtCountdown(3661, true), '01:01:01');
  assert.equal(fmtCountdown(3600, true), '01:00:00');
  assert.equal(fmtCountdown(45 * 60 + 7, false), '45:07');
  assert.equal(fmtCountdown(0, false), '00:00');
});

