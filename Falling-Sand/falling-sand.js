document.addEventListener('DOMContentLoaded', () => {
            const canvas = document.getElementById('sandCanvas');
            const ctx = canvas.getContext('2d');
            const sandBtn = document.getElementById('sandBtn');
            const waterBtn = document.getElementById('waterBtn');
            const stoneBtn = document.getElementById('stoneBtn');
            const clearBtn = document.getElementById('clearBtn');
            const controls = document.querySelector('.controls');
            const themeToggle = document.getElementById('theme-toggle');
            const body = document.body;

            // Define grid and cell size
            const pixelSize = 4;
            let gridWidth, gridHeight;
            let grid = [];

            // Define material types
            const materials = {
                'empty': { id: 0, color: 'transparent' },
                'sand': { id: 1, color: '#f7d983' },
                'water': { id: 2, color: '#55aaff' },
                'stone': { id: 3, color: '#8c8c8c' }
            };

            let currentMaterial = materials.sand.id;
            let isDrawing = false;
            
            // --- Helper Functions ---
            const getComputedStyleValue = (variable) => getComputedStyle(document.documentElement).getPropertyValue(variable).trim();

            // Sets up the canvas and grid dimensions
            function resizeCanvas() {
                canvas.width = window.innerWidth * 0.9;
                canvas.height = window.innerHeight * 0.7;
                if (canvas.width > 800) canvas.width = 800;
                if (canvas.height > 600) canvas.height = 600;

                gridWidth = Math.floor(canvas.width / pixelSize);
                gridHeight = Math.floor(canvas.height / pixelSize);

                initGrid();
            }

            // Initializes the grid with empty cells
            function initGrid() {
                grid = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(materials.empty.id));
            }

            // Maps a material ID to its color
            function getColor(id) {
                for (const key in materials) {
                    if (materials[key].id === id) {
                        return materials[key].color;
                    }
                }
                return 'transparent';
            }

            // Adds material to the grid based on mouse position
            function paint(e) {
                if (!isDrawing) return;

                const rect = canvas.getBoundingClientRect();
                const mouseX = e.clientX || e.touches[0].clientX;
                const mouseY = e.clientY || e.touches[0].clientY;

                const gridX = Math.floor((mouseX - rect.left) / pixelSize);
                const gridY = Math.floor((mouseY - rect.top) / pixelSize);

                const brushSize = 5;
                for (let dx = -brushSize; dx <= brushSize; dx++) {
                    for (let dy = -brushSize; dy <= brushSize; dy++) {
                        const x = gridX + dx;
                        const y = gridY + dy;
                        if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight && Math.sqrt(dx*dx + dy*dy) <= brushSize) {
                             if (grid[y][x] === materials.empty.id) {
                                 grid[y][x] = currentMaterial;
                            }
                        }
                    }
                }
            }
            
            // Updates the grid based on simple physics rules
            function update() {
                // Iterate from bottom to top for correct simulation
                for (let y = gridHeight - 1; y >= 0; y--) {
                    for (let x = 0; x < gridWidth; x++) {
                        const cell = grid[y][x];

                        // Sand physics
                        if (cell === materials.sand.id) {
                            if (y + 1 < gridHeight && grid[y + 1][x] === materials.empty.id) {
                                grid[y + 1][x] = cell;
                                grid[y][x] = materials.empty.id;
                            } else if (y + 1 < gridHeight) {
                                // Fall diagonally if straight down is blocked
                                const direction = Math.random() < 0.5 ? -1 : 1;
                                if (x + direction >= 0 && x + direction < gridWidth && grid[y + 1][x + direction] === materials.empty.id) {
                                    grid[y + 1][x + direction] = cell;
                                    grid[y][x] = materials.empty.id;
                                }
                            }
                        }

                        // Water physics
                        if (cell === materials.water.id) {
                            if (y + 1 < gridHeight && grid[y + 1][x] === materials.empty.id) {
                                grid[y + 1][x] = cell;
                                grid[y][x] = materials.empty.id;
                            } else {
                                // Flow horizontally if straight down is blocked
                                const direction = Math.random() < 0.5 ? -1 : 1;
                                if (x + direction >= 0 && x + direction < gridWidth && grid[y][x + direction] === materials.empty.id) {
                                    grid[y][x + direction] = cell;
                                    grid[y][x] = materials.empty.id;
                                }
                            }
                        }
                    }
                }
            }

            // Draws the current state of the grid to the canvas
            function draw() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                for (let y = 0; y < gridHeight; y++) {
                    for (let x = 0; x < gridWidth; x++) {
                        const materialId = grid[y][x];
                        if (materialId !== materials.empty.id) {
                            ctx.fillStyle = getColor(materialId);
                            ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                        }
                    }
                }
            }

            // Main game loop
            function gameLoop() {
                update();
                draw();
                requestAnimationFrame(gameLoop);
            }

            // --- Event Listeners ---

            // Theme Toggle Logic
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
            });

            // Mouse and touch events for drawing
            canvas.addEventListener('mousedown', (e) => {
                isDrawing = true;
                paint(e);
            });
            canvas.addEventListener('mousemove', paint);
            canvas.addEventListener('mouseup', () => {
                isDrawing = false;
            });
            canvas.addEventListener('mouseout', () => {
                isDrawing = false;
            });
            
            canvas.addEventListener('touchstart', (e) => {
                isDrawing = true;
                e.preventDefault();
                paint(e);
            }, { passive: false });
            canvas.addEventListener('touchmove', (e) => {
                isDrawing = true;
                e.preventDefault();
                paint(e);
            }, { passive: false });
            canvas.addEventListener('touchend', () => {
                isDrawing = false;
            });

            // Button listeners to change the active material
            controls.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON' && e.target.id !== 'clearBtn') {
                    document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('selected'));
                    e.target.classList.add('selected');
                }
            });

            sandBtn.addEventListener('click', () => { currentMaterial = materials.sand.id; });
            waterBtn.addEventListener('click', () => { currentMaterial = materials.water.id; });
            stoneBtn.addEventListener('click', () => { currentMaterial = materials.stone.id; });
            clearBtn.addEventListener('click', () => { initGrid(); });
            
            // Initial setup
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
            gameLoop();
        });