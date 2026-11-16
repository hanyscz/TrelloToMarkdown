(function () {
  'use strict';

  const A = TrelloNativeAdapter, F = TrelloFormat;
  const NATIVE = 'textarea[id^="edit-checkitem-"], textarea[id^="add-checkitem-"]';

  /* ---------------- práce s nativním polem ---------------- */

  function selection(textarea) {
    const length = textarea.value.length;
    const start = Number.isInteger(textarea.selectionStart) ? textarea.selectionStart : length;
    const end = Number.isInteger(textarea.selectionEnd) ? textarea.selectionEnd : length;
    return { start: Math.min(start, end), end: Math.max(start, end) };
  }

  function apply(textarea, out) {
    if (!out) return false;
    A.setValue(textarea, out.value);
    try { textarea.setSelectionRange(out.start, out.end); } catch (error) { /* pole nemusí být v dokumentu */ }
    return true;
  }

  /* Trello neumí vykreslit tvrdý zlom a celá karta pak spadne – před uložením ho vždy odstraníme. */
  function sanitizeField(textarea) {
    if (!textarea || textarea.dataset.ttmBar !== '1') return;
    const clean = F.sanitize(textarea.value);
    if (clean !== textarea.value) A.setValue(textarea, clean);
  }

  /* ---------------- panel nástrojů ---------------- */

  function separator() {
    const node = document.createElement('span');
    node.className = 'ttm-sep';
    node.setAttribute('aria-hidden', 'true');
    return node;
  }

  function toolbar(textarea) {
    const bar = document.createElement('div');
    bar.className = 'ttm-toolbar';
    bar.setAttribute('role', 'toolbar');
    bar.setAttribute('aria-label', 'Formátování položky');
    bar.addEventListener('mousedown', event => { if (event.target instanceof Element && event.target.closest('button')) event.preventDefault(); });

    const button = (id, label, title, onClick, parent) => {
      const node = document.createElement('button');
      node.type = 'button';
      node.className = 'ttm-btn';
      node.dataset.ttm = id;
      node.title = title;
      node.setAttribute('aria-label', title);
      node.textContent = label;
      node.addEventListener('click', onClick);
      (parent || bar).appendChild(node);
      return node;
    };

    const notice = message => {
      bar.querySelectorAll('.ttm-notice').forEach(node => node.remove());
      const node = document.createElement('span');
      node.className = 'ttm-notice';
      node.setAttribute('role', 'status');
      node.textContent = message;
      bar.appendChild(node);
      setTimeout(() => node.remove(), 2500);
    };

    const run = fn => () => { const { start, end } = selection(textarea); apply(textarea, fn(textarea.value, start, end)); textarea.focus(); };

    const quick = document.createElement('div');
    quick.className = 'ttm-quick';
    bar.appendChild(quick);
    button('hotovo', '✓ HOTOVO', 'Přidat odznak HOTOVO s dnešním datem na začátek textu', run((v, s) => F.setHotovo(v, s)), quick);
    button('remove', '✕', 'Odebrat odznak HOTOVO ze začátku textu', () => {
      const { start } = selection(textarea);
      if (!apply(textarea, F.removeHotovo(textarea.value, start))) notice('Text nezačíná odznakem HOTOVO.');
      textarea.focus();
    }, quick);
    button('edit', 'EDIT', 'Vložit odznak EDIT s dnešním datem na kurzor', run((v, s, e) => F.insertEdit(v, s, e)), quick);

    button('b', 'B', 'Tučně', run(F.bold));
    button('i', 'I', 'Kurzíva', run(F.italic));
    button('s', 'S', 'Přeškrtnout', run(F.strike));
    button('code', '</>', 'Kód', run(F.code));
    button('link', '🔗', 'Odkaz', run(F.link));
    bar.appendChild(separator());
    button('paragraph', '¶', 'Nový odstavec (prázdný řádek)', run(F.paragraph));
    return bar;
  }

  function decorate(textarea) {
    if (!(textarea instanceof HTMLTextAreaElement) || textarea.dataset.ttmBar === '1') return;
    const parent = textarea.parentElement;
    if (!parent) return;
    textarea.dataset.ttmBar = '1';
    parent.querySelectorAll('.ttm-toolbar').forEach(node => node.remove());
    textarea.insertAdjacentElement('beforebegin', toolbar(textarea));
  }

  /* ---------------- uložení: odstranit tvrdé zlomy ---------------- */

  let lastTextarea = null;

  function track(event) {
    const target = event.target;
    if (target instanceof HTMLTextAreaElement && target.dataset.ttmBar === '1') lastTextarea = target;
  }
  document.addEventListener('focusin', track, true);
  document.addEventListener('input', track, true);

  function saveTarget(node) {
    if (node instanceof Element) {
      const form = node.closest('form');
      const within = form && form.querySelector('textarea[data-ttm-bar="1"]');
      if (within) return within;
    }
    return lastTextarea && lastTextarea.isConnected ? lastTextarea : null;
  }

  document.addEventListener('click', event => {
    const button = event.target instanceof Element ? event.target.closest('button') : null;
    if (button && button.type === 'submit') sanitizeField(saveTarget(button));
  }, true);

  document.addEventListener('submit', event => {
    if (event.target instanceof HTMLFormElement) sanitizeField(saveTarget(event.target));
  }, true);

  document.addEventListener('keydown', event => {
    if (event.key !== 'Enter' || event.isComposing) return;
    if (event.target instanceof HTMLTextAreaElement) sanitizeField(event.target);
  }, true);

  /* ---------------- obarvení odznaků v seznamu ---------------- */

  function paintBadges(li) {
    const name = li.querySelector(A.selectors.name);
    if (!name) return;
    name.querySelectorAll('code').forEach(node => {
      const kind = F.badgeKind(node.textContent);
      if (kind) { if (node.dataset.ttmBadge !== kind) node.dataset.ttmBadge = kind; }
      else if (node.dataset.ttmBadge) delete node.dataset.ttmBadge;
    });
  }

  /* ---------------- skenování karty ---------------- */

  function cleanup() {
    document.querySelectorAll('.ttm-toolbar').forEach(node => node.remove());
    lastTextarea = null;
  }

  let queued = false;

  function laterScan() {
    if (queued) return;
    queued = true;
    queueMicrotask(() => { queued = false; scan(); });
  }

  function scan() {
    const overlay = document.querySelector(A.selectors.overlay);
    if (!overlay) { cleanup(); return; }
    overlay.querySelectorAll(NATIVE).forEach(decorate);
    overlay.querySelectorAll(A.selectors.item).forEach(paintBadges);
  }

  new MutationObserver(laterScan).observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['data-testid'] });
  scan();
})();
