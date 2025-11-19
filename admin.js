// Admin page JavaScript for managing flashcards

const API_URL = '/api/flashcards';
const form = document.getElementById('add-card-form');
const messageDiv = document.getElementById('message');
const cardsList = document.getElementById('cards-list');

// Load and display existing cards
async function loadCards() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Failed to load cards');
        }
        const cards = await response.json();
        displayCards(cards);
    } catch (error) {
        cardsList.innerHTML = `<p class="text-red-600">Error loading cards: ${error.message}</p>`;
    }
}

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
                <span class="text-sm text-gray-500">ID: ${card.card_id}</span>
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

// Load cards on page load
loadCards();
