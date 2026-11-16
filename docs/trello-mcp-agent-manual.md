# Manuál pro agenta: psaní do checklistu Trella (přes MCP)

Položky checklistu se píšou jako **běžný Markdown, který Trello samo vykreslí**. Žádná vlastní obálka ani kódování.

## Povolené značky (ověřeno na živém Trellu)

| Co | Zápis |
|---|---|
| tučně | `**text**` |
| kurzíva | `*text*` |
| přeškrtnuto | `~~text~~` |
| kód | `` `text` `` |
| odkaz | `[text](url)` |
| nový odstavec | prázdný řádek (`\n\n`) |
| odznak HOTOVO | `` `HOTOVO 16.11.` `` na úplném začátku textu |
| odznak EDIT | `` `EDIT 16.11.` `` kdekoli v textu |

Datum je `d.m.` (bez nul). Odznaky `HOTOVO`/`EDIT` rozšíření v prohlížeči obarví; bez něj jsou to šedé čipy.

## Čeho se vyvarovat

- **Jeden `\n` je pro Trello mezera**, ne zalomení. Odstavec dělá jen `\n\n`.
- **Nikdy nepiš tvrdý zlom**: dvě mezery na konci řádku ani `\` před novým řádkem. Trello při vykreslení hlásí `Token type hardbreak not supported by Markdown parser` a **celá karta přestane fungovat** pro všechny, kdo ji otevřou. Odstraň `[ \t]+\n` → `\n` a `\\n` → `\n`.
- Držte se značek z tabulky výše. Jiná syntaxe (nadpisy, seznamy, citace, HTML) není ověřená; nejdřív ji zkus na jedné položce na odhoditelné kartě.
- Maximální délka položky je 16 384 znaků.

## Postup

1. Přečti checklist (`trelloReadChecklist`) a drž se stávajícího textu.
2. Změň jen potřebnou část; `HOTOVO` přidávej na začátek, nebo jen přepiš datum.
3. Zapiš přes `trelloWriteChecklist` (`add_item` / `update_item`) a přečti zpět.
