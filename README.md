# Trello to Markdown Exporter

<img src="chrome-extension/icons/icon128.png" width="128" />

A simple, secure, and beautiful tool to completely export your Trello boards and cards to Markdown. 
It operates entirely locally in your browser without sending any data to external servers.

[**Česká verze níže / Czech version below**](#česká-verze)

---

## 🚀 Features
- **Chrome Extension**: One-click export directly from any Trello board or card.
- **Standalone Web App**: Drag & Drop your exported Trello `.json` file for instant conversion.
- **Customizable Export**: Toggle checklists, comments, archived cards, and completed checklist items.
- **Premium UI**: Crafted with a modern glassmorphism design.
- **100% Privacy**: All parsing happens locally on your device.

## 🛠️ Usage

### Option 1: Chrome Extension (Recommended)
1. Clone or download this repository.
2. Open Google Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the `chrome-extension` folder inside this repository.
5. Go to any Trello board or card, click the extension icon, and hit **Copy** or **Download**.

### Option 2: Standalone Web App
1. Export a `.json` file from your Trello board/card.
2. Open `index.html` from this repository in your web browser.
3. Drag & Drop the `.json` file into the designated area.
4. Preview the resulting Markdown and download it.

---

<br>

<a name="česká-verze"></a>
# Trello to Markdown Exporter (Česká verze)

Jednoduchý, bezpečný a vizuálně povedený nástroj pro kompletní export vašich Trello nástěnek a karet do formátu Markdown. 
Vše funguje zcela lokálně ve vašem prohlížeči, žádná data se neodesílají na žádné cizí servery.

## 🚀 Funkce
- **Rozšíření pro Chrome:** Export na jedno kliknutí přímo z libovolné nástěnky nebo karty v Trellu.
- **Samostatná webová aplikace:** Stačí přetáhnout (Drag & Drop) váš exportovaný Trello `.json` soubor pro okamžitý převod.
- **Přizpůsobitelný export:** Možnost přepínat zahrnutí checklistů, komentářů, archivovaných karet a splněných položek checklistů.
- **Prémiové UI:** Moderní vzhled ve stylu "glassmorphism".
- **100% Soukromí:** Veškeré parsování probíhá přímo na vašem zařízení.

## 🛠️ Jak používat

### Možnost 1: Rozšíření do Chrome (Doporučeno)
1. Naklonujte nebo stáhněte si tento repozitář.
2. Otevřete Google Chrome a přejděte na adresu `chrome://extensions/`.
3. Vpravo nahoře zapněte **Režim pro vývojáře** (Developer mode).
4. Klikněte na tlačítko **Načíst rozbalené** (Load unpacked) a vyberte složku `chrome-extension` nacházející se uvnitř tohoto repozitáře.
5. Běžte na jakoukoliv Trello nástěnku nebo kartu, klikněte na ikonku rozšíření a dejte **Kopírovat** nebo **Stáhnout**.

### Možnost 2: Samostatná webová aplikace
1. Vyexportujte si `.json` soubor vaší Trello nástěnky nebo karty.
2. Otevřete v prohlížeči soubor `index.html` z tohoto repozitáře.
3. Přetáhněte stažený `.json` soubor do vyznačené oblasti na obrazovce.
4. Prohlédněte si náhled výsledného Markdownu a stáhněte si ho kliknutím na tlačítko.

## Formátovaný checklist v Trellu

Rozšíření přidává nad nativní pole položky checklistu malý panel nástrojů. Vkládá jen **běžný Markdown, který Trello samo vykreslí** – bez rozšíření se nic nerozbije a uživatel uvidí totéž (jen bez barev odznaků). Po změně načtěte rozšíření znovu v `chrome://extensions` a obnovte kartu Trella.

- **✓ HOTOVO** – vloží `` `HOTOVO 16.11.` `` na úplný začátek textu (opakovaný klik přepíše datum). **✕** ho odebere. Checklist se nezaškrtává.
- **EDIT** – vloží `` `EDIT 16.11.` `` na kurzor.
- **B**, **I**, **S** – `**tučně**`, `*kurzíva*`, `~~přeškrtnuto~~` (opakované kliknutí značky odebere).
- **</>** kód, **🔗** odkaz `[text](url)`.
- **¶** – vloží prázdný řádek = nový odstavec.

Odznaky jsou inline kód, který Trello zobrazí jako šedý čip; rozšíření čipy `HOTOVO` a `EDIT` jen obarví (zeleně / oranžově).

**Důležité omezení Trella (ověřeno):** jeden nový řádek se zobrazí jako mezera; odstavec dělá jen prázdný řádek. Tvrdý zlom (dvě mezery nebo `\` před novým řádkem) **shodí vykreslení celé karty** (`Token type hardbreak not supported`). Rozšíření proto takové konce řádků před uložením vždy odstraní. Totéž platí pro agenty zapisující přes MCP – viz [docs/trello-mcp-agent-manual.md](docs/trello-mcp-agent-manual.md).

Položky uložené starou verzí (`[[ttm:line:v1]]…`) rozšíření už nepřevádí; zobrazí se jako surový text.

## Předání klientovi

- `npm run package` vytvoří `dist/trello-rich-checklist-v<verze>.zip` (manifest v kořeni, připravené pro Chrome Web Store i pro „Načíst rozbalené“).
- Návod pro klienta: [docs/client-install.md](docs/client-install.md) (dá se poslat celý).
- Publikace do obchodu a šablona e-mailu: [docs/publish-checklist.md](docs/publish-checklist.md).
- Nejlehčí instalace pro klienta = **Chrome Web Store v režimu „Unlisted“** (2 kliky, automatické aktualizace). ZIP + režim vývojáře je jen záloha.

Technické testy: `npm test`. Testy nepřistupují k živému Trellu.
