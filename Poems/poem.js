 const themeToggle = document.getElementById('theme-toggle');
        const htmlElement = document.documentElement;
        const backToTopBtn = document.getElementById('back-to-top');
        const poemCards = document.querySelectorAll('.poem-card');
        const modalOverlay = document.getElementById('poem-modal');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const modalTitle = document.getElementById('modal-title');
        const modalAuthor = document.getElementById('modal-author');
        const modalImage = document.getElementById('modal-image');

        // Theme Toggle
        themeToggle.addEventListener('click', () => {
            if (htmlElement.classList.contains('dark')) {
                htmlElement.classList.remove('dark');
                htmlElement.classList.add('light');
            } else {
                htmlElement.classList.remove('light');
                htmlElement.classList.add('dark');
            }
        });

        // Open Modal
        poemCards.forEach(card => {
            card.addEventListener('click', () => {
                const title = card.getAttribute('data-poem-title');
                const author = card.getAttribute('data-poem-author');
                const imageSrc = card.getAttribute('data-image-src');
                
                modalTitle.textContent = title;
                modalAuthor.textContent = `By ${author}`;
                modalImage.src = imageSrc;
                
                modalOverlay.classList.add('open');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            });
        });

        // Close Modal
        closeModalBtn.addEventListener('click', () => {
            modalOverlay.classList.remove('open');
            document.body.style.overflow = 'auto'; // Restore scrolling
        });

        // Close Modal on backdrop click
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('open');
                document.body.style.overflow = 'auto'; // Restore scrolling
            }
        });

        // Back to Top Button Logic
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.remove('hidden');
            } else {
                backToTopBtn.classList.add('hidden');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });