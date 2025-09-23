document.addEventListener('DOMContentLoaded', () => {
            const breathingCircle = document.getElementById('breathingCircle');
            const breathingText = document.getElementById('breathingText');
            const startBreathingBtn = document.getElementById('startBreathingBtn');
            const themeToggle = document.getElementById('theme-toggle');
            const body = document.body;

            let isBreathingActive = false;
            let breathingInterval;

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

            const phases = [
                { text: 'Breathe In', duration: 4000, class: 'breathe-in' },
                { text: 'Hold', duration: 7000, class: 'hold' },
                { text: 'Breathe Out', duration: 8000, class: 'breathe-out' }
            ];
            let currentPhaseIndex = 0;
            let cycleCount = 0;
            const maxCycles = 4;

            function performBreathingCycle() {
                if (!isBreathingActive) return;

                const currentPhase = phases[currentPhaseIndex];
                breathingText.textContent = currentPhase.text;

                breathingCircle.classList.remove('breathe-in', 'hold', 'breathe-out');

                // A minimal delay is necessary to force a reflow and re-apply the transition
                setTimeout(() => {
                    breathingCircle.classList.add(currentPhase.class);
                    // Dynamically set transition duration
                    breathingCircle.style.transitionDuration = `${currentPhase.duration / 1000}s`;
                }, 10);

                breathingInterval = setTimeout(() => {
                    currentPhaseIndex++;
                    if (currentPhaseIndex < phases.length) {
                        performBreathingCycle();
                    } else {
                        currentPhaseIndex = 0;
                        cycleCount++;
                        if (cycleCount < maxCycles) {
                            performBreathingCycle();
                        } else {
                            stopBreathing();
                            breathingText.textContent = 'Complete!';
                            setTimeout(() => {
                                breathingText.textContent = '';
                                breathingCircle.style.transitionDuration = '0s'; // Reset transition
                            }, 2000);
                        }
                    }
                }, currentPhase.duration);
            }

            function startBreathing() {
                if (isBreathingActive) return;
                isBreathingActive = true;
                startBreathingBtn.textContent = 'Stop Breathing';
                startBreathingBtn.style.backgroundColor = '#d32f2f'; // A darker red for 'Stop'
                currentPhaseIndex = 0;
                cycleCount = 0;
                performBreathingCycle();
            }

            function stopBreathing() {
                if (!isBreathingActive) return; // Prevent stopping when not active
                isBreathingActive = false;
                clearTimeout(breathingInterval);
                breathingCircle.classList.remove('breathe-in', 'hold', 'breathe-out');
                breathingText.textContent = '';
                startBreathingBtn.textContent = 'Start Breathing';
                // Reset button color
                startBreathingBtn.style.backgroundColor = ''; 
                // Reset transition duration to ensure it doesn't jump
                breathingCircle.style.transitionDuration = '0.3s';
                breathingCircle.style.transform = 'scale(1)';
            }
            
            startBreathingBtn.addEventListener('click', () => {
                if (isBreathingActive) {
                    stopBreathing();
                } else {
                    startBreathing();
                }
            });

            // --- Daily Content Logic ---
            const affirmations = [
                "I am in control of my feelings and my responses.",
                "Every breath I take fills me with calm.",
                "I release all stress and welcome peace.",
                "I am strong, resilient, and capable.",
                "I am worthy of peace and happiness."
            ];

            const thoughts = [
                "The present moment is the only one you truly have.",
                "Your mind is a garden; your thoughts are the seeds.",
                "The only way to do great work is to love what you do.",
                "Change happens one breath at a time.",
                "Be gentle with yourself. You are doing the best you can."
            ];

            const wellnessTips = [
                "Stay hydrated! Drink a glass of water right now.",
                "Take a 5-minute walk outside to get fresh air.",
                "Stretch your body for a minute to release tension.",
                "Listen to your favorite calming song.",
                "Write down one thing you are grateful for today."
            ];
            
            const positives = [
                "The sun is shining.",
                "A good cup of tea or coffee.",
                "Your favorite song came on shuffle.",
                "A moment of quiet solitude.",
                "Someone smiled at you today.",
                "You learned something new.",
                "You helped someone out.",
                "You took a moment to breathe deeply."
            ];

            function getRandomItem(array) {
                return array[Math.floor(Math.random() * array.length)];
            }
            
            function displayDailyContent() {
                document.getElementById('daily-affirmation').textContent = getRandomItem(affirmations);
                document.getElementById('daily-thought').textContent = getRandomItem(thoughts);
                document.getElementById('daily-wellness').textContent = getRandomItem(wellnessTips);
                document.getElementById('daily-positive').textContent = getRandomItem(positives);
            }
            
            displayDailyContent();
        });