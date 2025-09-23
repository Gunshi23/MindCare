 document.addEventListener('DOMContentLoaded', () => {
            const canvas = document.getElementById('doodleCanvas');
            const ctx = canvas.getContext('2d');
            const colorPicker = document.getElementById('color-picker');
            const colorIndicator = document.getElementById('color-indicator');
            const brushSizeSlider = document.getElementById('brush-size');
            const undoBtn = document.getElementById('undo-btn');
            const redoBtn = document.getElementById('redo-btn');
            const clearBtn = document.getElementById('clear-btn');
            const downloadBtn = document.getElementById('download-btn');
            const themeToggle = document.getElementById('theme-toggle');
            const body = document.body;
            const inspirationText = document.getElementById('inspiration-text');

            // Theme toggle functionality
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

            // Canvas setup
            let drawing = false;
            let currentBrushColor = colorPicker.value;
            let currentBrushSize = brushSizeSlider.value;
            let history = [];
            let historyIndex = -1;

            // Resize canvas to fit its parent and handle responsiveness
            const resizeCanvas = () => {
                const parent = canvas.parentElement;
                const oldImageData = history[historyIndex] ? canvas.toDataURL() : null;
                
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
                
                if (oldImageData) {
                    const img = new Image();
                    img.onload = () => {
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    };
                    img.src = oldImageData;
                } else {
                    ctx.fillStyle = body.classList.contains('dark-mode') ? getComputedStyle(document.documentElement).getPropertyValue('--canvas-bg-light') : getComputedStyle(document.documentElement).getPropertyValue('--canvas-bg-light');
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            };

            window.addEventListener('resize', resizeCanvas);
            resizeCanvas(); // Initial resize

            const saveState = () => {
                history = history.slice(0, historyIndex + 1);
                history.push(canvas.toDataURL());
                historyIndex++;
            };

            const restoreState = () => {
                if (history[historyIndex]) {
                    const img = new Image();
                    img.onload = () => {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.fillStyle = body.classList.contains('dark-mode') ? getComputedStyle(document.documentElement).getPropertyValue('--canvas-bg-light') : getComputedStyle(document.documentElement).getPropertyValue('--canvas-bg-light');
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    };
                    img.src = history[historyIndex];
                }
            };

            saveState();

            const getCanvasCoordinates = (e) => {
                const rect = canvas.getBoundingClientRect();
                if (e.type.startsWith('touch')) {
                    const touch = e.touches[0];
                    return {
                        x: touch.clientX - rect.left,
                        y: touch.clientY - rect.top
                    };
                } else {
                    return {
                        x: e.offsetX,
                        y: e.offsetY
                    };
                }
            };

            const startDrawing = (e) => {
                drawing = true;
                const { x, y } = getCanvasCoordinates(e);
                ctx.beginPath();
                ctx.moveTo(x, y);
            };

            const draw = (e) => {
                if (!drawing) return;
                const { x, y } = getCanvasCoordinates(e);
                ctx.lineTo(x, y);
                ctx.strokeStyle = currentBrushColor;
                ctx.lineWidth = currentBrushSize;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();
            };

            const stopDrawing = () => {
                if (drawing) {
                    drawing = false;
                    ctx.closePath();
                    saveState();
                }
            };

            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('mouseout', stopDrawing);
            canvas.addEventListener('mousemove', draw);

            canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                startDrawing(e);
            }, { passive: false });
            canvas.addEventListener('touchend', stopDrawing);
            canvas.addEventListener('touchcancel', stopDrawing);
            canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                draw(e);
            }, { passive: false });

            colorPicker.addEventListener('input', (e) => {
                currentBrushColor = e.target.value;
                colorIndicator.style.backgroundColor = currentBrushColor;
            });

            colorIndicator.style.backgroundColor = currentBrushColor;

            brushSizeSlider.addEventListener('input', (e) => {
                currentBrushSize = e.target.value;
            });

            undoBtn.addEventListener('click', () => {
                if (historyIndex > 0) {
                    historyIndex--;
                    restoreState();
                }
            });

            redoBtn.addEventListener('click', () => {
                if (historyIndex < history.length - 1) {
                    historyIndex++;
                    restoreState();
                }
            });

            clearBtn.addEventListener('click', () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = body.classList.contains('dark-mode') ? getComputedStyle(document.documentElement).getPropertyValue('--canvas-bg-light') : getComputedStyle(document.documentElement).getPropertyValue('--canvas-bg-light');
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                saveState();
            });

            downloadBtn.addEventListener('click', () => {
                const link = document.createElement('a');
                link.download = 'my-doodle.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            });

            // --- Inspiration Content Logic ---
            const inspirationPrompts = [
                "Draw a galaxy inside a teacup.",
                "Sketch your favorite place to relax.",
                "Illustrate a feeling or emotion without using words.",
                "Draw a character made of geometric shapes.",
                "Create a doodle of what a peaceful sound looks like.",
                "Sketch a fantastical animal that doesn't exist.",
                "Draw a cityscape made of candy.",
                "Create a symmetrical pattern using only two colors."
            ];

            function getRandomItem(array) {
                return array[Math.floor(Math.random() * array.length)];
            }
            
            inspirationText.textContent = getRandomItem(inspirationPrompts);
        });