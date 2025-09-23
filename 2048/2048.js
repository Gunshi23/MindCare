document.addEventListener('DOMContentLoaded', () => {
            const gameBoardEl = document.getElementById('gameBoard');
            const scoreEl = document.getElementById('score');
            const overlayEl = document.getElementById('gameOverlay');
            const overlayTextEl = document.getElementById('overlayText');
            const newGameBtn = document.getElementById('newGameBtn');
            const resetBtn = document.getElementById('resetBtn');
            const themeToggle = document.getElementById('theme-toggle');
            const body = document.body;

            const gridSize = 4;
            let board = [];
            let score = 0;
            let isGameOver = false;

            const tileColors = {
                2: '#eee4da',
                4: '#ede0c8',
                8: '#f2b179',
                16: '#f59563',
                32: '#f67c5f',
                64: '#f65e3b',
                128: '#edcf72',
                256: '#edc850',
                512: '#edc53f',
                1024: '#edc22e',
                2048: '#edc22e',
                'beyond': '#3c3a32'
            };
            
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                body.classList.add(savedTheme);
                if (savedTheme === 'dark-mode') {
                    themeToggle.querySelector('.material-icons').textContent = 'light_mode';
                }
            }

            themeToggle.addEventListener('click', () => {
                body.classList.toggle('dark-mode');
                localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode');
                themeToggle.querySelector('.material-icons').textContent = body.classList.contains('dark-mode') ? 'light_mode' : 'brightness_2';
                // Redraw board with new colors
                drawBoard();
            });

            function showModal(title, message) {
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
                setTimeout(() => modal.remove(), 3000);
            }

            function createBoard() {
                board = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
                score = 0;
                isGameOver = false;
                overlayEl.classList.remove('active');
                updateScore();
                
                addRandomTile();
                addRandomTile();
                drawBoard();
            }

            function updateScore() {
                scoreEl.textContent = score;
            }

            function addRandomTile() {
                const emptyCells = [];
                for (let r = 0; r < gridSize; r++) {
                    for (let c = 0; c < gridSize; c++) {
                        if (board[r][c] === 0) {
                            emptyCells.push({ r, c });
                        }
                    }
                }
                
                if (emptyCells.length > 0) {
                    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                    board[randomCell.r][randomCell.c] = Math.random() < 0.9 ? 2 : 4;
                }
            }

            function drawBoard() {
                gameBoardEl.innerHTML = '';
                for (let r = 0; r < gridSize; r++) {
                    for (let c = 0; c < gridSize; c++) {
                        const cell = document.createElement('div');
                        cell.classList.add('tile-cell');
                        gameBoardEl.appendChild(cell);

                        const tileValue = board[r][c];
                        if (tileValue !== 0) {
                            const tile = document.createElement('div');
                            let tileClass = `tile-${tileValue}`;
                            let tileColor = tileColors[tileValue] || tileColors['beyond'];
                            
                            if (tileValue > 2048) {
                                tileClass = 'tile-beyond';
                                tileColor = tileColors['beyond'];
                            }
                            
                            tile.classList.add('tile', tileClass);
                            tile.textContent = tileValue;
                            tile.style.background = tileColor;
                            cell.appendChild(tile);
                        }
                    }
                }
            }

            function slideRow(row) {
                // Remove zeros
                let newRow = row.filter(val => val !== 0);
                // Combine identical tiles
                for (let i = 0; i < newRow.length - 1; i++) {
                    if (newRow[i] === newRow[i + 1]) {
                        newRow[i] *= 2;
                        score += newRow[i];
                        newRow.splice(i + 1, 1);
                        newRow.push(0);
                    }
                }
                // Fill with zeros
                while (newRow.length < gridSize) {
                    newRow.push(0);
                }
                return newRow;
            }

            function slideLeft() {
                let moved = false;
                const oldBoard = JSON.stringify(board);
                for (let r = 0; r < gridSize; r++) {
                    board[r] = slideRow(board[r]);
                }
                if (JSON.stringify(oldBoard) !== JSON.stringify(board)) {
                    moved = true;
                }
                return moved;
            }
            
            function slideRight() {
                let moved = false;
                const oldBoard = JSON.stringify(board);
                for (let r = 0; r < gridSize; r++) {
                    const reversedRow = board[r].reverse();
                    const newRow = slideRow(reversedRow).reverse();
                    board[r] = newRow;
                }
                if (JSON.stringify(oldBoard) !== JSON.stringify(board)) {
                    moved = true;
                }
                return moved;
            }
            
            function slideUp() {
                let moved = false;
                const oldBoard = JSON.stringify(board);
                const tempBoard = transpose(board);
                for (let c = 0; c < gridSize; c++) {
                    tempBoard[c] = slideRow(tempBoard[c]);
                }
                board = transpose(tempBoard);
                if (JSON.stringify(oldBoard) !== JSON.stringify(board)) {
                    moved = true;
                }
                return moved;
            }
            
            function slideDown() {
                let moved = false;
                const oldBoard = JSON.stringify(board);
                const tempBoard = transpose(board);
                for (let c = 0; c < gridSize; c++) {
                    const reversedCol = tempBoard[c].reverse();
                    const newCol = slideRow(reversedCol).reverse();
                    tempBoard[c] = newCol;
                }
                board = transpose(tempBoard);
                if (JSON.stringify(oldBoard) !== JSON.stringify(board)) {
                    moved = true;
                }
                return moved;
            }
            
            function transpose(matrix) {
                return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
            }

            function checkWin() {
                for (let r = 0; r < gridSize; r++) {
                    for (let c = 0; c < gridSize; c++) {
                        if (board[r][c] === 2048) {
                            showOverlay("You Win!");
                            return;
                        }
                    }
                }
            }

            function checkLoss() {
                if (isFull() && !hasMoves()) {
                    showOverlay("Game Over!");
                }
            }

            function isFull() {
                for (let r = 0; r < gridSize; r++) {
                    for (let c = 0; c < gridSize; c++) {
                        if (board[r][c] === 0) {
                            return false;
                        }
                    }
                }
                return true;
            }

            function hasMoves() {
                for (let r = 0; r < gridSize; r++) {
                    for (let c = 0; c < gridSize; c++) {
                        const current = board[r][c];
                        if (
                            (r > 0 && board[r - 1][c] === current) ||
                            (r < gridSize - 1 && board[r + 1][c] === current) ||
                            (c > 0 && board[r][c - 1] === current) ||
                            (c < gridSize - 1 && board[r][c + 1] === current)
                        ) {
                            return true;
                        }
                    }
                }
                return false;
            }

            function showOverlay(message) {
                overlayTextEl.textContent = message;
                overlayEl.classList.add('active');
                isGameOver = true;
            }
            
            function handleMove(moved) {
                if (moved) {
                    addRandomTile();
                    drawBoard();
                    updateScore();
                    checkWin();
                    checkLoss();
                }
            }

            document.addEventListener('keyup', (event) => {
                if (isGameOver) return;
                
                let moved = false;
                switch (event.key) {
                    case 'ArrowLeft':
                        moved = slideLeft();
                        break;
                    case 'ArrowRight':
                        moved = slideRight();
                        break;
                    case 'ArrowUp':
                        moved = slideUp();
                        break;
                    case 'ArrowDown':
                        moved = slideDown();
                        break;
                    default:
                        return;
                }
                event.preventDefault();
                handleMove(moved);
            });
            
            let touchStartX = 0;
            let touchStartY = 0;
            
            document.addEventListener('touchstart', (event) => {
                if (isGameOver) return;
                touchStartX = event.touches[0].clientX;
                touchStartY = event.touches[0].clientY;
            }, { passive: false });
            
            document.addEventListener('touchend', (event) => {
                if (isGameOver) return;
                let moved = false;
                const touchEndX = event.changedTouches[0].clientX;
                const touchEndY = event.changedTouches[0].clientY;
                const dx = touchEndX - touchStartX;
                const dy = touchEndY - touchStartY;

                if (Math.abs(dx) > Math.abs(dy)) {
                    if (dx > 0) {
                        moved = slideRight();
                    } else {
                        moved = slideLeft();
                    }
                } else {
                    if (dy > 0) {
                        moved = slideDown();
                    } else {
                        moved = slideUp();
                    }
                }
                
                handleMove(moved);
            }, { passive: false });
            
            newGameBtn.addEventListener('click', createBoard);
            resetBtn.addEventListener('click', createBoard);
            
            createBoard();
        });