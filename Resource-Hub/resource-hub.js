const themeToggle = document.getElementById('theme-toggle');
        const sunIcon = document.getElementById('sun-icon');
        const moonIcon = document.getElementById('moon-icon');

        function setTheme(theme) {
            document.body.classList.toggle('dark', theme === 'dark');
            localStorage.setItem('theme', theme);
            sunIcon.style.display = theme === 'dark' ? 'block' : 'none';
            moonIcon.style.display = theme === 'dark' ? 'none' : 'block';
        }

        document.addEventListener('DOMContentLoaded', () => {
            const savedTheme = localStorage.getItem('theme');
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (savedTheme) {
                setTheme(savedTheme);
            } else if (prefersDark) {
                setTheme('dark');
            } else {
                setTheme('light');
            }
        });

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
            setTheme(currentTheme);
        });

        // The navigation functions are removed since this is a single-page app.
        // We can handle navigation with a more robust router in the future if needed.
        document.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault(); // Prevents the browser from navigating
                // Logic for handling clicks can be added here if needed,
                // for example, showing a modal or running some other script.
                console.log(`Link clicked: ${event.currentTarget.getAttribute('href')}`);
            });
        });