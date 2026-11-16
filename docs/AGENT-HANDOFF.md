# Předání: formátovaný checklist v Trellu

**Datum:** 2026-10-20  
**Určeno:** novému agentovi bez historie této konverzace

## Cíl a hranice

- [ ] Dovést editor checklistu s bohatým formátováním uvnitř **téže položky Trella**. Odstavce, prázdné řádky, styly textu a barvy musí zůstat součástí popisu položky; odznak musí obarvit také následující text.
- [ ] Uživatelský zákaz je jednoznačný: editor nesmí mít backend ani používat API klíče, tokeny či přímé API Trella. Ukládání vede přes běžné rozhraní stránky a nativní formulář Trella.
- [ ] Současný stav je místní DOM prototyp s textovým polem pro značky, panelem nástrojů a živým náhledem. **Není to WYSIWYG editor**; živé uložení na serveru Trella ani připravenost k publikaci v Chrome Web Store nejsou ověřené.
- [ ] Původní exportér zůstává samostatnou funkcí. Nezaměňovat jeho práci s editorem nativního formuláře.

## Způsob práce

1. Koordinátor řeší architekturu a kontrolu. Veškeré zápisy kódu zadávejte přes **Orca Codex gpt-6-luna, effort medium**, v aktuálním worktree.
2. Ověřte skutečný doklad spuštění: launch receipt musí potvrdit požadovaný model, effort i worktree. Nestačí text příkazu ani plán.
3. Počkejte na skutečné `worker_done` od implementačního workera. Teprve potom prohlédněte diff, spusťte ověření a opravte zjištěné problémy.
4. Zachovejte všechny existující změny. Bez výslovného oprávnění nepoužívejte náhradní model/worker a nedělejte commit.
5. Než založíte další práci, prohlédněte `git status --short`; nerozporcovávejte ani nevracejte uživatelské změny.

## Mapa implementace

| Soubor | Odpovědnost |
|---|---|
| [`chrome-extension/rich-checklist/content.js`](../chrome-extension/rich-checklist/content.js) | Dialog v DOM Trella; montáž pod overlay a obnova po jeho změně/odpojení. |
| [`chrome-extension/rich-checklist/native-adapter.js`](../chrome-extension/rich-checklist/native-adapter.js) | Jediné nativní předání: canonical textarea, setter její vlastnosti, `input`/`change`, nativní Save/Add právě jednou; kontroly zastaralé cesty, formuláře, položky a původní hodnoty. |
| [`chrome-extension/rich-checklist/native-storage.js`](../chrome-extension/rich-checklist/native-storage.js) | Jednořádkový transport s prefixem `[[ttm:line:v1]]` a escapováním. |
| [`chrome-extension/rich-checklist/codec.js`](../chrome-extension/rich-checklist/codec.js) | Verze 1 značek; bezpečný round-trip obsahu. |
| [`chrome-extension/rich-checklist/renderer.js`](../chrome-extension/rich-checklist/renderer.js) | Bezpečný náhled přes `textContent`. |
| [`chrome-extension/rich-checklist/badge-config.js`](../chrome-extension/rich-checklist/badge-config.js) | Barvy odznaků v místním úložišti; obnovení při otevření editoru. |
| [`chrome-extension/rich-checklist/service-worker.js`](../chrome-extension/rich-checklist/service-worker.js) | Ochrana odesílatele při práci s nastavením. |
| [`chrome-extension/rich-checklist/lab.html`](../chrome-extension/rich-checklist/lab.html), `lab.js`, `lab.css` | Samostatná laboratoř nastavení a náhledů. |
| [`chrome-extension/manifest.json`](../chrome-extension/manifest.json) | Host přístup je zúžen na `trello.com`. |
| [`chrome-extension/popup.js`](../chrome-extension/popup.js), `app.js` | Dekódování `checkboxMarkdown`; HTML načítá skript. Popup/export a původní exportér jsou samostatné od nativního editoru. |
| [`docs/rich-checklist-manual-qa.md`](rich-checklist-manual-qa.md) | Dosavadní ruční postup pro Trello a omezení potvrzení uložení. |

## Dosavadní ověření (historické výsledky)

Následující výsledky jsou převzaté z kontroly koordinátora; tento dokument je znovu nespouštěl.

- `npm test`: **22/22** testů.
- Místní fixture přes HTTP: **73/73** kontrol; zahrnovaly skutečné LF a prázdné řádky, přesné opětovné otevření, jedno nativní Add, nulové uložení při uložení beze změny nebo zrušení, zachování checkboxu, výměnu a přeuspořádání DOM, znovupoužití ID, konflikty změněné hodnoty/cesty, obnovu draftu po odpojení overlay, kopírování po předání a obnovení konfigurace odznaků.
- `git diff --check` prošel. Historické snímky a JSON důkazy jsou v [`tests/fixtures/trello-fixture-pass.png`](../tests/fixtures/trello-fixture-pass.png), [`tests/fixtures/trello-card-evidence.png`](../tests/fixtures/trello-card-evidence.png) a [`tests/fixtures/trello-card-evidence.json`](../tests/fixtures/trello-card-evidence.json).
- Fixture Chrome a jeho mocky **nedokazují** fungování skutečných React controlled inputs ani uložení na serveru Trella. Žádný živý zápis do Trella neproběhl.

## Reprodukce místního ověření

Z kořene repozitáře spusťte `npm test`. Fixture otevřete serverem `python -m http.server 8783 --bind 127.0.0.1` a přejděte na <http://127.0.0.1:8783/tests/fixtures/trello-card.html>; tlačítko kontroly spusťte jednou po každém načtení stránky. Historický lokální server na portu 8783 je zastaven.

Ruční průchod rozšířením: otevřete `chrome://extensions`, rozšíření načtěte znovu a obnovte kartu Trella. V položce zvolte **Upravit formátovaně**; u nové položky použijte nativní **Přidat položku** a **Formátovaná položka**. Prověřte také nastavení barev odznaků. Automatizační prohlížeč odmítá `chrome://extensions` a povoluje pouze HTTP/HTTPS; znovunačtení proto proveďte ručně, tento limit neobcházejte.

## Omezení a otevřené riziko

- Text „**Předáno Trellu**“ potvrzuje pouze aktivaci nativního uložení, nikoli odpověď serveru. Formulace nesmí slibovat trvalé uložení.
- Nejvyšší priorita je živý round-trip na odhoditelné položce: uložit, počkat, obnovit stránku, znovu otevřít a opakovat; ověřit přesný obsah, prázdné řádky, barvy a to, že nevznikla další položka. Zkontrolovat také normalizaci značek a délková omezení.
- Zatím není schválen konkrétní živý testovací cíl. Před jakýmkoli živým zápisem do Trella si vyžádejte výslovné určení/oprávnění pro odhoditelnou položku. Nikdy nežádejte tajné údaje.
- Obnova rozpracovaného draftu existuje jen v paměti aktuální stránky; úplné obnovení stránky zahodí **neuložené** změny. Bez rozšíření se může zobrazit escapovaný zdrojový text značek, který se hůře čte.
- DOM selektory jsou křehké. Při selhání nejdřív prozkoumejte DOM a události; nepřidávejte kvůli tomu API přístup.

## První kroky navazujícího agenta

- [ ] Zkontrolujte `git status --short` a zachovejte všechny již existující změny.
- [ ] Projděte `content.js`, `native-adapter.js`, `native-storage.js` a [`rich-checklist-manual-qa.md`](rich-checklist-manual-qa.md); prohlédněte také relevantní netrackované soubory.
- [ ] Spusťte `npm test` a oddělte aktuální výsledek od historických výsledků uvedených výše.
- [ ] Dohodněte s koordinátorem konkrétní odhoditelný cíl. Po výslovném oprávnění proveďte živé ověření podle prioritního round-tripu.
- [ ] Vyhněte se nesouvisejícímu redesignu; nejdřív vyřešte skutečné chyby v předání nativnímu formuláři a přesnosti obsahu.

**Stav Gitu při sepsání:** upravené `README.md`, `app.js`, `chrome-extension/manifest.json`, `chrome-extension/popup.html`, `chrome-extension/popup.js`, `index.html`; netrackované `chrome-extension/rich-checklist/`, `docs/`, `tests/`, `package.json`. Tyto změny nejsou součástí tohoto nového dokumentu. Soubor `trello.json` nebyl otevřen.

**Poslední dokončené předání:** dispatch `ctx_490f35bf5491`, run `run_cfd2ef1e4f05`, gpt-6-luna medium; worker uvolněn (`retained/user_takeover`). Implementační worker nyní neběží; žádné commity nejsou vytvořené.



