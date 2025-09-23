// Your Firebase configuration - Updated to match login page
const firebaseConfig = {
    apiKey: "AIzaSyCf0R6MzfRgfZiSc07ZUPgA1e5saL_LbG8",
    authDomain: "mindcare-sih-c28d9.firebaseapp.com",
    databaseURL: "https://mindcare-sih-c28d9-default-rtdb.firebaseio.com",
    projectId: "mindcare-sih-c28d9",
    storageBucket: "mindcare-sih-c28d9.firebasestorage.app",
    messagingSenderId: "144494054630",
    appId: "1:144494054630:web:f67581a9466b9b27e97f27"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app();
}

const auth = firebase.auth();
const database = firebase.database();

// Corrected mode toggle functionality
const body = document.body;
// Get the existing button from the HTML
const modeToggle = document.getElementById('mode-toggle');

modeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
});

// Affirmations array
const affirmations = [
    "You are capable of amazing things. Every small step forward is progress worth celebrating.",
    "Your worth is not measured by your productivity. You are enough just as you are.",
    "It's okay to not be okay. Healing is a journey, not a race.",
    "You have the power to create your own happiness.",
    "Challenges are opportunities in disguise. You are strong enough to overcome them.",
    "Be patient and gentle with yourself. You are doing the best you can.",
    "Your feelings are valid. Take the time to acknowledge and process them.",
    "Today is a new day, and a fresh start. You can handle what comes your way.",
    "You are not alone. There are people who care about you and want to help.",
    "You are a survivor. Remember the strength you have within."
];

// Listen for changes in the user's sign-in state
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in, fetch their data and display a random affirmation
        fetchUserData(user.uid);
        fetchMoodData(user.uid);
        displayRandomAffirmation();
    } else {
        // No user is signed in, redirect to login page
        window.location.href = "login.html";
    }
});

// Function to fetch user data from Realtime Database
async function fetchUserData(uid) {
    try {
        // Corrected Firebase path syntax
        const userSnapshot = await database.ref(`users/${uid}`).once('value');
        const userData = userSnapshot.val();

        if (userData) {
            // Corrected template literal syntax
            document.getElementById('user-name-header').textContent = userData.name;
            document.getElementById('welcome-message').textContent = `Welcome back, ${userData.name}! 👋`;
            
            if (userData.journalStreak) {
                document.getElementById('journal-streak').textContent = userData.journalStreak + " days";
            }
            if (userData.activitiesCompleted) {
                document.getElementById('activities-completed').textContent = userData.activitiesCompleted + " this week";
            }
            if (userData.moodAverage) {
                document.getElementById('mood-average').textContent = userData.moodAverage;
            }
            if (userData.forumPosts) {
                document.getElementById('forum-posts').textContent = userData.forumPosts + " helpful";
            }
        } else {
            console.error("No such user document!");
        }
    } catch (error) {
        console.error("Error fetching user data: ", error);
    }
}

// Function to fetch and display mood data from Realtime Database
async function fetchMoodData(uid) {
    try {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        
        // Corrected Firebase path syntax
        const moodSnapshot = await database.ref(`mentalHealth/${uid}/dailyData`).once('value');
        const moodData = moodSnapshot.val();

        const chartContainer = document.getElementById('mood-chart');
        chartContainer.innerHTML = ''; // Clear existing bars

        if (moodData) {
            // Convert mood data to array format similar to original Firestore structure
            const moodEntries = Object.keys(moodData)
                .filter(date => new Date(date) >= sevenDaysAgo)
                .map(date => ({
                    timestamp: { toDate: () => new Date(date) },
                    mood: getMoodText(moodData[date].moodScore || 5)
                }));

            if (moodEntries.length > 0) {
                // Updated to match the mood scale in the original code
                const moodScale = {
                    "Very Poor": 1,
                    "Poor": 2,
                    "Okay": 3,
                    "Good": 4,
                    "Excellent": 5
                };
                const maxMoodValue = 5;
                
                // Get day names for labels
                const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                
                // Create an array to hold mood values for each day of the week
                const weeklyMoods = Array(7).fill([]);
                
                moodEntries.forEach(entry => {
                    const entryDate = entry.timestamp.toDate();
                    const dayIndex = entryDate.getDay() === 0 ? 6 : entryDate.getDay() - 1;
                    weeklyMoods[dayIndex] = [...weeklyMoods[dayIndex], moodScale[entry.mood] || 3];
                });
                
                weeklyMoods.forEach((dayEntries, index) => {
                    const dayLabel = dayNames[index];
                    const avgMood = dayEntries.length > 0 ? dayEntries.reduce((sum, val) => sum + val, 0) / dayEntries.length : 0;
                    
                    const barHeight = (avgMood / maxMoodValue) * 100;
                    const barWrapper = document.createElement('div');
                    barWrapper.style.display = 'flex';
                    barWrapper.style.flexDirection = 'column';
                    barWrapper.style.justifyContent = 'flex-end';
                    barWrapper.style.alignItems = 'center';
                    barWrapper.style.gap = '5px';
                    barWrapper.style.flex = '1';
                    
                    const bar = document.createElement('div');
                    bar.className = 'mood-bar';
                    bar.style.height = barHeight + '%';
                    
                    // Add color-coding to the bars
                    let barColor = 'var(--accent-color-light)';
                    if (avgMood >= 4) { barColor = '#4caf50'; } // Green for Good/Excellent
                    else if (avgMood >= 3) { barColor = '#ffc107'; } // Yellow for Okay
                    else if (avgMood > 0) { barColor = '#f44336'; } // Red for Poor/Very Poor
                    bar.style.backgroundColor = barColor;
                    
                    // Corrected template literal syntax
                    bar.title = `${dayLabel}: ${avgMood.toFixed(1)}/5`;
                    
                    const label = document.createElement('span');
                    label.textContent = dayLabel;
                    label.style.fontSize = '12px';
                    label.style.color = 'var(--secondary-text-light)';
                    
                    barWrapper.appendChild(bar);
                    barWrapper.appendChild(label);
                    chartContainer.appendChild(barWrapper);
                });
                
            } else {
                chartContainer.innerHTML = '<p style="text-align: center; color: var(--secondary-text-light);">No mood data found for the last 7 days.</p>';
            }
        } else {
            chartContainer.innerHTML = '<p style="text-align: center; color: var(--secondary-text-light);">No mood data found for the last 7 days.</p>';
        }

    } catch (error) {
        console.error("Error fetching mood data: ", error);
        document.getElementById('mood-chart').innerHTML = '<p style="color: red; text-align: center;">Failed to load mood data.</p>';
    }
}

// Helper function to convert mood score to text
function getMoodText(score) {
    if (score >= 9) return "Excellent";
    if (score >= 7) return "Good";
    if (score >= 5) return "Okay";
    if (score >= 3) return "Poor";
    return "Very Poor";
}

// Function to display a random daily affirmation
function displayRandomAffirmation() {
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    const affirmationText = affirmations[randomIndex];
    // Corrected template literal syntax
    document.querySelector('.daily-affirmation span').textContent = `${affirmationText}`;
}

// Log out functionality
document.getElementById('logout-button').addEventListener('click', async () => {
    try {
        await auth.signOut();
        window.location.href = "/Login/login.html";
    } catch (error) {
        console.error("Error logging out: ", error);
        alert("Failed to log out. Please try again.");
    }
});

// Redirect 'Screening' quick action to mood-tracker.html
document.querySelector('.quick-actions-grid a:nth-child(1)').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = "/Screening-Tools/screening.html";
});