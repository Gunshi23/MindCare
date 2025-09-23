const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;

themeToggleBtn.addEventListener('click', () => {
    if (body.classList.contains('light-theme')) {
        body.classList.replace('light-theme', 'dark-theme');
        themeToggleBtn.textContent = '☀️';
    } else {
        body.classList.replace('dark-theme', 'light-theme');
        themeToggleBtn.textContent = '🌙';
    }
});

const YT_API_KEY = "AIzaSyC-rcDq_vNOU3paiLb8oG7vCrj1LELEaxQ";
const YT_BASE_URL = "https://www.googleapis.com/youtube/v3/search";
const TOPICS_MAP = {
    "meditation": "guided meditation",
    "mental_health": "mental health podcasts",
    "instrumental_guitar": "relaxing guitar instrumental music",
    "instrumental_piano": "soothing piano instrumental music",
    "instrumental_flute": "calming flute instrumental music",
    "instrumental_violin": "violin instrumental relaxation",
    "mood_relax": "relaxing mood music playlist",
    "mood_calm": "calm mood music playlist",
    "mood_happy": "happy mood songs playlist",
    "mood_sad": "sad emotional music playlist",
    "nature_sea": "sea waves relaxation",
    "nature_birds": "birds chirping sounds",
    "nature_rain": "rain sounds for sleep",
    "nature_forest": "forest nature ambience"
};

// Load a default playlist on page load
document.addEventListener('DOMContentLoaded', () => {
    loadVideos('meditation');
});

async function loadVideos(topic) {
    const query = TOPICS_MAP[topic] || topic;
    const url = `${YT_BASE_URL}?part=snippet&q=${encodeURIComponent(query)}&key=${YT_API_KEY}&maxResults=6&type=video`;
    
    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        const container = document.getElementById("videos");
        container.innerHTML = "";
        
        data.items.forEach(v => {
            const card = document.createElement("div");
            card.className = "video-card";
            card.innerHTML = `
                <iframe src="https://www.youtube.com/embed/${v.id.videoId}"
                    title="${v.snippet.title}" frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
                </iframe>
                <h3>${v.snippet.title}</h3>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching videos:", error);
        const container = document.getElementById("videos");
        container.innerHTML = "<p style='text-align: center;'>Failed to load videos. Please check your API key or network connection.</p>";
    }
}