document.addEventListener('DOMContentLoaded', () => {
            const steps = document.querySelectorAll('.step-content');
            const progressBar = document.getElementById('progressBar');
            const backBtn = document.getElementById('backBtn');
            const nextBtn = document.getElementById('nextBtn');
            const startOverBtn = document.getElementById('startOverBtn');
            const summaryOriginal = document.getElementById('summaryOriginal');
            const summaryReframed = document.getElementById('reframedText');
            const themeToggle = document.getElementById('theme-toggle');
            const body = document.body;
            
            let currentStep = 0;
            const totalSteps = steps.length;

            function updateUI() {
                steps.forEach((step, index) => {
                    step.classList.toggle('active', index === currentStep);
                });

                const progress = ((currentStep + 1) / totalSteps) * 100;
                progressBar.style.width = `${progress}%`;
                
                backBtn.style.display = currentStep > 0 && currentStep < totalSteps - 1 ? 'inline-block' : 'none';
                nextBtn.style.display = currentStep < totalSteps - 1 ? 'inline-block' : 'none';
                startOverBtn.style.display = currentStep === totalSteps - 1 ? 'inline-block' : 'none';
            }

            function showNextStep() {
                if (currentStep < totalSteps - 1) {
                    currentStep++;
                    if (currentStep === totalSteps - 1) { // Final step (summary)
                        generateSummary();
                    }
                    updateUI();
                }
            }

            function showPrevStep() {
                if (currentStep > 0) {
                    currentStep--;
                    updateUI();
                }
            }

            function generateSummary() {
                const thought = document.getElementById('thoughtText').value;
                const reframed = document.getElementById('reframedText').value;
                summaryOriginal.textContent = thought || 'No thought entered.';
                summaryReframed.textContent = reframed || 'No reframed thought entered.';
            }

            function startOver() {
                currentStep = 0;
                document.getElementById('thoughtText').value = '';
                document.getElementById('emotionText').value = '';
                document.getElementById('evidenceForText').value = '';
                document.getElementById('evidenceAgainstText').value = '';
                document.getElementById('reframedText').value = '';
                updateUI();
            }

            backBtn.addEventListener('click', showPrevStep);
            nextBtn.addEventListener('click', showNextStep);
            startOverBtn.addEventListener('click', startOver);
            
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

            updateUI();
        });