document.addEventListener('DOMContentLoaded', () => {
            const timerDisplay = document.getElementById('timerDisplay');
            const startBtn = document.getElementById('startBtn');
            const exerciseVideo = document.getElementById('exerciseVideo');
            const stretchList = document.getElementById('stretchList');
            const currentStretchName = document.getElementById('currentStretchName');
            const suggestedVideosSection = document.getElementById('suggestedVideosSection');
            const themeToggle = document.getElementById('theme-toggle');
            const body = document.body;
            
            let timerInterval;
            let totalTime = 600;
            let timeLeft = totalTime;
            let isRunning = false;
            let videoPlaying = false;

            const stretches = [
                { name: "Neck Rolls", duration: 60 },
                { name: "Shoulder Shrugs", duration: 60 },
                { name: "Cat-Cow Stretch", duration: 120 },
                { name: "Spinal Twist", duration: 120 },
                { name: "Wrist Stretches", duration: 60 }
            ];

            function formatTime(seconds) {
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = seconds % 60;
                return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
            }

            function updateUI() {
                timerDisplay.textContent = formatTime(timeLeft);
                
                if (isRunning) {
                    startBtn.innerHTML = `<span class="material-icons">pause</span> Pause`;
                    startBtn.classList.add('btn-secondary');
                } else {
                    startBtn.innerHTML = `<span class="material-icons">play_arrow</span> Start Exercise`;
                    startBtn.classList.remove('btn-secondary');
                }
                
                let accumulatedTime = 0;
                let foundStretch = false;
                for (let i = 0; i < stretches.length; i++) {
                    accumulatedTime += stretches[i].duration;
                    if (totalTime - timeLeft < accumulatedTime) {
                        currentStretchName.textContent = stretches[i].name;
                        highlightStretch(i);
                        foundStretch = true;
                        break;
                    }
                }
                if (!foundStretch && timeLeft > 0) {
                    currentStretchName.textContent = "Get ready!";
                    highlightStretch(-1);
                } else if (timeLeft <= 0) {
                    currentStretchName.textContent = "Exercise Complete!";
                    highlightStretch(-1);
                }
            }

            function highlightStretch(index) {
                const listItems = stretchList.querySelectorAll('li');
                listItems.forEach((item, idx) => {
                    item.classList.toggle('active-stretch', idx === index);
                });
            }

            function startTimer() {
                isRunning = true;
                if (!videoPlaying) {
                    exerciseVideo.play();
                }
                timerInterval = setInterval(() => {
                    timeLeft--;
                    updateUI();
                    if (timeLeft <= 0) {
                        clearInterval(timerInterval);
                        isRunning = false;
                        exerciseVideo.pause();
                        currentStretchName.textContent = "Exercise Complete!";
                        startBtn.innerHTML = `<span class="material-icons">replay</span> Start Over`;
                        startBtn.classList.remove('btn-secondary');
                        suggestedVideosSection.classList.add('active');
                    }
                }, 1000);
            }

            function pauseTimer() {
                isRunning = false;
                clearInterval(timerInterval);
                updateUI();
            }

            function toggleExercise() {
                if (timeLeft <= 0) {
                    resetExercise();
                } else if (isRunning) {
                    pauseTimer();
                    exerciseVideo.pause();
                } else {
                    startTimer();
                    exerciseVideo.play();
                }
            }
            
            function resetExercise() {
                exerciseVideo.currentTime = 0;
                exerciseVideo.pause();
                timeLeft = totalTime;
                isRunning = false;
                videoPlaying = false;
                currentStretchName.textContent = "Get ready!";
                suggestedVideosSection.classList.remove('active');
                updateUI();
                highlightStretch(-1);
            }

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
            
            startBtn.addEventListener('click', toggleExercise);

            exerciseVideo.addEventListener('play', () => {
                videoPlaying = true;
                if (!isRunning) { // Start timer if video is played by its own controls
                    startTimer();
                }
            });
            exerciseVideo.addEventListener('pause', () => {
                videoPlaying = false;
            });
            exerciseVideo.addEventListener('ended', () => {
                videoPlaying = false;
                // If video ends, but timer is still running, it will eventually end and show the suggested section.
                // We don't want to stop the timer here.
            });

            updateUI();
        });