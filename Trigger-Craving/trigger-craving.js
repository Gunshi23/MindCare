 document.addEventListener('DOMContentLoaded', () => {
            const themeToggleBtn = document.getElementById('theme-toggle');
            const icon = themeToggleBtn.querySelector('span');
            const isDarkMode = localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

            if (isDarkMode) {
                document.documentElement.classList.add('dark');
                icon.textContent = 'light_mode';
            } else {
                document.documentElement.classList.remove('dark');
                icon.textContent = 'brightness_2';
            }

            themeToggleBtn.addEventListener('click', () => {
                const isCurrentlyDark = document.documentElement.classList.toggle('dark');
                localStorage.setItem('theme', isCurrentlyDark ? 'dark' : 'light');
                icon.textContent = isCurrentlyDark ? 'light_mode' : 'brightness_2';
            });
        });