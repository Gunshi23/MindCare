document.addEventListener('DOMContentLoaded', () => {
            const themeToggle = document.getElementById('theme-toggle');
            const body = document.body;
            const timerDisplay = document.getElementById('timerDisplay');
            const exerciseVideo = document.getElementById('exerciseVideo');
            const readingTimeInMinutes = 12;
            let totalTime = readingTimeInMinutes * 60;
            let timerInterval;

            function formatTime(seconds) {
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = seconds % 60;
                return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
            }

            timerDisplay.textContent = formatTime(totalTime);

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
            
            // Sync the timer to the video playback
            exerciseVideo.addEventListener('play', () => {
                let timeLeft = totalTime - Math.floor(exerciseVideo.currentTime);
                timerInterval = setInterval(() => {
                    timeLeft = totalTime - Math.floor(exerciseVideo.currentTime);
                    if (timeLeft < 0) timeLeft = 0;
                    timerDisplay.textContent = formatTime(timeLeft);
                }, 1000);
            });

            exerciseVideo.addEventListener('pause', () => {
                clearInterval(timerInterval);
            });

            exerciseVideo.addEventListener('ended', () => {
                clearInterval(timerInterval);
                timerDisplay.textContent = formatTime(0);
            });
        });