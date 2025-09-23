 document.addEventListener('DOMContentLoaded', () => {
            const timerDisplay = document.getElementById('timerDisplay');
            const startBtn = document.getElementById('startBtn');
            const themeToggle = document.getElementById('theme-toggle');
            const body = document.body;

            const totalTime = 300; // 5 minutes in seconds
            let timeLeft = totalTime;
            let timerInterval;

            function formatTime(seconds) {
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = seconds % 60;
                return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
            }

            function startTimer() {
                if (timerInterval) return; // Prevent multiple timers
                startBtn.innerHTML = `<span class="material-icons">pause</span> Pause`;
                startBtn.classList.add('btn-secondary');

                timerInterval = setInterval(() => {
                    timeLeft--;
                    timerDisplay.textContent = formatTime(timeLeft);
                    if (timeLeft <= 0) {
                        clearInterval(timerInterval);
                        startBtn.innerHTML = `<span class="material-icons">replay</span> Replay`;
                        startBtn.classList.remove('btn-secondary');
                        timeLeft = totalTime;
                    }
                }, 1000);
            }

            function pauseTimer() {
                clearInterval(timerInterval);
                timerInterval = null; // Clear the timer ID
                startBtn.innerHTML = `<span class="material-icons">play_arrow</span> Start Exercise`;
                startBtn.classList.remove('btn-secondary');
            }

            function toggleTimer() {
                if (timerInterval) {
                    pauseTimer();
                } else {
                    startTimer();
                }
            }
            
            startBtn.addEventListener('click', toggleTimer);

            // Theme toggle functionality
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

            // Set initial display
            timerDisplay.textContent = formatTime(totalTime);
        });