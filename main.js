// Flashcards data (loaded from API)
let flashcards = [];
let currentCardIndex = 0;
let timerInterval = null;
let startTime = null;
let correctCount = 0;
let practiceCount = 0;

// API Configuration (local JSON for now, can be replaced by Cloudflare Worker endpoint later)
const API_URL = 'flashcards.json';

// DOM elements
const flashcard = document.getElementById('flashcard');
const progressBarContainer = document.getElementById('progress-bar-container');
const progressBar = document.getElementById('progress-bar');
const cardCounter = document.getElementById('card-counter');
const termText = document.getElementById('term-text');
const definitionArea = document.getElementById('definition-area');
const timerDisplayContainer = document.getElementById('timer-display');
const definitionText = document.getElementById('definition-text');
const revealBtn = document.getElementById('reveal-btn');
const actionButtons = document.getElementById('action-buttons');
const gotItBtn = document.getElementById('got-it-btn');
const practiceBtn = document.getElementById('practice-btn');
const timerDisplay = document.getElementById('timer');
const flashcardContainer = document.querySelector('.flashcard-container');
const completionScreen = document.getElementById('completion-screen');
const correctCountDisplay = document.getElementById('correct-count');
const practiceCountDisplay = document.getElementById('practice-count');
const gaugeNeedle = document.getElementById('gauge-needle');
const scorePercentage = document.getElementById('score-percentage');
const scoreLabel = document.getElementById('score-label');

// Timer functions
function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 100);
}

function updateTimer() {
    if (!startTime) return;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    timerDisplay.textContent = timeString;
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function resetTimer() {
    stopTimer();
    startTime = null;
    timerDisplay.textContent = '0:00';
}

// Fetch flashcards from API
async function loadFlashcards() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Transform API data (from local JSON or remote Worker) to match our format
        flashcards = data.map(card => ({
            id: card.card_id,
            front: card.term,
            back: card.definition
        }));
        
        // Start showing cards once loaded
        if (flashcards.length > 0) {
            showCard(currentCardIndex);
        } else {
            termText.textContent = 'No flashcards available';
            definitionText.textContent = 'Please add some flashcards to get started';
        }
    } catch (error) {
        console.error('Error loading flashcards:', error);
        termText.textContent = 'Error loading flashcards';
        definitionText.textContent = 'Please check your connection and try again';
    }
}

// Update progress indicators
function updateProgress() {
    const currentCard = currentCardIndex + 1;
    const totalCards = flashcards.length;
    const progressPercentage = (currentCard / totalCards) * 100;
    
    // Update progress bar
    progressBar.style.width = `${progressPercentage}%`;
    
    // Update card counter
    cardCounter.textContent = `${currentCard} / ${totalCards}`;
}

// Display the current card
function showCard(index) {
    if (flashcards.length === 0) return;
    
    const card = flashcards[index];
    termText.textContent = card.front;
    definitionText.textContent = card.back;
    
    // Reset card to initial state (definition hidden, gray background with animation)
    definitionText.classList.add('hidden');
    revealBtn.classList.remove('hidden');
    actionButtons.classList.add('hidden');
    
    // Reset definition area to gray with skeleton animation
    definitionArea.classList.remove('bg-gray-800');
    definitionArea.classList.add('skeleton', 'bg-gray-200');
    
    // Reset text color to gray
    definitionText.classList.remove('text-white');
    definitionText.classList.add('text-gray-700');
    
    // Show timer again
    timerDisplayContainer.classList.remove('hidden');
    
    // Reset and start timer
    resetTimer();
    startTimer();
}

// Reveal the definition
function revealCard() {
    definitionText.classList.remove('hidden');
    revealBtn.classList.add('hidden');
    actionButtons.classList.remove('hidden');
    
    // Remove skeleton animation and change to dark gray background
    definitionArea.classList.remove('skeleton', 'bg-gray-200');
    definitionArea.classList.add('bg-gray-800');
    
    // Change text color to white
    definitionText.classList.remove('text-gray-700');
    definitionText.classList.add('text-white');
    
    // Hide timer when definition is revealed
    timerDisplayContainer.classList.add('hidden');
    
    // Update progress indicators when user reveals the card
    updateProgress();
}

// Show completion screen
function showCompletionScreen() {
    stopTimer();
    flashcardContainer.classList.add('hidden');
    completionScreen.classList.remove('hidden');
    correctCountDisplay.textContent = correctCount;
    practiceCountDisplay.textContent = practiceCount;
    
    // Calculate score percentage
    const totalCards = flashcards.length;
    const percentage = Math.round((correctCount / totalCards) * 100);
    scorePercentage.textContent = percentage;
    
    // Update score label based on percentage
    let label = '';
    if (percentage >= 96) {
        label = 'Excellent! Outstanding performance!';
    } else if (percentage >= 88) {
        label = 'Good! You\'re well prepared!';
    } else if (percentage >= 72) {
        label = 'Fair - Keep studying to reach 80%!';
    } else if (percentage >= 56) {
        label = 'Poor - More practice needed!';
    } else {
        label = 'Very Poor - Review the material!';
    }
    scoreLabel.textContent = label;
    
    // Animate gauge needle (0% = -90deg, 100% = 90deg)
    const targetAngle = -90 + (percentage * 1.8);
    let currentAngle = -90;
    const animationDuration = 1500;
    const startTime = Date.now();
    
    function animateNeedle() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        currentAngle = -90 + (targetAngle + 90) * easeProgress;
        gaugeNeedle.setAttribute('transform', `rotate(${currentAngle} 150 150)`);
        
        if (progress < 1) {
            requestAnimationFrame(animateNeedle);
        }
    }
    animateNeedle();
    
    // Fade out progress bar immediately
    progressBarContainer.style.opacity = '0';
    
    // Trigger confetti animation only if score >= 80%
    if (percentage >= 80) {
        const duration = 3000;
        const end = Date.now() + duration;
        
        (function frame() {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#000000', '#4B5563', '#6B7280']
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#000000', '#4B5563', '#6B7280']
            });
            
            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }
}

// Handle "Got it right" button
function handleGotIt() {
    correctCount++;
    
    // Move to next card or show completion
    if (currentCardIndex < flashcards.length - 1) {
        currentCardIndex++;
        showCard(currentCardIndex);
    } else {
        showCompletionScreen();
    }
}

// Handle "Needs practice" button
function handleNeedsPractice() {
    practiceCount++;
    
    // Move to next card or show completion
    if (currentCardIndex < flashcards.length - 1) {
        currentCardIndex++;
        showCard(currentCardIndex);
    } else {
        showCompletionScreen();
    }
}

// Event listeners
revealBtn.addEventListener('click', revealCard);
gotItBtn.addEventListener('click', handleGotIt);
practiceBtn.addEventListener('click', handleNeedsPractice);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
        // Use the reveal button visibility to determine whether the card is still hidden
        if (!revealBtn.classList.contains('hidden')) {
            revealCard();
            e.preventDefault();
        }
    }
});

// Initialize the app by loading flashcards from API
loadFlashcards();
