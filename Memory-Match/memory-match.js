 document.addEventListener('DOMContentLoaded', () => {
            // Affirmations for the cards
            const affirmations = [
                "I am strong", "I am worthy", "I am kind", "I am enough",
                "I am capable", "I am calm", "I am loved", "I am creative",
                "I am focused", "I am resilient", "I am grateful", "I am happy"
            ];

            // DOM Elements
            const memoryGrid = document.getElementById('memoryGrid');
            const timerDisplay = document.getElementById('timerDisplay');
            const movesDisplay = document.getElementById('movesDisplay');
            const newGameBtn = document.getElementById('newGameBtn');
            const gameOverOverlay = document.getElementById('gameOverOverlay');
            const finalTime = document.getElementById('finalTime');
            const finalMoves = document.getElementById('finalMoves');
            const playAgainBtn = document.getElementById('playAgainBtn');
            const themeToggle = document.getElementById('theme-toggle');
            const body = document.body;

            // Game State Variables
            let shuffledCards = [];
            let flippedCards = [];
            let matchedPairs = 0;
            let moves = 0;
            let timerInterval;
            let seconds = 0;
            let gameLocked = false; // Prevents flipping more than two cards at once

            // --- Theme Toggle Logic ---
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                body.classList.add(savedTheme);
                if (savedTheme === 'dark-mode') {
                    themeToggle.querySelector('.material-icons').textContent = 'light_mode';
                }
            }
            themeToggle.addEventListener('click', () => {
                body.classList.toggle('dark-mode');
                // Save theme preference to local storage
                localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode');
                // Change icon based on current theme
                themeToggle.querySelector('.material-icons').textContent = body.classList.contains('dark-mode') ? 'light_mode' : 'brightness_2';
            });

            // --- Utility Functions ---
            function shuffle(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            }

            function formatTime(totalSeconds) {
                const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
                const secs = String(totalSeconds % 60).padStart(2, '0');
                return `${mins}:${secs}`;
            }
            
            // --- Modal Functions (Replacing alert) ---
            const showModal = (title, message) => {
                const existingModal = document.querySelector('.modal');
                if (existingModal) existingModal.remove();
                
                const modal = document.createElement('div');
                modal.className = 'modal';
                modal.innerHTML = `
                    <div class="modal-content">
                        <h3>${title}</h3>
                        <p>${message}</p>
                    </div>
                `;
                document.body.appendChild(modal);
                setTimeout(() => modal.remove(), 3000); // Auto-close after 3 seconds
            };

            // --- Game Functions ---
            function createBoard() {
                memoryGrid.innerHTML = ''; // Clear existing cards
                gameOverOverlay.classList.remove('active'); // Hide game over overlay
                
                // Duplicate affirmations to create pairs
                const gameAffirmations = [...affirmations, ...affirmations];
                shuffledCards = shuffle(gameAffirmations);

                shuffledCards.forEach((affirmation, index) => {
                    const card = document.createElement('div');
                    card.classList.add('memory-card');
                    card.dataset.index = index; // Store original index for debugging, not crucial for logic
                    card.dataset.affirmation = affirmation; // Store affirmation on the card for matching

                    const cardInner = document.createElement('div');
                    cardInner.classList.add('card-inner');

                    const cardBack = document.createElement('div');
                    cardBack.classList.add('card-back');
                    cardBack.innerHTML = '<span class="material-icons">favorite</span>'; // Icon for card back

                    const cardFront = document.createElement('div');
                    cardFront.classList.add('card-front');
                    cardFront.textContent = affirmation;

                    cardInner.appendChild(cardBack);
                    cardInner.appendChild(cardFront);
                    card.appendChild(cardInner);
                    memoryGrid.appendChild(card);

                    card.addEventListener('click', () => flipCard(card));
                });

                startTimer();
                resetGameStats();
            }

            function flipCard(card) {
                // Prevent flipping if game is locked (two cards already flipped)
                // or if the card is already flipped/matched
                if (gameLocked || card.classList.contains('flipped') || card.classList.contains('matched')) {
                    return;
                }

                card.classList.add('flipped');
                flippedCards.push(card);

                if (flippedCards.length === 2) {
                    moves++;
                    movesDisplay.textContent = moves;
                    gameLocked = true; // Lock the game to prevent more flips
                    setTimeout(checkForMatch, 1000); // Check for match after a short delay
                }
            }

            function checkForMatch() {
                const [card1, card2] = flippedCards;
                const affirmation1 = card1.dataset.affirmation;
                const affirmation2 = card2.dataset.affirmation;

                if (affirmation1 === affirmation2) {
                    // Cards match
                    card1.classList.add('matched');
                    card2.classList.add('matched');
                    matchedPairs++;
                    checkGameOver();
                } else {
                    // Cards don't match, flip them back
                    showModal("Oops!", "They don't match. Try again!");
                    card1.classList.remove('flipped');
                    card2.classList.remove('flipped');
                }

                flippedCards = []; // Reset flipped cards
                gameLocked = false; // Unlock the game
            }

            function checkGameOver() {
                // If all pairs are matched
                if (matchedPairs === affirmations.length) {
                    clearInterval(timerInterval); // Stop the timer
                    gameOverOverlay.classList.add('active'); // Show game over overlay
                    finalTime.textContent = `Time: ${formatTime(seconds)}`;
                    finalMoves.textContent = `Moves: ${moves}`;
                }
            }

            function startTimer() {
                clearInterval(timerInterval); // Clear any existing timer
                seconds = 0;
                timerDisplay.textContent = '00:00';
                timerInterval = setInterval(() => {
                    seconds++;
                    timerDisplay.textContent = formatTime(seconds);
                }, 1000);
            }

            function resetGameStats() {
                moves = 0;
                matchedPairs = 0;
                flippedCards = [];
                gameLocked = false;
                movesDisplay.textContent = moves;
            }

            // --- Event Listeners ---
            newGameBtn.addEventListener('click', createBoard);
            playAgainBtn.addEventListener('click', createBoard); // Play again button on overlay

            // Initial game board creation
            createBoard();
        });