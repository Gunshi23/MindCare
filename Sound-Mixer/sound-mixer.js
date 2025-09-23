 document.addEventListener('DOMContentLoaded', async () => {
            const masterPlayPauseBtn = document.getElementById('masterPlayPause');
            const soundItems = document.querySelectorAll('.sound-item');
            const themeToggle = document.getElementById('theme-toggle');
            const body = document.body;

            let isPlaying = false;

            // Tone.js audio players
            const players = {};
            
            // Tone.js master volume control
            const masterVolume = new Tone.Volume(-12).toDestination();

            // --- Theme Toggle Logic ---
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
            
            // --- Audio Initialization ---
            const initSounds = async () => {
                await Tone.start();
                console.log("AudioContext started successfully.");

                // Create Tone.Player instances from the HTML audio elements
                soundItems.forEach(item => {
                    const soundName = item.dataset.sound;
                    const audioEl = document.getElementById(`audio-${soundName}`);
                    
                    const player = new Tone.Player(audioEl.src).connect(masterVolume);
                    player.loop = true;
                    player.volume.value = -30; // Start muted
                    players[soundName] = player;
                    
                    // The actual HTML audio element is now just a source.
                    // We can remove it from the DOM or hide it.
                    audioEl.remove();
                });
            };

            // --- Main Play/Pause and Volume Control Logic ---
            const playAll = () => {
                 Object.values(players).forEach(player => {
                    if (player.state !== "started") {
                        player.start();
                    }
                });
            };
            
            const pauseAll = () => {
                Object.values(players).forEach(player => player.stop());
            };

            masterPlayPauseBtn.addEventListener('click', async () => {
                 // The first interaction starts the Tone context and initializes the players
                if (Object.keys(players).length === 0) {
                    await initSounds();
                }

                if (!isPlaying) {
                    playAll();
                    masterPlayPauseBtn.querySelector('.material-icons').textContent = 'pause';
                } else {
                    pauseAll();
                    masterPlayPauseBtn.querySelector('.material-icons').textContent = 'play_arrow';
                }
                isPlaying = !isPlaying;
            });

            soundItems.forEach(item => {
                const range = item.querySelector('input[type="range"]');
                const soundName = item.dataset.sound;

                range.addEventListener('input', (e) => {
                    if (players[soundName]) {
                         // Convert linear slider value to logarithmic decibels
                        const value = parseFloat(e.target.value);
                        const db = value > 0 ? 20 * Math.log10(value) : -100;
                        players[soundName].volume.value = db;

                        // Start/stop individual sounds based on volume
                        if (isPlaying && value > 0 && players[soundName].state !== "started") {
                            players[soundName].start();
                        } else if (value == 0 && players[soundName].state === "started") {
                             players[soundName].stop();
                        }
                    }
                });
            });

        });