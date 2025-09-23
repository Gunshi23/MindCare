function toggleTheme() {
            const body = document.body;
            const toggle = document.querySelector('.mode-toggle');
            if (body.getAttribute('data-theme') === 'light') {
                body.setAttribute('data-theme', 'dark');
                toggle.textContent = '🌙';
            } else {
                body.setAttribute('data-theme', 'light');
                toggle.textContent = '☀️';
            }
        }