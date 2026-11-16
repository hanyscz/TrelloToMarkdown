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

Formátování se dělá přímo v nativním formuláři Trella, žádné samostatné editační okno neexistuje. Po načtení nebo změně rozšíření znovu načtěte rozšíření v `chrome://extensions` a obnovte kartu Trella. Pak klikněte na položku checklistu (nebo otevřete **Přidat položku**); nad nativním polem se objeví kompaktní panel nástrojů:

- **B**, **I**, **S** – tučné, kurzíva, přeškrtnutí výběru (opakované kliknutí formát odebere).
- **A** – barva textu; otevře malý panel s předvolbami a vlastní barvou.
- **🏷** – vloží odznak z konfigurace na pozici kurzoru.
- **¶** – vloží nový řádek; dvakrát za sebou udělá prázdný řádek (nový odstavec).
- **—** – vloží oddělovač sekce.
- **⌫** – odebere značky formátování z výběru.
- **⚙** – otevře nastavení odznaků.

První řádek lišty tvoří dvě rychlé tlačítka: **✓ HOTOVO** a **✕**. **✓ HOTOVO** vloží odznak s dnešním datem (`d.m.`) na úplný začátek textu položky – checklist se přitom nezaškrtne, takže si ho můžete zaškrtnout sami po kontrole. Opakovaný klik jen přepíše datum. **✕** odebere pouze odznak HOTOVO stojící v hlavičce textu (mezi úvodními odznaky); odznaky **EDIT**/**R.EDIT** ani HOTOVO uprostřed textu nikdy nesmaže. Ostatní odznaky včetně **EDIT** a **R.EDIT** vkládáte přes **🏷**; i tam se do odznaku přidá dnešní datum.

### HOTOVO jedním klikem přímo v seznamu

Vedle každé položky checklistu je malé tlačítko **✓**. Klikne za vás nativní úpravu, vloží (nebo odebere) odznak HOTOVO s dnešním datem a sám stiskne nativní **Uložit** – editační pole se otevře jen na okamžik. Zelené **✓** znamená, že položka už HOTOVO v hlavičce má. Zaškrtávací políčko zůstává nedotčené.

Text v poli zůstává čitelný (značky `[[b]]`, `[[color=#…]]`, `[[badge=…]]`). Teprve při uložení – nativním **Uložit**/**Přidat** nebo Enterem – se obsah zabalí do jednoho fyzického řádku s prefixem `[[ttm:line:v1]]`, takže Trello ho uloží jako jednu položku. V seznamu checklistu se pak zobrazí barevný náhled místo značek; kliknutím na náhled otevřete nativní úpravu. Nové položky se zakládají stejným nativním formulářem.

Konfigurace odznaků je v možnostech rozšíření. Selector DOM Trella se může změnit; živý serverový round-trip ověřte ručně na vlastní odhoditelné položce. Popup i samostatný exporter rozpoznávají transportní obálku a exportují dekódovaný Markdown.

**Pro agenty zapisující do Trella přes MCP:** viz [docs/trello-mcp-agent-manual.md](docs/trello-mcp-agent-manual.md) – popis dvou vrstev formátu, značek, úmluvy odznaků s datem a otestovaná referenční implementace v Pythonu.

## Předání klientovi

- `npm run package` vytvoří `dist/trello-rich-checklist-v<verze>.zip` (manifest v kořeni, připravené pro Chrome Web Store i pro „Načíst rozbalené“).
- Návod pro klienta: [docs/client-install.md](docs/client-install.md) (dá se poslat celý).
- Publikace do obchodu a šablona e-mailu: [docs/publish-checklist.md](docs/publish-checklist.md).
- Nejlehčí instalace pro klienta = **Chrome Web Store v režimu „Unlisted“** (2 kliky, automatické aktualizace). ZIP + režim vývojáře je jen záloha.

Technické testy: `npm test`. Testy nepřistupují k živému Trellu.
