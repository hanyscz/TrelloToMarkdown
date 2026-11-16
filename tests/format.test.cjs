const test = require('node:test'), assert = require('node:assert/strict');
require('../chrome-extension/rich-checklist/format.js');
const F = globalThis.TrelloFormat;

test('bold/italic/strike wrap a selection and toggle it off again', () => {
  let r = F.bold('ahoj svete', 5, 10);
  assert.equal(r.value, 'ahoj **svete**');
  assert.equal(F.bold(r.value, r.start, r.end).value, 'ahoj svete');
  assert.equal(F.italic('x', 0, 1).value, '*x*');
  assert.equal(F.strike('x', 0, 1).value, '~~x~~');
  assert.equal(F.code('x', 0, 1).value, '`x`');
});

test('wrap without selection places the caret between the markers', () => {
  const r = F.bold('ab', 1, 1);
  assert.equal(r.value, 'a****b');
  assert.equal(r.start, 3);
});

test('italic does not strip one star from bold text', () => {
  const r = F.italic('**x**', 2, 3);
  assert.equal(r.value, '***x***');
});

test('link selects the url placeholder', () => {
  const r = F.link('see doc', 4, 7);
  assert.equal(r.value, 'see [doc](url)');
  assert.equal(r.value.slice(r.start, r.end), 'url');
});

test('paragraph inserts an empty line, never a single newline or hard break', () => {
  assert.equal(F.paragraph('ab', 1, 1).value, 'a\n\nb');
  const again = F.paragraph('a\n\nb', 3, 3);
  assert.equal(again.value, 'a\n\nb');
});

test('sanitize removes hard breaks that crash the Trello renderer', () => {
  assert.equal(F.sanitize('a  \nb'), 'a\nb');
  assert.equal(F.sanitize('a\\\nb'), 'a\nb');
  assert.equal(F.sanitize('a \n \nb'), 'a\n\nb');
  assert.equal(F.sanitize('a\r\nb'), 'a\nb');
  assert.equal(F.sanitize('a\n\nb'), 'a\n\nb');
  assert.equal(F.sanitize('a  b'), 'a  b');
});

test('HOTOVO goes to the start and a second click only replaces the date', () => {
  const first = F.setHotovo('text', 4, '1.1.');
  assert.equal(first.value, '`HOTOVO 1.1.` text');
  const second = F.setHotovo(first.value, first.start, '2.2.');
  assert.equal(second.value, '`HOTOVO 2.2.` text');
  assert.equal(F.hasHotovo(second.value), true);
  assert.equal(F.hasHotovo('text `HOTOVO 1.1.`'), false);
});

test('removeHotovo removes only the leading badge and leaves EDIT alone', () => {
  const r = F.removeHotovo('`HOTOVO 1.1.` a `EDIT 1.1.` b', 5);
  assert.equal(r.value, 'a `EDIT 1.1.` b');
  assert.equal(F.removeHotovo('a `HOTOVO 1.1.`', 0), null);
});

test('EDIT is inserted at the caret', () => {
  assert.equal(F.insertEdit('ab', 1, 1, '3.3.').value, 'a `EDIT 3.3.` b');
  assert.equal(F.insertEdit('ab', 0, 0, '3.3.').value, '`EDIT 3.3.` ab');
});

test('badgeKind recognises only HOTOVO and EDIT chips', () => {
  assert.equal(F.badgeKind('HOTOVO 1.1.'), 'hotovo');
  assert.equal(F.badgeKind('EDIT 1.1.'), 'edit');
  assert.equal(F.badgeKind('EDITOR'), null);
  assert.equal(F.badgeKind('kód'), null);
});

test('wrap keeps edge whitespace outside the markers (Trello will not render "**x **")', () => {
  assert.equal(F.bold('a Tučné b', 1, 8).value, 'a **Tučné** b');
  assert.equal(F.bold('a x', 1, 3).value, 'a **x**');
  assert.equal(F.bold('   ', 0, 3).value, '   ');
});
