document.addEventListener('DOMContentLoaded', () => {
            const wordGridEl = document.getElementById('wordGrid');
            const wordListEl = document.getElementById('wordList');
            const timerDisplayEl = document.getElementById('timerDisplay');
            const foundCountEl = document.getElementById('foundCount');
            const totalWordsEl = document.getElementById('totalWords');
            const startButton = document.getElementById('startButton');
            const findButton = document.getElementById('findButton');
            const themeToggle = document.getElementById('theme-toggle');
            const body = document.body;

            // Words for the game
            const words = ["BREATH", "CALM", "PEACE", "MIND", "BODY", "YOGA", "NATURE", "HEALTH", "SLEEP", "FOCUS"];
            const gridSize = 12;
            let grid = [];
            let foundWords = [];
            let isDragging = false;
            let startCell = null;
            let timer;
            let seconds = 0;
            
            // --- Theme toggle functionality ---
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                body.classList.add(savedTheme);
                if (savedTheme === 'dark-mode') {
                    themeToggle.querySelector('.material-icons').textContent = 'light_mode';
                }
            }

            themeToggle.addEventListener('click', () => {
                if (body.classList.contains('dark-mode')) {
                    body.classList.remove('dark-mode');
                    localStorage.setItem('theme', 'light-mode');
                    themeToggle.querySelector('.material-icons').textContent = 'brightness_2';
                } else {
                    body.classList.add('dark-mode');
                    localStorage.setItem('theme', 'dark-mode');
                    themeToggle.querySelector('.material-icons').textContent = 'light_mode';
                }
            });

            // --- Modal functions (replacing alert) ---
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

            // --- Game Logic ---
            const getCoords = (cellId) => {
                const parts = cellId.split('-');
                return { row: parseInt(parts[1]), col: parseInt(parts[2]) };
            };

            const shuffleArray = (array) => {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            };

            const placeWord = (word) => {
                const directions = [
                    { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: -1 }
                ];
                const shuffledDirections = shuffleArray(directions);

                for (const dir of shuffledDirections) {
                    for (let attempts = 0; attempts < 100; attempts++) {
                        const row = Math.floor(Math.random() * gridSize);
                        const col = Math.floor(Math.random() * gridSize);
                        if (canPlaceWord(word, row, col, dir)) {
                            for (let i = 0; i < word.length; i++) {
                                grid[row + i * dir.row][col + i * dir.col] = word[i];
                            }
                            return true;
                        }
                    }
                }
                return false;
            };

            const canPlaceWord = (word, row, col, dir) => {
                for (let i = 0; i < word.length; i++) {
                    const newRow = row + i * dir.row;
                    const newCol = col + i * dir.col;
                    if (newRow >= gridSize || newRow < 0 || newCol >= gridSize || newCol < 0) {
                        return false;
                    }
                    if (grid[newRow][newCol] !== '' && grid[newRow][newCol] !== word[i]) {
                        return false;
                    }
                }
                return true;
            };

            const fillGrid = () => {
                const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                for (let r = 0; r < gridSize; r++) {
                    for (let c = 0; c < gridSize; c++) {
                        if (grid[r][c] === '') {
                            grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
                        }
                    }
                }
            };
            
            const buildDOM = () => {
                wordGridEl.innerHTML = '';
                wordGridEl.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
                
                for (let r = 0; r < gridSize; r++) {
                    for (let c = 0; c < gridSize; c++) {
                        const cell = document.createElement('div');
                        cell.id = `cell-${r}-${c}`;
                        cell.classList.add('grid-cell');
                        cell.textContent = grid[r][c];
                        wordGridEl.appendChild(cell);
                    }
                }
                wordListEl.innerHTML = '';
                words.forEach(word => {
                    const li = document.createElement('li');
                    li.classList.add('word-item');
                    li.id = `word-${word}`;
                    li.textContent = word;
                    wordListEl.appendChild(li);
                });
            };

            const checkSelection = (startCoords, endCoords) => {
                if (!startCoords || !endCoords) return;
                const selectedCells = getCellsBetween(startCoords, endCoords);
                if (selectedCells.length === 0) return;
                const selectedWord = selectedCells.map(cell => cell.textContent).join('');
                const reversedWord = selectedCells.slice().reverse().map(cell => cell.textContent).join('');
                
                let foundWord = null;
                if (words.includes(selectedWord) && !foundWords.includes(selectedWord)) {
                    foundWord = selectedWord;
                } else if (words.includes(reversedWord) && !foundWords.includes(reversedWord)) {
                    foundWord = reversedWord;
                }

                if (foundWord) {
                    foundWords.push(foundWord);
                    document.getElementById(`word-${foundWord}`).classList.add('found');
                    selectedCells.forEach(cell => cell.classList.remove('highlighted'));
                    selectedCells.forEach(cell => cell.classList.add('found'));
                    foundCountEl.textContent = foundWords.length;
                    
                    if (foundWords.length === words.length) {
                        clearInterval(timer);
                        showModal("Congratulations!", `You found all the words in ${timerDisplayEl.textContent}!`);
                        findButton.disabled = true;
                    }
                }
            };

            const getCellsBetween = (start, end) => {
                const cells = [];
                const dx = Math.sign(end.col - start.col);
                const dy = Math.sign(end.row - start.row);
                let x = start.col;
                let y = start.row;

                while (true) {
                    const cell = document.getElementById(`cell-${y}-${x}`);
                    if (cell) cells.push(cell);
                    if (x === end.col && y === end.row) break;
                    x += dx;
                    y += dy;
                }
                return cells;
            };

            const updateHighlight = (endCoords) => {
                if (!startCell) return;
                const startCoords = getCoords(startCell.id);
                document.querySelectorAll('.highlighted').forEach(cell => cell.classList.remove('highlighted'));
                const selectedCells = getCellsBetween(startCoords, endCoords);
                selectedCells.forEach(cell => cell.classList.add('highlighted'));
            };

            // --- Event Listeners ---
            wordGridEl.addEventListener('mousedown', (e) => {
                isDragging = true;
                startCell = e.target.closest('.grid-cell');
                if (startCell) startCell.classList.add('highlighted');
            });
            wordGridEl.addEventListener('mouseup', (e) => {
                isDragging = false;
                const endCell = e.target.closest('.grid-cell');
                if (startCell && endCell) checkSelection(getCoords(startCell.id), getCoords(endCell.id));
                document.querySelectorAll('.highlighted').forEach(cell => cell.classList.remove('highlighted'));
                startCell = null;
            });
            wordGridEl.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const endCell = e.target.closest('.grid-cell');
                if (endCell) updateHighlight(getCoords(endCell.id));
            });

            wordGridEl.addEventListener('touchstart', (e) => {
                e.preventDefault();
                isDragging = true;
                const touch = e.touches[0];
                const target = document.elementFromPoint(touch.clientX, touch.clientY);
                startCell = target ? target.closest('.grid-cell') : null;
                if (startCell) startCell.classList.add('highlighted');
            }, { passive: false });

            wordGridEl.addEventListener('touchmove', (e) => {
                e.preventDefault();
                if (!isDragging || !startCell) return;
                const touch = e.touches[0];
                const target = document.elementFromPoint(touch.clientX, touch.clientY);
                const endCell = target ? target.closest('.grid-cell') : null;
                if (endCell) updateHighlight(getCoords(endCell.id));
            }, { passive: false });

            wordGridEl.addEventListener('touchend', (e) => {
                e.preventDefault();
                isDragging = false;
                const endTouch = e.changedTouches[0];
                const endCell = document.elementFromPoint(endTouch.clientX, endTouch.clientY);
                if (startCell && endCell) checkSelection(getCoords(startCell.id), getCoords(endCell.id));
                document.querySelectorAll('.highlighted').forEach(cell => cell.classList.remove('highlighted'));
                startCell = null;
            });
            
            // --- Timer functions ---
            const startTimer = () => {
                seconds = 0;
                timer = setInterval(() => {
                    seconds++;
                    const minutes = Math.floor(seconds / 60);
                    const remainingSeconds = seconds % 60;
                    timerDisplayEl.textContent = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
                }, 1000);
            };

            const resetGame = () => {
                clearInterval(timer);
                seconds = 0;
                timerDisplayEl.textContent = "00:00";
                foundWords = [];
                foundCountEl.textContent = 0;
                totalWordsEl.textContent = words.length;
                
                grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
                shuffleArray(words).forEach(word => placeWord(word));
                fillGrid();
                buildDOM();
                
                startButton.textContent = "Restart Game";
                findButton.disabled = false;
            };

            findButton.addEventListener('click', () => {
                if (foundWords.length === words.length) return;
                const remainingWords = words.filter(word => !foundWords.includes(word));
                if (remainingWords.length > 0) {
                    const wordToFind = remainingWords[0];
                    let found = false;
                    for(let r = 0; r < gridSize; r++) {
                        for(let c = 0; c < gridSize; c++) {
                            const directions = [
                                { row: 0, col: 1, name: 'horizontal' },
                                { row: 1, col: 0, name: 'vertical' },
                                { row: 1, col: 1, name: 'diagonal-dr' },
                                { row: 1, col: -1, name: 'diagonal-dl' }
                            ];
                            for(const dir of directions) {
                                let match = true;
                                for(let i = 0; i < wordToFind.length; i++) {
                                    const newRow = r + i * dir.row;
                                    const newCol = c + i * dir.col;
                                    if (newRow < 0 || newRow >= gridSize || newCol < 0 || newCol >= gridSize || grid[newRow][newCol] !== wordToFind[i]) {
                                        match = false;
                                        break;
                                    }
                                }
                                if (match) {
                                    for(let i = 0; i < wordToFind.length; i++) {
                                        const newRow = r + i * dir.row;
                                        const newCol = c + i * dir.col;
                                        document.getElementById(`cell-${newRow}-${newCol}`).classList.add('found');
                                    }
                                    foundWords.push(wordToFind);
                                    document.getElementById(`word-${wordToFind}`).classList.add('found');
                                    foundCountEl.textContent = foundWords.length;

                                    if (foundWords.length === words.length) {
                                        clearInterval(timer);
                                        showModal("Congratulations!", `You found all the words!`);
                                        findButton.disabled = true;
                                    }
                                    found = true;
                                    break;
                                }
                            }
                            if (found) break;
                        }
                        if (found) break;
                    }
                }
            });

            startButton.addEventListener('click', () => {
                resetGame();
                startTimer();
            });

            resetGame();
            findButton.disabled = true;
        });