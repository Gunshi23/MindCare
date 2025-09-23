  document.addEventListener('DOMContentLoaded', () => {
            const themeToggle = document.getElementById('theme-toggle');
            const body = document.body;

            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                body.classList.add(savedTheme);
                // Update icon based on saved theme
                const icon = themeToggle.querySelector('.material-icons');
                icon.textContent = savedTheme === 'dark-mode' ? 'light_mode' : 'brightness_2';
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
        });

        // Function to simulate opening a game in a modal
        function openGame(gameName) {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <h3>Starting ${gameName}...</h3>
                    <p>This is a placeholder. In a full application, the game would load here!</p>
                    <button onclick="closeModal()">Close</button>
                </div>
            `;
            document.body.appendChild(modal);
        }

        // Function to close the modal
        function closeModal() {
            const modal = document.querySelector('.modal');
            if (modal) {
                modal.remove();
            }
        }