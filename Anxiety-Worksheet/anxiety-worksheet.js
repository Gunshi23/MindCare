document.addEventListener('DOMContentLoaded', () => {
            const steps = document.querySelectorAll('.step-content');
            const progressBar = document.getElementById('progressBar');
            const backBtn = document.getElementById('backBtn');
            const nextBtn = document.getElementById('nextBtn');
            const startOverBtn = document.getElementById('startOverBtn');
            const downloadBtn = document.getElementById('downloadBtn');
            const summaryTrigger = document.getElementById('summaryTrigger');
            const summarySymptoms = document.getElementById('summarySymptoms');
            const summaryThoughts = document.getElementById('summaryThoughts');
            const summaryCoping = document.getElementById('summaryCoping');
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
                downloadBtn.style.display = currentStep === totalSteps - 1 ? 'inline-block' : 'none';
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
                const triggerText = document.getElementById('trigger').value || 'Not entered.';
                const symptomsText = document.getElementById('symptoms').value || 'Not entered.';
                const thoughtsText = document.getElementById('thoughts').value || 'Not entered.';
                const copingStrategiesText = document.getElementById('copingStrategies').value || 'Not entered.';

                summaryTrigger.textContent = triggerText;
                summarySymptoms.textContent = symptomsText;
                summaryThoughts.textContent = thoughtsText;
                summaryCoping.textContent = copingStrategiesText;
            }

            function startOver() {
                currentStep = 0;
                document.getElementById('trigger').value = '';
                document.getElementById('symptoms').value = '';
                document.getElementById('thoughts').value = '';
                document.getElementById('copingStrategies').value = '';
                updateUI();
            }
            
            function downloadWorksheet() {
                window.print();
            }

            backBtn.addEventListener('click', showPrevStep);
            nextBtn.addEventListener('click', showNextStep);
            startOverBtn.addEventListener('click', startOver);
            downloadBtn.addEventListener('click', downloadWorksheet);
            
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