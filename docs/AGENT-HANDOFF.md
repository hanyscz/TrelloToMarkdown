# Předání: rozšíření pro formátování checklistu v Trellu

**Stav (2026-11-16):** zjednodušeno na nativní Markdown. Žádné vlastní značky `[[…]]`, žádný transport `[[ttm:line:v1]]`, žádné nastavení odznaků.

## Jak to funguje
- `chrome-extension/rich-checklist/format.js` – čisté funkce nad textem (B/I/S/kód/odkaz, odstavec, HOTOVO na začátek, EDIT na kurzor, `sanitize`). Testy: `tests/format.test.cjs`.
- `content.js` – panel nástrojů nad nativním polem, `sanitize` před uložením, obarvení čipů `HOTOVO`/`EDIT`.
- `native-adapter.js` – selektory Trella a `setValue` (nativní setter + `input`/`change`).

## Ověřeno na živém Trellu (přes MCP, 2026-11-16)
- Server ukládá `\n` i `\n\n` v jedné položce.
- Vykreslení: inline kód = šedý čip, `**`/`*`/`~~` fungují, `\n` = mezera, `\n\n` = odstavec.
- **Tvrdý zlom (dvě mezery / `\` + nový řádek) shodí vykreslení karty** → `sanitize()`.
- Shift+Enter v nativním poli nic nedělá, odstavec se vkládá tlačítkem ¶.

## Neověřeno
- Chování tlačítek panelu v prohlížeči po stavbě (ruční QA: `rich-checklist-manual-qa.md`).
- Zda pole *Přidat položku* při uložení víceřádkového textu nerozdělí položku na více.
- Selektory DOM Trella jsou křehké (`native-adapter.js`).

## Pravidla
- Před živým zápisem do Trella vždy výslovné určení odhoditelné karty. Nikdy nežádat tajné údaje, žádné API klíče.
- Nepřidávat značky mimo ověřenou sadu (viz `trello-mcp-agent-manual.md`).
