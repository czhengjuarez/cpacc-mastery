// Admin page JavaScript for managing flashcards

const API_URL = '/api/flashcards';
const form = document.getElementById('add-card-form');
const messageDiv = document.getElementById('message');
const cardsList = document.getElementById('cards-list');

// Edit modal elements
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-card-form');
const editCardId = document.getElementById('edit-card-id');
const editTerm = document.getElementById('edit-term');
const editDefinition = document.getElementById('edit-definition');
const editMessage = document.getElementById('edit-message');
const closeModalBtn = document.getElementById('close-modal');
const cancelEditBtn = document.getElementById('cancel-edit');

// Store all cards for editing
let allCards = [];

// Display cards in the list
function displayCards(cards) {
    if (cards.length === 0) {
        cardsList.innerHTML = '<p class="text-gray-500">No cards yet. Add your first card above!</p>';
        return;
    }

    cardsList.innerHTML = cards.map(card => `
        <div class="border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors">
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-gray-900">${escapeHtml(card.term)}</h3>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-500">ID: ${card.card_id}</span>
                    <button 
                        onclick="editCard(${card.card_id})"
                        class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        title="Edit card"
                    >
                        Edit
                    </button>
                    <button 
                        onclick="deleteCard(${card.card_id})"
                        class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        title="Delete card"
                    >
                        Delete
                    </button>
                </div>
            </div>
            <p class="text-gray-700">${escapeHtml(card.definition)}</p>
        </div>
    `).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show message (success or error)
function showMessage(text, isError = false) {
    messageDiv.textContent = text;
    messageDiv.className = `mt-4 p-4 rounded-lg ${isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`;
    messageDiv.classList.remove('hidden');
    
    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 5000);
}

// Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const term = document.getElementById('term').value.trim();
    const definition = document.getElementById('definition').value.trim();
    
    if (!term || !definition) {
        showMessage('Please fill in both fields', true);
        return;
    }
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ term, definition })
        });
        
        if (!response.ok) {
            throw new Error('Failed to add card');
        }
        
        const result = await response.json();
        showMessage(`Card added successfully! ID: ${result.card_id}`);
        
        // Clear form
        form.reset();
        
        // Reload cards list
        loadCards();
        
    } catch (error) {
        showMessage(`Error: ${error.message}`, true);
    }
});

// Load and display existing cards
async function loadCards() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Failed to load cards');
        }
        allCards = await response.json();
        displayCards(allCards);
    } catch (error) {
        cardsList.innerHTML = `<p class="text-red-600">Error loading cards: ${error.message}</p>`;
    }
}

function editCard(cardId) {
    const card = allCards.find(c => c.card_id === cardId);
    if (!card) return;
    
    editCardId.value = card.card_id;
    editTerm.value = card.term;
    editDefinition.value = card.definition;
    editModal.classList.remove('hidden');
}

// Close modal
function closeModal() {
    editModal.classList.add('hidden');
    editForm.reset();
    editMessage.classList.add('hidden');
}

closeModalBtn.addEventListener('click', closeModal);
cancelEditBtn.addEventListener('click', closeModal);

// Close modal on outside click
editModal.addEventListener('click', (e) => {
    if (e.target === editModal) {
        closeModal();
    }
});

// Handle edit form submission
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const cardId = parseInt(editCardId.value);
    const term = editTerm.value.trim();
    const definition = editDefinition.value.trim();
    
    if (!term || !definition) {
        showEditMessage('Please fill in both fields', true);
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${cardId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ term, definition })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update card');
        }
        
        showEditMessage('Card updated successfully!');
        
        setTimeout(() => {
            closeModal();
            loadCards();
        }, 1500);
        
    } catch (error) {
        showEditMessage(`Error: ${error.message}`, true);
    }
});

// Show message in edit modal
function showEditMessage(text, isError = false) {
    editMessage.textContent = text;
    editMessage.className = `mt-4 p-4 rounded-lg ${isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`;
    editMessage.classList.remove('hidden');
}

// Delete card with confirmation
async function deleteCard(cardId) {
    const card = allCards.find(c => c.card_id === cardId);
    if (!card) return;
    
    if (!confirm(`Are you sure you want to delete this card?\n\nTerm: ${card.term}`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${cardId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete card');
        }
        
        showMessage(`Card deleted successfully!`);
        loadCards();
        
    } catch (error) {
        showMessage(`Error: ${error.message}`, true);
    }
}

// Load cards on page load
loadCards();
