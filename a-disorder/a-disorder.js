document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const timerDisplay = document.getElementById('timerDisplay');
    const readingTimeInMinutes = 10;
    let totalTime = readingTimeInMinutes * 60; // Convert to seconds

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    timerDisplay.textContent = formatTime(totalTime);

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
});