# Instalace pro klienta

Tenhle dokument je psaný tak, abys ho mohl poslat klientovi **celý** (nebo z něj vzít jen jednu variantu).

---

## Co to je

Malé rozšíření do prohlížeče Chrome, které v Trellu přidá k položkám checklistu panel formátování (tučné, kurzíva, odstavce) a odznaky **HOTOVO** a **EDIT** s datem. Nic neposílá na server, nepotřebuje přihlašovací údaje ani žádný účet.

---

## Varianta A – odkaz z Chrome Web Store (nejjednodušší, doporučeno)

1. Otevřete odkaz, který jste dostali e-mailem.
2. Klikněte na modré tlačítko **Přidat do Chrome** (Add to Chrome).
3. V okně, které se objeví, klikněte na **Přidat rozšíření** (Add extension).
4. Hotovo. Otevřete nebo obnovte (F5) kartu v Trellu.

Aktualizace pak probíhají samy, nic dalšího nemusíte řešit.

---

## Varianta B – ruční instalace ze souboru ZIP (bez obchodu)

Použijte, jen když varianta A není možná. Instalace jde mimo obchod, takže ji Chrome při každém startu může připomenout hláškou – to je normální.

1. Uložte si přiložený soubor `trello-rich-checklist-v1.0.zip`.
2. Klikněte na něj pravým tlačítkem → **Rozbalit vše** (Extract All).
3. Rozbalte ho na stálé místo, např. `C:\TrelloRichChecklist`.
   ⚠️ Složku potom **nemažte ani nepřesouvejte** – rozšíření z ní běží.
4. Do adresního řádku Chrome napište `chrome://extensions` a stiskněte Enter.
5. Vpravo nahoře zapněte **Režim pro vývojáře** (Developer mode).
6. Vlevo nahoře klikněte na **Načíst rozbalené** (Load unpacked) a vyberte složku z kroku 3 – tu, ve které je přímo soubor `manifest.json`.
7. Otevřete nebo obnovte (F5) kartu v Trellu.

Pokud Chrome po restartu ukáže bublinu „Vypnout rozšíření v režimu vývojáře“, klikněte na **Zavřít / Close**. Rozšíření funguje dál.

---

## Jak poznat, že to funguje

- Otevřete kartu s checklistem. U položek je vlevo malé **✓** tlačítko.
- Položky označené jako hotové mají zeleně orámovaný odznak **HOTOVO** s datem.
- Když kliknete na název položky, objeví se nad textem lišta s **B**, **I**, **S**, odznaky HOTOVO/EDIT a **¶**.

## Když to nefunguje

1. Obnovte stránku Trella (F5) – rozšíření se načítá až po otevření karty.
2. V `chrome://extensions` zkontrolujte, že je rozšíření **zapnuté** (modrý přepínač).
3. Zavřete a znovu otevřete kartu v Trellu.
4. Pokud jste použili variantu B a složku jste přesunuli, zopakujte krok 6 s novým umístěním.

## Co rozšíření nedělá

- Neodesílá žádná data ven a nepoužívá žádné API klíče.
- Nemění vaše texty samo – jen zobrazuje to, co je v položce uložené.
- Nezaškrtává položky za vás. Odznak **HOTOVO** znamená „hotovo, ke kontrole“; zaškrtnutí 🗹 zůstává na vás.

## Důležité (pro toho, kdo zadává)

Položky jsou uložené jako **běžný Markdown, který Trello samo vykreslí** (`**tučně**`, `*kurzíva*`, `` `HOTOVO 20.10.` ``). Bez rozšíření je vše čitelné, jen odznaky HOTOVO a EDIT jsou šedé místo barevných. Klienta tedy není nutné nutit k instalaci.
