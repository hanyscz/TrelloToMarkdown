# Manuál pro agenta: formátovaný checklist v Trellu (přes MCP)

**Pro koho:** agent, který zapisuje do Trella přes MCP (`trello` tools) a chce, aby položky checklistu vypadaly v prohlížeči formátovaně (odznaky, barvy, tučné písmo, odstavce).
**Co potřebuješ:** žádná API klíče nad rámec MCP, žádné volání rozšíření. Formát je čistě textový a žije v **názvu položky checklistu**.

---

## 1. Kde formát žije

| Místo | Formát |
|---|---|
| **Název položky checklistu** (checklist item `name`) | zakódovaný **jednořádkový** transport (viz níže) |
| Popis karty, komentáře | nic speciálního – obyčejný Markdown, tenhle manuál se jich netýká |

Trello u položky checklistu povoluje jen **jeden fyzický řádek**. Proto se odstavce, prázdné řádky a značky balí do transportní obálky: celý obsah (včetně `\n`) se escapuje na jeden řádek začínající `[[ttm:line:v1]]`.

**Dvě vrstvy:**

```
Trello name:  [[ttm:line:v1]][[ttm\u003av1]]\n[[badge=HOTOVO 20\u002e10\u002e;#16a34a]] Text
              └───────────┘└─────────────────────────────────────────────────────────────┘
                 prefix                        zakódovaný source

source:       [[ttm:v1]]\n[[badge=HOTOVO 20.10.;#16a34a]] Text
              └────────┘└──────────────────────────────────────┘
                hlavička                    tělo se značkami
```

Nikdy nepiš do Trella „source" přímo – Trello by ho zobrazil jako rozsypaný text. Vždycky ven posílej **jednořádkový transport**.

---

## 2. Značky (tělo source)

| Značka | Význam | Poznámka |
|---|---|---|
| `[[b]]text[[/b]]` | tučně | |
| `[[i]]text[[/i]]` | kurzíva | |
| `[[s]]text[[/s]]` | přeškrtnuté | |
| `[[color=#rrggbb]]text[[/color]]` | barva textu | barva jen 6místný hex |
| `[[badge=NÁZEV;#rrggbb]]` | odznak (barevná pilulka) | **stavový**: obarví i všechen následující text až do dalšího odznaku nebo `[[section]]` |
| `[[section]]` | vodorovný oddělovač + reset odznaku | `section` zruší „obarvení" odznakem |

Pravidla:

1. `b`, `i`, `s` se musí zavírat ve správném pořadí (jako HTML): `[[b]][[i]]x[[/i]][[/b]]`.
2. `[[color=…]]` se **nevnořuje** – uvnitř jiné barvy je to chyba formátu.
3. Odznak je **stavový** – `[[badge=PROBLÉM;#dc2626]] text` znamená červený odznak *a* červený zbytek textu. Když barvu dál nechceš, ukonči ji `[[section]]` nebo dalším odznakem.
4. Název odznaku: max **32 znaků**, bez `[`, `]`, `;`, `\` a bez nových řádků. Diakritika a mezery jsou v pořádku.
5. Cokoli jiného v `[[…]]` = **poškozený formát** a celá položka se přestane vykreslovat (ukáže se surový text). Když potřebuješ v textu napsat doslovné `[[`, escapuj ho: `\[[`.

### Úmluva odznaků (dodržuj, kvůli UI rozšíření)

| Odznak | Barva | Význam |
|---|---|---|
| `HOTOVO d.m.` | `#16a34a` | hotovo – **jen jednou, vždy jako první odznak v hlavičce** |
| `EDIT d.m.` | `#f97316` | probíhá úprava |
| `R.EDIT d.m.` | `#16a34a` | opakovaná úprava |
| `POŽADAVEK` | `#2563eb` | zadání od zákazníka |
| `PROBLÉM` | `#dc2626` | chyba/blokace |

- Datum piš jako `d.m.` (např. `20.10.`) – stejný styl, jaký používají předchozí zápisy.
- **HOTOVO patří na začátek hlavičky**, protože tlačítko `✕`/`✓` v rozšíření maže jen HOTOVO z hlavičky. Ostatní odznaky (EDIT, R.EDIT…) dávej za něj nebo doprostřed textu.
- Hotovou položku **nezaškrtávej** (`state` nech `false`) – zaškrtnutí dělá člověk po kontrole. HOTOVO je jen signál „je to hotové".

---

## 3. Postup práce (read → modify → write)

1. **Přečti** položku (`get_checklist` / `get_card`) → dostaneš `name`.
2. **Zdekóduj** `name`:
   - nezačíná `[[ttm:line:v1]]` → je to **prostý text**, pracuj s ním jako s obyčejným stringem (a při zápisu ho zabal, viz `plain()`);
   - začíná, ale dekódování selže → formát je poškozený, **nepřepisuj ho** naslepo; vyžádej rozhodnutí člověka.
3. **Uprav tělo** (prepend/append značek) – nikdy nepřidávej značky do už zakódovaného jednořádku.
4. **Zakóduj** tělo + hlavičku na jeden řádek a zapiš přes MCP (`update_checklist_item` s novým `name`).
5. **Ověř** round-trip: dekóduj, co jsi zapsal, a porovnej s očekávaným tělem.

Zásady:
- Neměň `state` (zaškrtnutí), `id`, `pos` ani jiné položky.
- Při úpravě zachovej ostatní značky a odznaky, které v textu byly.
- Nevkládej `HOTOVO` dvakrát – když už tam je, jen přepiš datum.

---

## 4. Referenční implementace (Python) – otestovaná, bajt na bajt stejná jako rozšíření

```python
PREFIX = '[[ttm:line:v1]]'
HEADER = '[[ttm:v1]]\n'
ESC = {'\\': '005c', '*': '002a', '_': '005f', '~': '007e', '`': '0060',
       '(': '0028', ')': '0029', '<': '003c', '>': '003e', '&': '0026',
       ':': '003a', '.': '002e', '@': '0040'}
REV = {v: k for k, v in ESC.items()}


def encode(source):
    """source (hlavička + tělo) -> jeden fyzický řádek"""
    out = [PREFIX]
    for ch in source:
        if ch == '\n':   out.append('\\n')
        elif ch == '\r': out.append('\\r')
        elif ch == '\t': out.append('\\t')
        elif ch in ESC:  out.append('\\u' + ESC[ch])
        elif ord(ch) < 32 or ord(ch) == 127 or ord(ch) in (0x2028, 0x2029):
            out.append('\\u%04x' % ord(ch))
        else: out.append(ch)
    return ''.join(out)


def decode(value):
    """jeden fyzický řádek -> source; None = není náš formát"""
    if not isinstance(value, str) or not value.startswith(PREFIX):
        return None
    body, out, i = value[len(PREFIX):], [], 0
    if any(ord(c) < 32 or ord(c) == 127 for c in body):
        return None
    while i < len(body):
        ch = body[i]
        if ch != '\\':
            out.append(ch); i += 1; continue
        nxt = body[i + 1:i + 2]
        if nxt in ('n', 'r', 't'):
            out.append({'n': '\n', 'r': '\r', 't': '\t'}[nxt]); i += 2; continue
        if nxt != 'u' or i + 6 > len(body):
            return None
        code = body[i + 2:i + 6]
        num = int(code, 16)
        if code.lower() not in REV and num >= 32 and num != 127:
            return None          # neplatný escape
        out.append(chr(num)); i += 6
    return ''.join(out)


def escape_text(text):
    return text.replace('\\', '\\\\').replace('[[', '\\[[')


def plain(text):
    """prostý text (bez značek) jako formátovaná položka"""
    return encode(HEADER + escape_text(text))


def rich(body):
    """tělo se značkami (bez hlavičky) -> hodnota pro Trello"""
    return encode(HEADER + body)


def body_of(value):
    """hodnota z Trella -> tělo bez hlavičky; None = neformátovaná položka"""
    source = decode(value)
    if source is None or not source.startswith(HEADER):
        return None
    return source[len(HEADER):]
```

Pozn.: `:` a `.` se **escapují** i v hlavičce, takže zakódovaná hlavička vypadá `[[ttm\u003av1]]`. To je správně – neupravuj to ručně, používej `encode()`.

---

## 5. Příklady

**(a) Prostý text** (nic než text; vhodné pro novou položku bez formátování)

```python
plain('Prosím o kontrolu. Faktura č. 2024/15 (viz. mail).')
# [[ttm:line:v1]][[ttm\u003av1]]\nProsím o kontrolu\u002e Faktura č\u002e 2024/15 \u0028viz\u002e mail\u0029\u002e
```

**(b) Hotovo s datem, sekce, barva**

```python
rich('[[badge=HOTOVO 20.10.;#16a34a]] Faktura vystavena.\n'
     '[[section]]\n'
     '[[color=#dc2626]]Termín: pátek[[/color]]')
# [[ttm:line:v1]][[ttm\u003av1]]\n[[badge=HOTOVO 20\u002e10\u002e;#16a34a]] Faktura vystavena\u002e\n[[section]]\n[[color=#dc2626]]Termín\u003a pátek[[/color]]
```

**(c) Log úprav** – HOTOVO první (nebo žádné), EDIT/R.EDIT uvnitř textu:

```python
rich('[[badge=HOTOVO 20.10.;#16a34a]] Popis položky.\n'
     '[[section]]\n'
     '[[badge=EDIT 15.10.;#f97316]] Doplněno číslo objednávky.\n'
     '[[badge=R.EDIT 18.10.;#16a34a]] Opraveno podle mailu.\n'
     '[[section]]\n'
     '[[badge=POŽADAVEK;#2563eb]] Prosím potvrdit.')
```

**(d) Změna data u HOTOVO** (existující HOTOVO v hlavičce přepiš, neduplikuj):

```python
body = body_of(existing_name) or escape_text(existing_name)
body = re.sub(r'\[\[badge=HOTOVO[^;\[\]]*;#16a34a\]\]', '[[badge=HOTOVO 21.10.;#16a34a]]', body, count=1)
new_name = rich(body)
```

**(e) Zrušení HOTOVO** – odstraň jen odznak z hlavičky (text i ostatní odznaky nech být):

```python
body = re.sub(r'^\s*\[\[badge=HOTOVO[^;\[\]]*;#16a34a\]\]\s*', '', body, count=1)
new_name = rich(body)
```

---

## 6. Escapování v transportu (kdyby ses ptal, proč to vypadá divně)

| Znak | Zápis |
|---|---|
| nový řádek, CR, tab | `\n`, `\r`, `\t` |
| `\` | `\u005c` |
| `*` | `\u002a` |
| `_` | `\u005f` |
| `~` | `\u007e` |
| `` ` `` (zpětný apostrof) | `\u0060` |
| `(` a `)` | `\u0028`, `\u0029` |
| `<` a `>` | `\u003c`, `\u003e` |
| `&` | `\u0026` |
| `:` | `\u003a` |
| `.` | `\u002e` |
| `@` | `\u0040` |
| ostatní řídicí znaky, `U+2028`, `U+2029` | `\u00XX` |

Dekodér **odmítne** celý řádek, když v něm najde surový nový řádek/tabulátor/řídicí znak, neznámý `\uXXXX` (mimo tabulku a mimo řídicí rozsah) nebo surrogate – a také když vnitřní source nejde sparsovat. „Odmítne" znamená: rozšíření text zobrazí jako surový text, nic nerozbije, ale nevypadá to dobře.

---

## 7. Časté chyby a jejich projev

| Chyba | Projev |
|---|---|
| pošleš `source` bez zakódování | v Trellu je vidět `[[ttm:v1]]` a značky jako text |
| ruční `\uXXXX`/`\n` překlepy | položka se nezdekóduje, ukáže se surový jednořádek |
| neuzavřená značka (`[[b]]` bez `[[/b]]`) | celá položka neplatí → surový text |
| dvě barvy přes sebe | neplatné → surový text |
| odznak s `;` v názvu | neplatné → surový text |
| hotovo zaškrtnuté + HOTOVO | zbytečné; zaškrtnutí nech na člověku |
| dva `HOTOVO` odznaky | UI rozšíření jich odebere jen jeden – drž jen jeden |

---

## 8. Checklist před zápisem

- [ ] Tělo začíná `[[badge=…]]` hlavičkou? Pak je `HOTOVO` (pokud je) **první**.
- [ ] Všechny `[[x]]` mají svoje `[[/x]]`, `color` se nevnořuje.
- [ ] Barvy jsou `#rrggbb`, název odznaku ≤ 32 znaků bez `[ ] ; \`.
- [ ] `encode()` proběhl nad `HEADER + tělo`, ne nad už zakódovaným řádkem.
- [ ] Round-trip: `body_of(vysledek) == očekávané tělo`.
- [ ] Neměnil jsem `state` ani jiné položky.

---

## 9. Omezení

- Délka: transport je cca 1,15× delší než text (escapování). Drž položky v řádu stovek znaků; konkrétní limit názvu položky v Trellu jsem neověřoval.
- Seznam odznaků a jejich barvy se v rozšíření konfigurují (výchozí: POŽADAVEK `#2563eb`, EDIT `#f97316`, R.EDIT `#16a34a`, PROBLÉM `#dc2626`, HOTOVO `#16a34a`). Agent by měl používat hlavně tyhle názvy, jinak si člověk musí barvu doladit v nastavení.
- Markdown exportér rozšíření tuhle obálku rozpozná a převede ji na čitelný Markdown (`[HOTOVO 20.10.] **text**`, `---` pro sekce).
