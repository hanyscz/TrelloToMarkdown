const translations = {
    cz: {
        title: "Trello <span>to</span> Markdown",
        optArchived: "Zahrnout archivované",
        optComments: "Zahrnout komentáře",
        optChecklists: "Zahrnout checklisty",
        optCompleted: "Zahrnout splněné body",
        btnDownloadExt: "Uložit .md",
        btnCopy: "Kopírovat (📋)",
        copied: "Zkopírováno! ✓",
        statusExtLoading: "Ověřuji záložku...",
        statusExtErrorUrl: "Nejste na webu Trello nástěnky nebo karty.",
        statusExtErrorFetch: "Nepodařilo se stáhnout data. Jste přihlášeni?",
        statusExtSuccess: "Data úspěšně načtena",
        statusExtFetching: "Stahuji data z Trella...",
        errTab: "Nelze zjistit aktuální tab.",
        mdLabels: "**Štítky:**",
        mdComments: "#### Komentáře",
        mdUnknown: "Neznámý",
        mdFakeList: "Exportovaná karta"
    },
    en: {
        title: "Trello <span>to</span> Markdown",
        optArchived: "Include archived",
        optComments: "Include comments",
        optChecklists: "Include checklists",
        optCompleted: "Include completed items",
        btnDownloadExt: "Save .md",
        btnCopy: "Copy (📋)",
        copied: "Copied! ✓",
        statusExtLoading: "Verifying tab...",
        statusExtErrorUrl: "You are not on a Trello board or card page.",
        statusExtErrorFetch: "Failed to fetch data. Are you logged in?",
        statusExtSuccess: "Data successfully loaded",
        statusExtFetching: "Fetching data from Trello...",
        errTab: "Could not find active tab.",
        mdLabels: "**Labels:**",
        mdComments: "#### Comments",
        mdUnknown: "Unknown",
        mdFakeList: "Exported Card"
    },
    de: {
        title: "Trello <span>to</span> Markdown",
        optArchived: "Archivierte einschließen",
        optComments: "Kommentare einschließen",
        optChecklists: "Checklisten einschließen",
        optCompleted: "Abgeschlossene einschließen",
        btnDownloadExt: "Speichern .md",
        btnCopy: "Kopieren (📋)",
        copied: "Kopiert! ✓",
        statusExtLoading: "Tab wird überprüft...",
        statusExtErrorUrl: "Sie sind nicht auf einem Trello-Board oder einer Karte.",
        statusExtErrorFetch: "Datenabruf fehlgeschlagen. Sind Sie angemeldet?",
        statusExtSuccess: "Daten erfolgreich geladen",
        statusExtFetching: "Daten von Trello werden abgerufen...",
        errTab: "Aktiver Tab konnte nicht gefunden werden.",
        mdLabels: "**Labels:**",
        mdComments: "#### Kommentare",
        mdUnknown: "Unbekannt",
        mdFakeList: "Exportierte Karte"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    let currentLang = 'cz';
    const langSelect = document.getElementById('lang-select');
    const statusMessage = document.getElementById('status-message');
    const loading = document.getElementById('loading');
    const mainUi = document.getElementById('main-ui');
    
    // Settings
    const includeArchived = document.getElementById('include-archived');
    const includeComments = document.getElementById('include-comments');
    const includeChecklists = document.getElementById('include-checklists');
    const includeCompletedItems = document.getElementById('include-completed-items');

    const btnCopy = document.getElementById('btn-copy');
    const btnDownload = document.getElementById('btn-download');

    let currentFileName = 'trello_export.md';
    let currentMarkdown = '';
    let fetchedData = null;

    // Robust access to storage
    const hasChromeStorage = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
    if (hasChromeStorage) {
        chrome.storage.local.get(['trello2md_lang'], (result) => {
            if (result && result.trello2md_lang) {
                currentLang = result.trello2md_lang;
            }
            initializeApp();
        });
    } else {
        try {
            const saved = window.localStorage.getItem('trello2md_lang');
            if (saved) currentLang = saved;
        } catch (e) {}
        initializeApp();
    }

    function initializeApp() {
        if (langSelect) {
            langSelect.value = currentLang;
        }
        updateUILanguage();
        startDataFetch();
    }

    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            currentLang = e.target.value;
            if (hasChromeStorage) {
                chrome.storage.local.set({ trello2md_lang: currentLang });
            } else {
                try { window.localStorage.setItem('trello2md_lang', currentLang); } catch (e) {}
            }
            updateUILanguage();
            if (fetchedData) {
                updateMarkdown();
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
        
        // Update status message dynamically if we have data
        if (fetchedData) {
            statusMessage.textContent = fetchedData.name || t('statusExtSuccess');
            statusMessage.style.color = 'var(--text-muted)';
        }
    }

    function startDataFetch() {
        // Safe check for tabs
        if (typeof chrome === 'undefined' || !chrome.tabs) {
            showError('Rozšíření nebylo načteno jako Chrome Extension.');
            return;
        }

        // 1. Get current tab URL
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs || tabs.length === 0) {
                showError(t('errTab'));
                return;
            }
            const url = tabs[0].url;
            
            // 2. Check if it's a Trello board or card
            if (!url.startsWith('https://trello.com/b/') && !url.startsWith('https://trello.com/c/')) {
                showError(t('statusExtErrorUrl'));
                return;
            }

            // 3. Clean URL and fetch JSON
            let cleanUrl = url.split('?')[0].split('#')[0];
            // Ensure no trailing slash
            if (cleanUrl.endsWith('/')) {
                cleanUrl = cleanUrl.slice(0, -1);
            }

            const fetchUrl = cleanUrl + '.json';
            statusMessage.textContent = t('statusExtFetching');
            statusMessage.style.color = 'var(--text-muted)';

            fetch(fetchUrl)
                .then(res => {
                    if (!res.ok) throw new Error('Network response was not ok');
                    return res.json();
                })
                .then(data => {
                    fetchedData = data;
                    
                    // Set default filename based on URL
                    const nameSlug = cleanUrl.split('/').pop() || 'export';
                    currentFileName = `${nameSlug}.md`;

                    statusMessage.textContent = data.name || t('statusExtSuccess');
                    statusMessage.style.color = 'var(--text-muted)';
                    loading.classList.add('hidden');
                    mainUi.classList.remove('hidden');

                    // Generate markdown
                    updateMarkdown();
                })
                .catch(err => {
                    console.error(err);
                    showError(t('statusExtErrorFetch'));
                });
        });
    }

    function showError(msg) {
        statusMessage.textContent = msg;
        statusMessage.style.color = '#ff6b6b';
        loading.classList.add('hidden');
    }

    [includeArchived, includeComments, includeChecklists, includeCompletedItems].forEach(cb => {
        cb.addEventListener('change', updateMarkdown);
    });

    function updateMarkdown() {
        if (!fetchedData) return;
        currentMarkdown = processTrelloData(fetchedData);
    }

    // Buttons
    btnCopy.addEventListener('click', () => {
        if (!currentMarkdown) return;
        navigator.clipboard.writeText(currentMarkdown).then(() => {
            const originalText = btnCopy.textContent;
            btnCopy.textContent = t('copied');
            setTimeout(() => {
                // If language changed during timeout, reset dynamically
                btnCopy.textContent = t('btnCopy');
            }, 2000);
        });
    });

    btnDownload.addEventListener('click', () => {
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

    // The parsing logic reused
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

        return md;
    }
});
