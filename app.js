const translations = {
    cz: {
        title: "Trello <span>to</span> Markdown",
        subtitle: "Exportujte své Trello nástěnky lokálně do čistého Markdown formátu.",
        dropTitle: "Přetáhněte JSON soubor sem",
        dropText: "nebo klikněte pro výběr souboru",
        settingsTitle: "Nastavení exportu",
        optArchived: "Zahrnout archivované karty",
        optComments: "Zahrnout komentáře",
        optChecklists: "Zahrnout checklisty",
        optCompleted: "Zahrnout splněné body (checklist)",
        previewTitle: "Náhled Markdownu",
        btnDownload: "Stáhnout .md",
        statusLoading: "Zpracovávání...",
        placeholder: "Zde se zobrazí vygenerovaný Markdown...",
        alertInvalid: "Prosím vyberte platný .json soubor exportovaný z Trella.",
        alertError: "Chyba při parsování JSON souboru. Zkontrolujte, zda se jedná o platný export z aplikace Trello.",
        alertReadError: "Chyba při čtení souboru.",
        fileSelected: "Vybraný soubor:",
        mdLabels: "**Štítky:**",
        mdComments: "#### Komentáře",
        mdUnknown: "Neznámý",
        mdFakeList: "Exportovaná karta"
    },
    en: {
        title: "Trello <span>to</span> Markdown",
        subtitle: "Export your Trello boards locally to clean Markdown format.",
        dropTitle: "Drop your JSON file here",
        dropText: "or click to select a file",
        settingsTitle: "Export Settings",
        optArchived: "Include archived cards",
        optComments: "Include comments",
        optChecklists: "Include checklists",
        optCompleted: "Include completed checklist items",
        previewTitle: "Markdown Preview",
        btnDownload: "Download .md",
        statusLoading: "Processing...",
        placeholder: "Generated Markdown will appear here...",
        alertInvalid: "Please select a valid .json file exported from Trello.",
        alertError: "Error parsing JSON file. Make sure it's a valid Trello export.",
        alertReadError: "Error reading file.",
        fileSelected: "Selected file:",
        mdLabels: "**Labels:**",
        mdComments: "#### Comments",
        mdUnknown: "Unknown",
        mdFakeList: "Exported Card"
    },
    de: {
        title: "Trello <span>to</span> Markdown",
        subtitle: "Exportieren Sie Ihre Trello-Boards lokal in sauberes Markdown-Format.",
        dropTitle: "JSON-Datei hier ablegen",
        dropText: "oder klicken, um Datei auszuwählen",
        settingsTitle: "Exporteinstellungen",
        optArchived: "Archivierte Karten einschließen",
        optComments: "Kommentare einschließen",
        optChecklists: "Checklisten einschließen",
        optCompleted: "Abgeschlossene Elemente einschließen",
        previewTitle: "Markdown Vorschau",
        btnDownload: "Herunterladen .md",
        statusLoading: "Verarbeitung...",
        placeholder: "Der generierte Markdown wird hier angezeigt...",
        alertInvalid: "Bitte wählen Sie eine gültige .json-Datei aus Trello.",
        alertError: "Fehler beim Parsen der JSON-Datei. Vergewissern Sie sich, dass es sich um einen gültigen Trello-Export handelt.",
        alertReadError: "Fehler beim Lesen der Datei.",
        fileSelected: "Ausgewählte Datei:",
        mdLabels: "**Labels:**",
        mdComments: "#### Kommentare",
        mdUnknown: "Unbekannt",
        mdFakeList: "Exportierte Karte"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    let currentLang = localStorage.getItem('trello2md_lang') || 'cz';
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
        langSelect.value = currentLang;
        langSelect.addEventListener('change', (e) => {
            currentLang = e.target.value;
            localStorage.setItem('trello2md_lang', currentLang);
            updateUILanguage();
            if (window.lastTrelloData) {
                processTrelloData(window.lastTrelloData); // Re-render markdown
            }
        });
    }

    function t(key) {
        return translations[currentLang][key] || key;
    }

    function updateUILanguage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[currentLang][key]) {
                el.innerText = translations[currentLang][key];
            }
        });
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            if (translations[currentLang][key]) {
                el.innerHTML = translations[currentLang][key];
            }
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (translations[currentLang][key]) {
                el.placeholder = translations[currentLang][key];
            }
        });
        // Update live file display if showing
        if (!fileNameDisplay.classList.contains('hidden') && currentFileNameMsg) {
            fileNameDisplay.textContent = `${t('fileSelected')} ${currentFileNameMsg}`;
        }
    }

    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileNameDisplay = document.getElementById('file-name-display');
    const markdownOutput = document.getElementById('markdown-output');
    const downloadBtn = document.getElementById('download-btn');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // Settings
    const includeArchived = document.getElementById('include-archived');
    const includeComments = document.getElementById('include-comments');
    const includeChecklists = document.getElementById('include-checklists');
    const includeCompletedItems = document.getElementById('include-completed-items');

    let currentFileName = 'trello_export.md';
    let currentFileNameMsg = '';
    let currentMarkdown = '';

    // Initialize UI language
    updateUILanguage();

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropZone.classList.add('dragover');
    }

    function unhighlight() {
        dropZone.classList.remove('dragover');
    }

    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);
    
    // Handle click to select files
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect, false);
    
    // Handle settings changes
    [includeArchived, includeComments, includeChecklists, includeCompletedItems].forEach(checkbox => {
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                if (window.lastTrelloData) {
                    processTrelloData(window.lastTrelloData);
                }
            });
        }
    });

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFileSelect(e) {
        const files = e.target.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        if (files.length === 0) return;
        const file = files[0];
        
        if (!file.name.endsWith('.json')) {
            alert(t('alertInvalid'));
            return;
        }

        currentFileName = file.name.replace('.json', '.md');
        currentFileNameMsg = file.name;
        fileNameDisplay.textContent = `${t('fileSelected')} ${file.name}`;
        fileNameDisplay.classList.remove('hidden');
        
        const reader = new FileReader();
        
        reader.onloadstart = () => {
            loadingOverlay.classList.remove('hidden');
        };
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                window.lastTrelloData = data;
                processTrelloData(data);
            } catch (error) {
                console.error("Error parsing JSON:", error);
                alert(t('alertError'));
            } finally {
                loadingOverlay.classList.add('hidden');
            }
        };

        reader.onerror = () => {
            loadingOverlay.classList.add('hidden');
            alert(t('alertReadError'));
        };

        reader.readAsText(file);
    }

    function processTrelloData(data) {
        const boardName = data.name || 'Trello Export';
        let md = `# ${boardName}\n\n`;

        const isSingleCard = !data.cards && !data.lists && data.idBoard;
        
        let cardsToProcess = [];
        let listsToProcess = [];
        
        if (isSingleCard) {
            cardsToProcess = [data]; 
            listsToProcess = [{ id: data.idList || 'list1', name: t('mdFakeList'), closed: false }];
        } else {
            cardsToProcess = data.cards || [];
            listsToProcess = data.lists || [];
        }

        const listsMap = new Map();
        listsToProcess.forEach(list => listsMap.set(list.id, list));

        const labelsMap = new Map();
        if (data.labels) {
            data.labels.forEach(label => labelsMap.set(label.id, label));
        }

        const checklistsMap = new Map();
        if (data.checklists) {
            data.checklists.forEach(cl => checklistsMap.set(cl.id, cl));
        }
        
        const commentsByCard = new Map();
        if (data.actions && includeComments.checked) {
            data.actions.forEach(action => {
                if (action.type === 'commentCard' && action.data && action.data.card) {
                    const cardId = action.data.card.id;
                    if (!commentsByCard.has(cardId)) {
                        commentsByCard.set(cardId, []);
                    }
                    commentsByCard.get(cardId).push({
                        text: action.data.text,
                        member: action.memberCreator ? action.memberCreator.fullName : t('mdUnknown'),
                        date: new Date(action.date).toLocaleString(currentLang === 'cz' ? 'cs-CZ' : (currentLang === 'de' ? 'de-DE' : 'en-US'))
                    });
                }
            });
        }

        const cardsByList = new Map();
        cardsToProcess.forEach(card => {
            if (card.closed && !includeArchived.checked) return;
            
            const listId = card.idList || 'list1';
            if (!cardsByList.has(listId)) {
                cardsByList.set(listId, []);
            }
            cardsByList.get(listId).push(card);
        });

        listsToProcess.forEach(list => {
            if (list.closed && !includeArchived.checked) return;

            const listCards = cardsByList.get(list.id) || [];
            if (listCards.length === 0) return;

            if (!isSingleCard) {
                md += `## ${list.name}\n\n`;
            }

            listCards.sort((a, b) => (a.pos || 0) - (b.pos || 0));

            listCards.forEach(card => {
                if (!isSingleCard) {
                    md += `### ${card.name}\n\n`;
                }
                
                if (card.labels && card.labels.length > 0) {
                    const labelNames = card.labels.map(l => l.name || l.color).filter(Boolean);
                    if (labelNames.length > 0) {
                        md += `${t('mdLabels')} ${labelNames.join(', ')}\n\n`;
                    }
                }

                if (card.desc) {
                    md += `${card.desc}\n\n`;
                }

                if (includeChecklists.checked && card.idChecklists && card.idChecklists.length > 0) {
                    card.idChecklists.forEach(clId => {
                        const cl = checklistsMap.get(clId);
                        if (cl) {
                            md += `**${cl.name}**\n`;
                            if (cl.checkItems && cl.checkItems.length > 0) {
                                cl.checkItems.sort((a, b) => a.pos - b.pos);
                                cl.checkItems.forEach(item => {
                                    if (!includeCompletedItems.checked && item.state === 'complete') return;
                                    const isChecked = item.state === 'complete' ? 'x' : ' ';
                                    md += `- [${isChecked}] ${item.name}\n`;
                                });
                            }
                            md += `\n`;
                        }
                    });
                }

                if (includeComments.checked && commentsByCard.has(card.id)) {
                    const comments = commentsByCard.get(card.id);
                    if (comments && comments.length > 0) {
                        md += `${t('mdComments')}\n`;
                        comments.forEach(c => {
                            md += `> **${c.member}** (${c.date}):  \n> ${c.text.split('\n').join('\n> ')}\n\n`;
                        });
                    }
                }
                
                if (!isSingleCard) {
                    md += `---\n\n`; 
                }
            });
        });

        currentMarkdown = md;
        markdownOutput.value = md;
        downloadBtn.disabled = false;
    }

    downloadBtn.addEventListener('click', () => {
        if (!currentMarkdown) return;
        const blob = new Blob([currentMarkdown], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentFileName;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    });
});
