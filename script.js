document.addEventListener('DOMContentLoaded', () => {
            const themeToggle = document.getElementById('theme-toggle');
            const body = document.body;
            const sections = document.querySelectorAll('section');

            function updateThemeToggleIcon(theme) {
                const icon = themeToggle.querySelector('i');
                if (theme === 'light-theme') {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                } else {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                }
            }

            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light-theme') {
                body.classList.add('light-theme');
                updateThemeToggleIcon('light-theme');
            } else {
                body.classList.add('dark-theme');
                updateThemeToggleIcon('dark-theme');
            }

            themeToggle.addEventListener('click', () => {
                if (body.classList.contains('light-theme')) {
                    body.classList.remove('light-theme');
                    body.classList.add('dark-theme');
                    localStorage.setItem('theme', 'dark-theme');
                    updateThemeToggleIcon('dark-theme');
                } else {
                    body.classList.remove('dark-theme');
                    body.classList.add('light-theme');
                    localStorage.setItem('theme', 'light-theme');
                    updateThemeToggleIcon('light-theme');
                }
            });

            const faqItems = document.querySelectorAll('.faq-item');
            faqItems.forEach(item => {
                item.addEventListener('click', () => {
                    const currentActive = document.querySelector('.faq-item.active');
                    if (currentActive && currentActive !== item) {
                        currentActive.classList.remove('active');
                    }
                    item.classList.toggle('active');
                });
            });

            // Scroll animations
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.2 // Trigger when 20% of the element is visible
            });

            sections.forEach(section => {
                observer.observe(section);
            });
        });