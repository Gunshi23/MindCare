// Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Log all Firestore actions to the console for debugging.
setLogLevel('Debug');

let firebaseApp, auth, db, userId;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

const journalPrompts = [
    "Gratitude List: Write down three things you are grateful for today and explain why each one is meaningful to you.",
    "Looking Forward: Write about something you're looking forward to in the near future. How does anticipating this event or experience make you feel?",
    "Positive Moments: Reflect on a recent moment that made you smile or feel joy. Describe the experience in detail and why it had a positive impact on you.",
    "Personal Strengths: List five of your strengths or qualities you are proud of. How have these strengths helped you in your life?",
    "Happy Place: Describe a place where you feel most at peace or happiest. What makes this place special to you?",
    "Accomplishments: Reflect on a recent accomplishment, no matter how small. How did achieving this make you feel, and what did you learn from it?",
    "Support System: Write about the people in your life who support and uplift you. What do you appreciate most about each of them?",
    "Favorite Memory: Recall a favorite memory that brings you joy. Describe it in detail and reflect on why it stands out to you."
];

const moodEmojis = {
    'happy': '😊',
    'calm': '😌',
    'sad': '😞',
    'anxious': '😬',
    'excited': '🤩',
    'angry': '😡'
};
const moodColors = {
    'happy': '#22C55E', // Green
    'calm': '#3B82F6',  // Blue
    'sad': '#A855F7',   // Purple
    'anxious': '#EF4444', // Red
    'excited': '#F97316', // Orange
    'angry': '#DC2626'  // Dark Red
};
const pastelColors = [
    '#FFB6C1', '#FFDAB9', '#E6E6FA', '#ADD8E6', '#F08080', '#90EE90', '#D3D3D3', '#FF69B4', '#FFA07A', '#B0C4DE', '#F5DEB3'
];
let selectedMood = '';
const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into', 'is', 'it', 'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the', 'their', 'then', 'there', 'these', 'they', 'this', 'to', 'was', 'will', 'with', 'i', 'my', 'me', 'am', 'you', 'your', 'he', 'she', 'his', 'her', 'we', 'our', 'us', 'it', 'its', 'they', 'their', 'them', 'from', 'about', 'just', 'so', 'what', 'like', 'feel', 'feeling', 'one', 'two', 'three', 'five', 'with', 'all', 'had', 'have', 'has', 'were', 'been', 'can', 'could', 'would', 'should', 'wouldn', 'shouldn', 'couldn', 'wasn', 'weren'
]);

document.addEventListener('DOMContentLoaded', async () => {
    if (Object.keys(firebaseConfig).length > 0) {
        try {
            firebaseApp = initializeApp(firebaseConfig);
            auth = getAuth(firebaseApp);
            db = getFirestore(firebaseApp);

            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    userId = user.uid;
                    document.getElementById('user-id').textContent = 'User ID: ' + userId;
                    console.log('User signed in with ID:', userId);
                    // Move the initialization calls inside here
                    initializeJournal();
                    initializeGratitude();
                    initializeLookingForward();
                    initializePositiveMoments();
                    initializePersonalStrengths();
                    initializeHappyPlace();
                    initializeAccomplishments();
                    initializeSupportSystem();
                    initializeFavoriteMemory();
                    initializeImageUpload();
                    generateWordCloud();
                } else {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        await signInAnonymously(auth);
                    }
                }
            });

        } catch (e) {
            console.error("Error initializing Firebase:", e);
            showModal("Error", "Failed to initialize Firebase. Please check the console for details.");
        }
    } else {
        showModal("Error", "Firebase configuration is missing.");
    }
});

async function initializeJournal() {
    if (!db || !userId) {
        console.error('Firebase DB or User ID not available.');
        return;
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const journalDocRef = doc(db, `/artifacts/${appId}/users/${userId}/journal_entries/${todayStr}`);

    const docSnapshot = await getDoc(journalDocRef);
    if (docSnapshot.exists()) {
         const data = docSnapshot.data();
         document.getElementById('journal-prompt').textContent = data.prompt;
         document.getElementById('journal-entry-text').value = data.entry || '';
         document.getElementById('last-updated').textContent = data.lastUpdated ? `Last updated: ${new Date(data.lastUpdated).toLocaleString()}` : '';
         selectedMood = data.mood || '';
         updateMoodButtons();
    } else {
         console.log('No entry found for today. Generating new prompt.');
         await generateNewPrompt(journalDocRef, todayStr);
    }
    
    // Now set up the real-time listener for ongoing changes
    onSnapshot(journalDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            document.getElementById('journal-prompt').textContent = data.prompt;
            document.getElementById('journal-entry-text').value = data.entry || '';
            document.getElementById('last-updated').textContent = data.lastUpdated ? `Last updated: ${new Date(data.lastUpdated).toLocaleString()}` : '';
            selectedMood = data.mood || '';
            updateMoodButtons();
        }
    }, (error) => {
        console.error('Error listening to document:', error);
        showModal("Error", "Could not fetch today's journal entry. Please try again.");
    });

    document.getElementById('save-button').addEventListener('click', () => saveJournalEntry(journalDocRef, todayStr));
    document.getElementById('view-past-entries-button').addEventListener('click', viewPastEntries);
    
    document.querySelectorAll('.mood-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            selectedMood = e.target.dataset.mood;
            updateMoodButtons();
        });
    });

    // Initial animation for the main card
    anime({
        targets: '#main-card',
        translateY: [-50, 0],
        opacity: [0, 1],
        easing: 'easeOutQuad',
        duration: 800,
        delay: 200
    });
}

async function initializeGratitude() {
    const gratitudeDocPath = `/artifacts/${appId}/users/${userId}/journal_entries/gratitude`;
    onSnapshot(doc(db, gratitudeDocPath), (docSnapshot) => {
        if (docSnapshot.exists()) {
            document.getElementById('gratitude-list-text').value = docSnapshot.data().content || '';
        }
    });
    document.getElementById('save-gratitude-button').addEventListener('click', () => saveSection('gratitude', 'gratitude-list-text'));
}

async function initializeLookingForward() {
    const docPath = `/artifacts/${appId}/users/${userId}/journal_entries/looking_forward`;
    onSnapshot(doc(db, docPath), (docSnapshot) => {
        if (docSnapshot.exists()) {
            document.getElementById('looking-forward-text').value = docSnapshot.data().content || '';
        }
    });
    document.getElementById('save-looking-forward-button').addEventListener('click', () => saveSection('looking_forward', 'looking-forward-text'));
}

async function initializePositiveMoments() {
    const docPath = `/artifacts/${appId}/users/${userId}/journal_entries/positive_moments`;
    onSnapshot(doc(db, docPath), (docSnapshot) => {
        if (docSnapshot.exists()) {
            document.getElementById('positive-moments-text').value = docSnapshot.data().content || '';
        }
    });
    document.getElementById('save-positive-moments-button').addEventListener('click', () => saveSection('positive_moments', 'positive-moments-text'));
}

async function initializePersonalStrengths() {
    const docPath = `/artifacts/${appId}/users/${userId}/journal_entries/personal_strengths`;
    onSnapshot(doc(db, docPath), (docSnapshot) => {
        if (docSnapshot.exists()) {
            document.getElementById('personal-strengths-text').value = docSnapshot.data().content || '';
        }
    });
    document.getElementById('save-personal-strengths-button').addEventListener('click', () => saveSection('personal_strengths', 'personal-strengths-text'));
}

async function initializeHappyPlace() {
    const docPath = `/artifacts/${appId}/users/${userId}/journal_entries/happy_place`;
    onSnapshot(doc(db, docPath), (docSnapshot) => {
        if (docSnapshot.exists()) {
            document.getElementById('happy-place-text').value = docSnapshot.data().content || '';
        }
    });
    document.getElementById('save-happy-place-button').addEventListener('click', () => saveSection('happy_place', 'happy-place-text'));
}

async function initializeAccomplishments() {
    const docPath = `/artifacts/${appId}/users/${userId}/journal_entries/accomplishments`;
    onSnapshot(doc(db, docPath), (docSnapshot) => {
        if (docSnapshot.exists()) {
            document.getElementById('accomplishments-text').value = docSnapshot.data().content || '';
        }
    });
    document.getElementById('save-accomplishments-button').addEventListener('click', () => saveSection('accomplishments', 'accomplishments-text'));
}

async function initializeSupportSystem() {
    const docPath = `/artifacts/${appId}/users/${userId}/journal_entries/support_system`;
    onSnapshot(doc(db, docPath), (docSnapshot) => {
        if (docSnapshot.exists()) {
            document.getElementById('support-system-text').value = docSnapshot.data().content || '';
        }
    });
    document.getElementById('save-support-system-button').addEventListener('click', () => saveSection('support_system', 'support-system-text'));
}

async function initializeFavoriteMemory() {
    const docPath = `/artifacts/${appId}/users/${userId}/journal_entries/favorite_memory`;
    onSnapshot(doc(db, docPath), (docSnapshot) => {
        if (docSnapshot.exists()) {
            document.getElementById('favorite-memory-text').value = docSnapshot.data().content || '';
        }
    });
    document.getElementById('save-favorite-memory-button').addEventListener('click', () => saveSection('favorite_memory', 'favorite-memory-text'));
}

async function initializeImageUpload() {
    const today = new Date().toISOString().split('T')[0];
    const imageDocPath = `/artifacts/${appId}/users/${userId}/journal_images/${today}`;
    const imageInput = document.getElementById('image-upload-input');
    const imagePreview = document.getElementById('image-preview');
    const saveButton = document.getElementById('save-image-button');
    const fileNameSpan = document.getElementById('image-file-name');

    // Listen for changes in the image file input
    imageInput.addEventListener('change', () => {
        const file = imageInput.files[0];
        if (file) {
            fileNameSpan.textContent = file.name;
            const reader = new FileReader();
            reader.onloadend = () => {
                imagePreview.src = reader.result;
                imagePreview.classList.remove('hidden');
                saveButton.disabled = false;
                saveButton.classList.remove('opacity-50', 'cursor-not-allowed');
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.src = '';
            imagePreview.classList.add('hidden');
            fileNameSpan.textContent = 'No file chosen';
            saveButton.disabled = true;
            saveButton.classList.add('opacity-50', 'cursor-not-allowed');
        }
    });

    // Load saved image from Firestore
    onSnapshot(doc(db, imageDocPath), (docSnapshot) => {
        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            if (data.imageData) {
                imagePreview.src = data.imageData;
                imagePreview.classList.remove('hidden');
            }
            if (data.fileName) {
                fileNameSpan.textContent = data.fileName;
            }
        }
    });

    // Save image to Firestore
    saveButton.addEventListener('click', async () => {
        const file = imageInput.files[0];
        if (!file) {
            showModal("Error", "Please select an image to upload.");
            return;
        }
        if (file.size > 1000000) { // Check file size (1 MB)
            showModal("Error", "Image size exceeds 1MB. Please choose a smaller image.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const imageData = reader.result;
            try {
                await setDoc(doc(db, imageDocPath), {
                    imageData: imageData,
                    fileName: file.name,
                    timestamp: new Date().toISOString()
                });
                console.log("Image saved successfully!");
                showModal("Success", "Your image has been saved!");
            } catch (e) {
                console.error("Error saving image:", e);
                showModal("Error", "Failed to save your image. Please try again.");
            }
        };
        reader.readAsDataURL(file);
    });
}

async function saveSection(sectionName, textareaId) {
    const content = document.getElementById(textareaId).value;
    if (!content.trim()) {
        showModal("Info", `The ${sectionName.replace('_', ' ')} entry cannot be empty.`);
        return;
    }

    const docPath = `/artifacts/${appId}/users/${userId}/journal_entries/${sectionName}`;
    try {
        await setDoc(doc(db, docPath), {
            content: content
        }, { merge: true });
        console.log(`${sectionName} list saved successfully!`);
        showModal("Success", `${sectionName.replace('_', ' ')} saved!`);
        generateWordCloud(); // Regenerate word cloud on save
    } catch (e) {
        console.error(`Error saving ${sectionName} list:`, e);
        showModal("Error", `Failed to save ${sectionName.replace('_', ' ')}. Please try again.`);
    }
}

function updateMoodButtons() {
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.mood === selectedMood) {
            btn.classList.add('selected');
        }
    });
}

async function generateNewPrompt(docRef, dateStr) {
    const promptIndex = dateStr.split('-').reduce((sum, val) => sum + parseInt(val), 0) % journalPrompts.length;
    const newPrompt = journalPrompts[promptIndex];
    selectedMood = '';

    const entryData = {
        prompt: newPrompt,
        entry: '',
        lastUpdated: new Date().toISOString(),
        date: dateStr,
        timestamp: new Date(),
        mood: ''
    };

    try {
        await setDoc(docRef, entryData);
        document.getElementById('journal-prompt').textContent = newPrompt;
        document.getElementById('journal-entry-text').value = '';
        document.getElementById('last-updated').textContent = '';
        updateMoodButtons();
        showModal("New Entry", "A new journal prompt has been generated for you!");
    } catch (e) {
        console.error("Error generating new prompt:", e);
        showModal("Error", "Failed to generate a new prompt. Please try again later.");
    }
}

async function saveJournalEntry(docRef, dateStr) {
    const entryText = document.getElementById('journal-entry-text').value;
    if (!entryText.trim()) {
        showModal("Info", "The journal entry cannot be empty.");
        return;
    }

    try {
        await setDoc(docRef, {
            entry: entryText,
            lastUpdated: new Date().toISOString(),
            mood: selectedMood
        }, { merge: true });
        console.log("Journal entry saved successfully!");
        generateWordCloud(); // Regenerate word cloud on save
    } catch (e) {
        console.error("Error saving document:", e);
        showModal("Error", "Failed to save your journal entry. Please check your connection and try again.");
    }
}

async function viewPastEntries() {
    const entriesList = document.getElementById('past-entries-list');
    entriesList.innerHTML = '';
    showModal("Past Entries", "Loading your past journal entries...", true);

    try {
        const entriesRef = collection(db, `/artifacts/${appId}/users/${userId}/journal_entries`);
        const q = query(entriesRef);
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            entriesList.innerHTML = '<p class="text-gray-500 text-center">No past entries found.</p>';
        } else {
            const entries = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Client-side sorting
            entries.sort((a, b) => new Date(b.date) - new Date(a.date));

            entries.forEach(entry => {
                const li = document.createElement('li');
                li.className = 'p-4 my-2 border border-gray-200 rounded-lg shadow-sm bg-white cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center';
                li.innerHTML = `
                    <div class="flex-grow">
                        <h3 class="font-bold text-lg text-blue-900">${entry.date}</h3>
                        <p class="text-gray-600 mt-1">${entry.prompt}</p>
                    </div>
                    <div class="text-3xl">${moodEmojis[entry.mood] || ''}</div>
                    <div class="mt-4 hidden past-entry-details">
                        <p class="text-gray-800 whitespace-pre-wrap">${entry.entry}</p>
                    </div>
                `;
                li.addEventListener('click', () => {
                    const details = li.querySelector('.past-entry-details');
                    details.classList.toggle('hidden');
                });
                entriesList.appendChild(li);
            });
        }
        document.getElementById('past-entries-modal-content').classList.remove('hidden');
        document.getElementById('modal-loading').classList.add('hidden');
    } catch (e) {
        console.error("Error fetching past entries:", e);
        document.getElementById('past-entries-list').innerHTML = '<p class="text-red-500 text-center">Failed to load past entries.</p>';
    }
}

async function generateWordCloud() {
    const wordCloudCanvas = document.getElementById('word-cloud-canvas');
    if (!wordCloudCanvas) return;

    try {
        const entriesRef = collection(db, `/artifacts/${appId}/users/${userId}/journal_entries`);
        const querySnapshot = await getDocs(entriesRef);

        const wordMoods = {};

        // Process all entries, including the dedicated sections
        querySnapshot.docs.forEach(doc => {
            const data = doc.data();
            let entryText = '';
            let mood = 'none';

            if (data.content) {
                entryText = data.content;
            } else if (data.entry) {
                entryText = data.entry;
                mood = data.mood || 'none';
            }

            if (entryText) {
                entryText.toLowerCase().split(/\s+/).forEach(word => {
                    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
                    if (cleanWord && !stopWords.has(cleanWord)) {
                        if (!wordMoods[cleanWord]) {
                            wordMoods[cleanWord] = { count: 0, moods: new Set() };
                        }
                        wordMoods[cleanWord].count++;
                        if (mood !== 'none') {
                            wordMoods[cleanWord].moods.add(mood);
                        }
                    }
                });
            }
        });

        const wordList = Object.keys(wordMoods).sort((a, b) => wordMoods[b].count - wordMoods[a].count).slice(0, 50).map((word, index) => {
            const count = wordMoods[word].count;
            const moods = [...wordMoods[word].moods];
            let color;

            // Prioritize mood color if available
            if (moods.length > 0) {
                color = moodColors[moods[0]] || pastelColors[index % pastelColors.length];
            } else {
                color = pastelColors[index % pastelColors.length];
            }

            return [word, count, color];
        });

        if (wordList.length > 0) {
            WordCloud(wordCloudCanvas, {
                list: wordList,
                gridSize: 16,
                weightFactor: (size) => Math.pow(size, 0.8) * 10,
                fontFamily: 'Quicksand, sans-serif',
                color: (word, weight) => {
                    const found = wordList.find(item => item[0] === word);
                    return found ? found[2] : '#333';
                },
                rotateRatio: 0, // No rotation for a more structured look
                minRotation: 0,
                maxRotation: 0,
                clearCanvas: true
            });
        } else {
            const ctx = wordCloudCanvas.getContext('2d');
            ctx.font = '20px Quicksand';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#6B7280';
            ctx.fillText('Start writing to see your word cloud!', wordCloudCanvas.width / 2, wordCloudCanvas.height / 2);
        }
    } catch (e) {
        console.error("Error generating word cloud:", e);
        const ctx = wordCloudCanvas.getContext('2d');
        ctx.font = '20px Quicksand';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#DC2626';
        ctx.fillText('Failed to load word cloud.', wordCloudCanvas.width / 2, wordCloudCanvas.height / 2);
    }
}

function showModal(title, message, isLoading = false) {
    const modal = document.getElementById('my-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const pastEntriesContent = document.getElementById('past-entries-modal-content');
    const loadingIndicator = document.getElementById('modal-loading');
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;

    if (title === "Past Entries") {
        pastEntriesContent.classList.remove('hidden');
        loadingIndicator.classList.toggle('hidden', !isLoading);
        modalMessage.classList.add('hidden');
    } else {
        pastEntriesContent.classList.add('hidden');
        loadingIndicator.classList.add('hidden');
        modalMessage.classList.remove('hidden');
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

document.getElementById('close-modal-button').addEventListener('click', () => {
    const modal = document.getElementById('my-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
});
