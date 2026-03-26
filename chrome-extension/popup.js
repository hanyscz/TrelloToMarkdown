document.addEventListener('DOMContentLoaded', () => {
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

    // 1. Get current tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) {
            showError('Nelze zjistit aktuální tab.');
            return;
        }
        const url = tabs[0].url;
        
        // 2. Check if it's a Trello board or card
        if (!url.startsWith('https://trello.com/b/') && !url.startsWith('https://trello.com/c/')) {
            showError('Nejste na weu Trello nástěnky nebo karty.');
            return;
        }

        // 3. Clean URL and fetch JSON
        let cleanUrl = url.split('?')[0].split('#')[0];
        // Ensure no trailing slash
        if (cleanUrl.endsWith('/')) {
            cleanUrl = cleanUrl.slice(0, -1);
        }

        const fetchUrl = cleanUrl + '.json';
        statusMessage.textContent = 'Stahuji data z Trella...';

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

                statusMessage.textContent = data.name || 'Data úspěšně načtena';
                loading.classList.add('hidden');
                mainUi.classList.remove('hidden');

                // Generate markdown
                updateMarkdown();
            })
            .catch(err => {
                console.error(err);
                showError('Nepodařilo se stáhnout data. Jste přihlášeni?');
            });
    });

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
            btnCopy.textContent = 'Zkopírováno! ✓';
            setTimeout(() => btnCopy.textContent = originalText, 2000);
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
            listsToProcess = [{ id: data.idList || 'list1', name: 'Exportovaná karta', closed: false }];
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
                        member: action.memberCreator ? action.memberCreator.fullName : 'Neznámý',
                        date: new Date(action.date).toLocaleString('cs-CZ')
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
                        md += `**Štítky:** ${labelNames.join(', ')}\n\n`;
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
                        md += `#### Komentáře\n`;
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
