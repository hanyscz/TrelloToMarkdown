# Publikace a předání klientovi

Cíl: klient klikne na odkaz → **Přidat do Chrome** → hotovo. Nic víc.

## Volba cesty

| Cesta | Náročnost pro klienta | Náročnost pro tebe | Doporučení |
|---|---|---|---|
| **Chrome Web Store, režim „Unlisted" (neuvedené)** | 2 kliky, aktualizace sama | jednorázově $5 + recenze 1–3 dny | ✅ **použij tohle** |
| ZIP + „Načíst rozbalené" | 7 kroků, režim vývojáře, varovná bublina při startu | žádná | jen jako záloha |
| Podniková politika (Google Workspace / GPO) | nulová (nainstaluje administrátor) | správa konzole, hosting CRX | jen když má klient Workspace |
| Samostatný `.crx` ke stažení | — | — | ❌ Chrome na Windows/Mac ji odmítne nainstalovat |

**Proč ne `.crx`:** Chrome od verze 75 povoluje instalaci CRX mimo obchod jen na Linuxu nebo přes podnikovou politiku. U běžného klienta to neprojde.

---

## 1. Příprava balíčku

```powershell
npm run package
```

Vznikne `dist/trello-rich-checklist-v<verze>.zip` s `manifest.json` v kořeni (přesně to, co obchod i „Načíst rozbalené" chtějí).
Verzi zvyšuj v `chrome-extension/manifest.json` (aktuálně `"version": "2.0.0"`), jinak obchod novou verzi odmítne.

## 2. Vývojářský účet

1. <https://chrome.google.com/webstore/devconsole> → přihlásit se.
2. Zaplatit **jednorázově $5** (platí navždy, na všechny rozšíření).
3. Dovyplnit údaj o vydavateli (jméno/e-mail) – bez toho nejde nahrát.

## 3. Nahrání a vyplnění položky

Nahrát ZIP → vyplnit:

**Základ**
- Název: `Trello Rich Checklist`
- Shrnutí (max 132 znaků): `Formátování checklistu v Trellu: tučné, odstavce, odznaky HOTOVO/EDIT. Export do Markdownu. Bez odesílání dat.`
- Kategorie: `Productivity` → `Tools` (nebo Communication)
- Jazyk: čeština (případně i angličtina)

**Obrázky**
- Ikona 128×128 → `chrome-extension/icons/icon128.png` ✔ hotová
- 1–5 screenshotů **1280×800** nebo **640×400** (karta Trella s náhledem položek a lištou nástrojů)
- Volitelně promo dlaždice 440×280

**Prohlášení (Privacy practices)** – povinné:
- Single purpose: `Adds a formatting toolbar (bold, italic, paragraphs, DONE/EDIT date badges) to Trello checklist items, and exports Trello boards/cards to Markdown.`
- Justifikace oprávnění:
  - `activeTab` – `Reads the current tab URL only to detect whether it is a Trello board/card and to build the export URL for the popup.`
  - `host_permissions: https://trello.com/*` – `The content script runs only on trello.com to add the formatting toolbar to the native checklist item editor. No network requests are made by the extension.`
- Remote code: **No**
- Data collection: **nic nesbíráme** (zaškrtni, že se neshromažďují žádná data uživatelů)
- Privacy policy URL: vlož odkaz (klidně GitHub Pages / gist) – text níže

**Viditelnost**
- `Unlisted` (neuvedené) – položka není ve vyhledávání, funguje jen přes přímý odkaz. Přesně pro předání jednomu klientovi.
- `Private` (jen konkrétní účty) jde taky, ale pozvat účet znamená ruční práci navíc.

## 4. Recenze a předání

- Recenze obvykle 1–3 pracovní dny; u jednoduchého rozšíření bez síťových volání bývá rychlá.
- Po schválení zkopíruj odkaz `https://chromewebstore.google.com/detail/<ID>` a pošli ho klientovi.
- Od té chvíle se aktualizace dělají samy: nahraješ nový ZIP se zvýšenou verzí → schválení → klient má novou verzi bez zásahu.

---

## Šablona e-mailu pro klienta

> Dobrý den,
>
> posílám odkaz na malé rozšíření do Chrome, které v Trellu přidá k položkám checklistu panel formátování (tučné, odstavce) a odznaky HOTOVO a EDIT s datem.
>
> Instalace: otevřete odkaz → **Přidat do Chrome** → **Přidat rozšíření** → obnovte kartu v Trellu (F5).
>
> https://chromewebstore.google.com/detail/…
>
> Rozšíření nic neodesílá na server a nepotřebuje žádné přihlašovací údaje. Kdyby se panel nad položkou nezobrazil, stačí obnovit stránku Trella.
>
> (Podrobný návod i pro ruční variantu je v příloze.)

Příloha pro ruční variantu: `docs/client-install.md`.

---

## Text privacy policy (minimální, stačí na vlastní stránku)

```
Trello Rich Checklist – Privacy Policy

This extension does not collect, store or transmit any personal data.
All processing happens locally in your browser.

The extension reads the URL of the active tab only to detect whether it is a
Trello board or card. The content script runs only on trello.com to enhance the
native checklist editor. The language preference of the popup is stored in the local
storage of the extension on your device and is never sent anywhere.

No analytics, no remote code, no third-party servers.

Contact: <tvůj e-mail>
```

---

## Kontrola před nahráním

- [ ] `npm run package` proběhlo a ZIP má `manifest.json` v kořeni
- [ ] verze v `manifest.json` je vyšší než poslední publikovaná
- [ ] `npm test` prošlo (17/17)
- [ ] ruční test v Trellu: panel v editoru (B/I/S/kód/odkaz/¶, HOTOVO, EDIT), uložení a znovuotevření, žádná chyba „Něco se pokazilo“
- [ ] screenshot 1280×800 připravený
- [ ] privacy policy URL veřejně dostupná
