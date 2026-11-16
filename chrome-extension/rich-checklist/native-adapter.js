(function (root) {
  'use strict';
  const selectors = { overlay: '#overlay-contents', section: '[data-testid="checklist-section"]', item: 'li[data-testid="check-item-container"][data-checklist-item-id]', name: '[data-testid="check-item-name"]', edit: '[data-testid="check-item-edit-container"] textarea[id^="edit-checkitem-"]', add: 'textarea[data-testid="check-item-name-input"][id^="add-checkitem-"]' };
  const connected = node => !!node && node.isConnected;
  function findEdit(li, id) { const textarea = li?.querySelector(selectors.edit); return textarea && textarea.id.endsWith(id) ? textarea : null; }
  function setValue(el, value) { Object.getOwnPropertyDescriptor(root.HTMLTextAreaElement.prototype, 'value').set.call(el, value); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }
  function valid(ctx) {
    if (location.pathname !== ctx.pathname || !connected(ctx.overlay) || document.querySelector(selectors.overlay) !== ctx.overlay || !ctx.overlay.contains(ctx.li) || !connected(ctx.textarea) || ctx.textarea.id !== ctx.textareaId || !ctx.form?.contains(ctx.textarea) || !ctx.form.isConnected) return 'Formulář už není v otevřené kartě. Koncept zůstává zachovaný.';
    if (ctx.kind === 'edit' && (ctx.li.getAttribute('data-checklist-item-id') !== ctx.itemId || !ctx.textarea.id.endsWith(ctx.itemId))) return 'Položka se změnila. Koncept zůstává zachovaný.';
    if (ctx.kind === 'add' && (!ctx.li.contains(ctx.textarea) || ctx.textarea.id !== `add-checkitem-${ctx.checklistId}`)) return 'Checklist se změnil. Koncept zůstává zachovaný.';
    return null;
  }
  async function submitNative(ctx, encoded) {
    let reason = valid(ctx); if (reason) return { ok:false, reason };
    if (ctx.textarea.value !== ctx.original) return { ok:false, reason:'Nativní text se mezitím změnil. Koncept zůstává zachovaný.' };
    const testid = ctx.kind === 'edit' ? 'check-item-edit-save-button' : 'check-item-add-button';
    let submit = ctx.form.querySelector(`button[type="submit"][data-testid="${testid}"]`);
    if (!submit) return { ok:false, reason:'Nativní tlačítko Uložit není dostupné. Koncept zůstává zachovaný.' };
    if (ctx.kind === 'edit' && submit.disabled) return { ok:false, reason:'Nativní tlačítko Uložit není dostupné. Koncept zůstává zachovaný.' };
    try { setValue(ctx.textarea, encoded); } catch { return { ok:false, reason:'Nativní pole odmítlo změnu. Koncept zůstává zachovaný.' }; }
    const until = Date.now() + 1200;
    await new Promise(r=>setTimeout(r,50));
    while (Date.now() < until) { submit = ctx.form.querySelector(`button[type="submit"][data-testid="${testid}"]`); if (submit && !submit.disabled) break; await new Promise(r=>setTimeout(r,20)); }
    reason = valid(ctx); submit = ctx.form.querySelector(`button[type="submit"][data-testid="${testid}"]`);
    if (reason || ctx.textarea.value !== encoded || !submit || submit.disabled) return { ok:false, reason:reason || 'Trellu se nepodařilo připravit uložení. Koncept zůstává zachovaný.' };
    try { submit.click(); return { ok:true }; } catch { return { ok:false, reason:'Nativní uložení selhalo. Koncept zůstává zachovaný.' }; }
  }
  root.TrelloNativeAdapter = { selectors, connected, findEdit, setValue, valid, submitNative };
})(globalThis);
