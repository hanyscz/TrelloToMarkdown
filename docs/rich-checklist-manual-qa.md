# Ruční kontrola formátovaného checklistu

1. V `chrome://extensions` načtěte rozšíření znovu a obnovte kartu Trella.
2. Otevřete kartu s checklistem a klikněte na položku (nebo **Přidat položku**). Nad polem se objeví panel: první řádek **✓ HOTOVO  ✕  EDIT**, druhý **B I S </> 🔗 | ¶**.
3. Vyberte text a zkuste **B**, **I**, **S**, **</>**, **🔗**. Opakované kliknutí značky odebere.
4. **¶** vloží prázdný řádek. Po uložení musí být dva odstavce.
5. **✓ HOTOVO** vloží `` `HOTOVO d.m.` `` na začátek, druhý klik přepíše datum. **✕** ho odebere. **EDIT** se vloží na kurzor.
6. Po **Uložit** musí být HOTOVO zelený a EDIT oranžový čip, položka jedna.
7. Obnovte kartu a ověřte, že vše zůstalo.
8. Do pole vložte `a␣␣⏎b` (dvě mezery před novým řádkem) a uložte – karta se nesmí rozbít (rozšíření mezery odstraní).

Rozšíření nepoužívá API ani přihlašovací údaje, zapisuje jen do nativního pole.
