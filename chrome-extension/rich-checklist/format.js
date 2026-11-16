(function (root) {
  'use strict';
  /*
   * Čisté funkce nad textem položky checklistu. Žádný DOM.
   * Používají jen značky, které Trello v checklistu vykreslí samo:
   * **tučně**, *kurzíva*, ~~přeškrtnuto~~, `kód`, [text](url) a prázdný řádek (odstavec).
   * POZOR: tvrdý zlom (dva mezery / zpětné lomítko před novým řádkem) shodí vykreslení karty
   * ("Token type `hardbreak` not supported"), proto ho sanitize() vždy odstraní.
   */

  const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);
  const result = (value, start, end) => ({ value, start, end: end === undefined ? start : end });
  const norm = (value, start, end) => {
    const s = clamp(Number.isInteger(start) ? start : value.length, 0, value.length);
    const e = clamp(Number.isInteger(end) ? end : s, 0, value.length);
    return [Math.min(s, e), Math.max(s, e)];
  };

  function dateLabel(now) {
    const d = now || new Date();
    return `${d.getDate()}.${d.getMonth() + 1}.`;
  }

  /* Odstraní konce řádků, které Trello neumí vykreslit (tvrdý zlom). */
  function sanitize(value) {
    return String(value).replace(/\r\n?/g, '\n').replace(/[ \t]+(?=\n)/g, '').replace(/\\(?=\n)/g, '');
  }

  function isWrapped(value, start, end, open, close) {
    if (start < open.length || value.slice(start - open.length, start) !== open || value.slice(end, end + close.length) !== close) return false;
    // kurzíva `*x*` se nesmí splést s tučným `**x**`
    if (open === '*' && (value[start - 2] === '*' || value[end + 1] === '*')) return false;
    return true;
  }

  /* Obalí výběr značkou, opakované použití značku odebere. */
  function wrap(value, start, end, open, close) {
    close = close === undefined ? open : close;
    [start, end] = norm(value, start, end);
    const selected = value.slice(start, end);
    if (!selected) {
      const caret = start + open.length;
      return result(value.slice(0, start) + open + close + value.slice(end), caret);
    }
    if (selected.length >= open.length + close.length && selected.startsWith(open) && selected.endsWith(close)
        && !(open === '*' && (selected.startsWith('**') && selected.endsWith('**')))) {
      const inner = selected.slice(open.length, selected.length - close.length);
      return result(value.slice(0, start) + inner + value.slice(end), start, start + inner.length);
    }
    if (isWrapped(value, start, end, open, close)) {
      const from = start - open.length;
      return result(value.slice(0, from) + selected + value.slice(end + close.length), from, from + selected.length);
    }
    // Markdown neuzavře značku za mezerou ("**text **" se nevykreslí) – mezery na krajích výběru zůstanou venku
    const lead = /^\s*/.exec(selected)[0].length, trail = selected.length - lead ? /\s*$/.exec(selected)[0].length : 0;
    if (lead + trail >= selected.length) return result(value, start, end);
    const from = start + lead, to = end - trail;
    return result(value.slice(0, from) + open + value.slice(from, to) + close + value.slice(to), from + open.length, to + open.length);
  }

  const bold = (v, s, e) => wrap(v, s, e, '**');
  const italic = (v, s, e) => wrap(v, s, e, '*');
  const strike = (v, s, e) => wrap(v, s, e, '~~');
  const code = (v, s, e) => wrap(v, s, e, '`');

  /* [text](url) – vybere "url", aby ji šlo rovnou přepsat. */
  function link(value, start, end) {
    [start, end] = norm(value, start, end);
    const text = value.slice(start, end) || 'text';
    const urlAt = start + text.length + 3;
    return result(value.slice(0, start) + `[${text}](url)` + value.slice(end), urlAt, urlAt + 3);
  }

  /* Odstavec = prázdný řádek. Jediný nový řádek Trello zobrazí jako mezeru. */
  function paragraph(value, start, end) {
    [start, end] = norm(value, start, end);
    const before = value.slice(0, start);
    if (before.endsWith('\n\n') && start === end) return result(value, start);
    const next = before + '\n\n' + value.slice(end);
    return result(next, start + 2);
  }

  /* ---------- odznaky: inline kód `HOTOVO 16.11.` / `EDIT 16.11.` ---------- */

  const HOTOVO = /^(\s*)`HOTOVO(?: [^`\n]*)?` ?/;

  const hasHotovo = value => HOTOVO.test(value);

  /* HOTOVO vždy na začátek textu; když tam už je, jen se přepíše datum. */
  function setHotovo(value, caret, date) {
    const tag = '`HOTOVO ' + (date || dateLabel()) + '` ';
    const m = HOTOVO.exec(value);
    const next = m ? m[1] + tag + value.slice(m[0].length) : tag + value;
    const tagEnd = (m ? m[1].length : 0) + tag.length;
    const c = Number.isInteger(caret) ? caret : next.length;
    return result(next, Math.min(next.length, Math.max(tagEnd, c + (next.length - value.length))));
  }

  /* Odebere HOTOVO ze začátku; jinak vrací null (nic se nemění). */
  function removeHotovo(value, caret) {
    const m = HOTOVO.exec(value);
    if (!m) return null;
    const next = m[1] + value.slice(m[0].length);
    const c = Number.isInteger(caret) ? caret : next.length;
    return result(next, clamp(c - (m[0].length - m[1].length), 0, next.length));
  }

  /* EDIT na kurzor (nahrazuje výběr nechat nedotčený – vkládá se před něj). */
  function insertEdit(value, start, end, date) {
    [start, end] = norm(value, start, end);
    const tag = '`EDIT ' + (date || dateLabel()) + '` ';
    const lead = start > 0 && !/\s$/.test(value.slice(0, start)) ? ' ' : '';
    const ins = lead + tag;
    return result(value.slice(0, start) + ins + value.slice(start), start + ins.length);
  }

  /* Typ odznaku podle textu inline kódu (pro obarvení v seznamu). */
  function badgeKind(text) {
    const t = String(text).trim();
    if (/^HOTOVO(?: |$)/.test(t)) return 'hotovo';
    if (/^EDIT(?: |$)/.test(t)) return 'edit';
    return null;
  }

  root.TrelloFormat = { dateLabel, sanitize, wrap, bold, italic, strike, code, link, paragraph, hasHotovo, setHotovo, removeHotovo, insertEdit, badgeKind };
})(globalThis);
