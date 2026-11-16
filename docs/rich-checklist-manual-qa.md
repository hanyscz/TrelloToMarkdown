# Ruční kontrola formátovaného checklistu

Formátování probíhá v nativním formuláři Trella; samostatné editační okno už neexistuje.

1. V `chrome://extensions` načtěte rozšíření znovu a obnovte kartu Trella.
2. Otevřete kartu s checklistem. U položky klikněte na její název (nebo na náhled) – otevře se nativní úprava a nad polem se objeví panel nástrojů: první řádek **✓ HOTOVO  ✕**, druhý řádek **B I S | barva | 🏷 | ¶ | — | ⌫ ⚙**.
3. Vyberte část textu a zkuste **B**, **I**, **S**, barvu, odznak, **¶** (nový řádek, dvakrát = prázdný řádek) a oddělovač. Ověřte, že pole zůstává čitelné a panel nemizí.
4. Přes **🏷** vložte odznak EDIT – do odznaku se musí přidat dnešní datum.
5. Klikněte **✓ HOTOVO** – na začátek textu se vloží odznak s dnešním datem a zaškrtávací políčko zůstane nezaškrtnuté. Klikněte znovu – datum se přepíše, duplikát nevznikne.
6. Klikněte **✕** – zmizí jen HOTOVO z hlavičky textu; odznak EDIT musí zůstat. Když HOTOVO v hlavičce není, objeví se hláška a nic se nesmaže.
7. Klikněte na nativní **Uložit**. Ověřte, že se položka uloží jako jedna položka, v seznamu se zobrazí barevný náhled s orámovaným odznakem a kliknutí na náhled znovu otevře nativní úpravu (text zůstává čitelný, barvy a odznaky zachované).
8. Zavřete úpravu a u jiné položky klikněte na malé **✓** vedle textu – rozšíření samo otevře nativní úpravu, vloží HOTOVO s dnešním datem a stiskne nativní **Uložit**. Druhý klik na zelené **✓** ho zase odebere. Zaškrtávací políčko musí zůstat nezměněné.
9. Obnovte kartu a položku otevřete znovu – obsah i formát musí zůstat.
10. Novou formátovanou položku založte nativním formulářem **Přidat položku** a tlačítkem **Přidat** v Trellu.
11. Zkontrolujte nastavení barev odznaků přes **⚙** v panelu nástrojů.

Panel nástrojů zapisuje pouze do nativního pole; síťové API ani přihlašovací údaje nepoužívá. Živý serverový round-trip je nutné ověřit ručně na vlastní odhoditelné položce — rozšíření neumí potvrdit odpověď serveru Trella.

Poznámka: `tests/fixtures/trello-card.html` je historická fixture, která ještě testuje zrušené dialogové okno; aktuální chování ověřujte ručně podle výše uvedených kroků.
