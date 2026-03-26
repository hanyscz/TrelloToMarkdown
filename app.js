document.addEventListener('DOMContentLoaded', () => {
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
    let currentMarkdown = '';

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
            alert('Prosím vyberte platný .json soubor exportovaný z Trella.');
            return;
        }

        currentFileName = file.name.replace('.json', '.md');
        fileNameDisplay.textContent = `Vybraný soubor: ${file.name}`;
        fileNameDisplay.classList.remove('hidden');
        
        const reader = new FileReader();
        
        reader.onloadstart = () => {
            loadingOverlay.classList.remove('hidden');
        };
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                window.lastTrelloData = data; // Save for re-processing when settings change
                processTrelloData(data);
            } catch (error) {
                console.error("Error parsing JSON:", error);
                alert('Chyba při parsování JSON souboru. Zkontrolujte, zda se jedná o platný export z aplikace Trello.');
            } finally {
                loadingOverlay.classList.add('hidden');
            }
        };

        reader.onerror = () => {
            loadingOverlay.classList.add('hidden');
            alert('Chyba při čtení souboru.');
        };

        reader.readAsText(file);
    }

    function processTrelloData(data) {
        const boardName = data.name || 'Trello Export';
        let md = `# ${boardName}\n\n`;

        // Check if this is a single card export or a full board export
        const isSingleCard = !data.cards && !data.lists && data.idBoard;
        
        let cardsToProcess = [];
        let listsToProcess = [];
        
        if (isSingleCard) {
            cardsToProcess = [data]; // The JSON root is the card
            // Create a fake list to group it
            listsToProcess = [{ id: data.idList || 'list1', name: 'Exportovaná karta', closed: false }];
        } else {
            cardsToProcess = data.cards || [];
            listsToProcess = data.lists || [];
        }

        // Maps to quickly find objects by ID
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
        
        // Group actions by card ID for comments
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

        // Filter and group cards by list ID
        const cardsByList = new Map();
        cardsToProcess.forEach(card => {
            // Both card and list checking for archived status
            if (card.closed && !includeArchived.checked) return;
            
            const listId = card.idList || 'list1';
            if (!cardsByList.has(listId)) {
                cardsByList.set(listId, []);
            }
            cardsByList.get(listId).push(card);
        });

        // Generate Markdown content by iterating over lists
        listsToProcess.forEach(list => {
            // Skip closed lists if user doesn't want archived items
            if (list.closed && !includeArchived.checked) return;

            const listCards = cardsByList.get(list.id) || [];
            // Skip tracking lists without cards
            if (listCards.length === 0) return;

            if (!isSingleCard) {
                md += `## ${list.name}\n\n`;
            }

            // Sort cards by their relative position
            listCards.sort((a, b) => (a.pos || 0) - (b.pos || 0));

            listCards.forEach(card => {
                if (!isSingleCard) {
                    md += `### ${card.name}\n\n`;
                }
                
                // Labels
                if (card.labels && card.labels.length > 0) {
                    const labelNames = card.labels.map(l => l.name || l.color).filter(Boolean);
                    if (labelNames.length > 0) {
                        md += `**Štítky:** ${labelNames.join(', ')}\n\n`;
                    }
                }

                // Description
                if (card.desc) {
                    md += `${card.desc}\n\n`;
                }

                // Checklists
                if (includeChecklists.checked && card.idChecklists && card.idChecklists.length > 0) {
                    card.idChecklists.forEach(clId => {
                        const cl = checklistsMap.get(clId);
                        if (cl) {
                            md += `**${cl.name}**\n`;
                            if (cl.checkItems && cl.checkItems.length > 0) {
                                // Sort items by position
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

                // Comments
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
                    md += `---\n\n`; // Separator between cards
                }
            });
        });

        // Output to text area
        currentMarkdown = md;
        markdownOutput.value = md;
        downloadBtn.disabled = false;
    }

    // Trigger download of the generated Markdown file
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
