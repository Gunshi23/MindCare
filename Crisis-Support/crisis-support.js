document.addEventListener('DOMContentLoaded', () => {
            // Theme toggle
            const themeToggle = document.getElementById('theme-toggle');
            const body = document.body;
            const themeIcon = themeToggle.querySelector('.material-icons');

            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                body.classList.add(savedTheme);
                themeIcon.textContent = savedTheme === 'dark-mode' ? 'light_mode' : 'brightness_2';
            }

            themeToggle.addEventListener('click', () => {
                body.classList.toggle('dark-mode');
                const isDarkMode = body.classList.contains('dark-mode');
                localStorage.setItem('theme', isDarkMode ? 'dark-mode' : 'light-mode');
                themeIcon.textContent = isDarkMode ? 'light_mode' : 'brightness_2';
            });

            // Emergency Modal
            const emergencyBtn = document.getElementById('emergency-btn');
            const emergencyModal = document.getElementById('emergency-modal');
            const closeModalBtn = emergencyModal.querySelector('.close-btn');
            const cancelBtn = emergencyModal.querySelector('.modal-btn.cancel');

            emergencyBtn.addEventListener('click', () => {
                emergencyModal.classList.add('active');
            });

            closeModalBtn.addEventListener('click', () => {
                emergencyModal.classList.remove('active');
            });

            cancelBtn.addEventListener('click', () => {
                emergencyModal.classList.remove('active');
            });

            // Close modal when clicking outside
            window.addEventListener('click', (event) => {
                if (event.target === emergencyModal) {
                    emergencyModal.classList.remove('active');
                }
            });

            // Breathing exercise animation
            const breathingVisual = document.getElementById('breathing-visual');
            const startBreathingBtn = document.getElementById('start-breathing');
            let isBreathing = false;

            startBreathingBtn.addEventListener('click', () => {
                if (!isBreathing) {
                    breathingVisual.classList.add('active');
                    breathingVisual.innerHTML = '<small>Breathe in...</small>';
                    isBreathing = true;
                    // Simulate breathing cycle changes
                    setTimeout(() => {
                        breathingVisual.innerHTML = '<small>Hold...</small>';
                    }, 4000);
                    setTimeout(() => {
                        breathingVisual.innerHTML = '<small>Breathe out...</small>';
                    }, 8000);
                    setTimeout(() => {
                        breathingVisual.innerHTML = '<small>Breathing complete!</small>';
                        breathingVisual.classList.remove('active');
                        isBreathing = false;
                    }, 12000);
                }
            });

            // Grounding exercise functionality
            const startGroundingBtn = document.getElementById('start-grounding');
            const messageBox = document.getElementById('message-box');

            function showMessageBox(message) {
                messageBox.textContent = message;
                messageBox.classList.add('show');
                setTimeout(() => {
                    messageBox.classList.remove('show');
                }, 3000);
            }

            startGroundingBtn.addEventListener('click', () => {
                showMessageBox('Starting 5-4-3-2-1 Grounding Exercise. Focus on your senses.');
            });

            // New: Immediate Support toggle button
            const immediateToggleBtn = document.getElementById('immediate-toggle-btn');
            const immediateSection = document.getElementById('immediate-support-section');

            immediateToggleBtn.addEventListener('click', () => {
                const isHidden = immediateSection.classList.toggle('hidden');
                immediateToggleBtn.textContent = isHidden ? 'Show Immediate Support' : 'Hide Immediate Support';
            });

            // New: Regional Lines toggle button
            const regionalToggleBtn = document.getElementById('regional-toggle-btn');
            const regionalSection = document.getElementById('regional-lines-section');

            regionalToggleBtn.addEventListener('click', () => {
                const isHidden = regionalSection.classList.toggle('hidden');
                regionalToggleBtn.textContent = isHidden ? 'Show Regional Lines' : 'Hide Regional Lines';
            });

        });